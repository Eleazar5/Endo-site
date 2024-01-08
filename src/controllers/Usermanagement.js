const bcrypt = require('bcryptjs');
const path = require('path');
const connection = require('../helpers/dbConfig');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const moment = require("moment");
const cron = require('node-cron');
const {
    transformPhoneNumber,
    generateOTP,
    validateOTP,
    sendEmail,
    appendToLogFile,
    runScriptFile
} = require('../helpers/General');

const { 
    DB_USER,
    DB_PASS,
    DB_NAME,
    SECRETKEY,
    saveDatabaseBackup
} = process.env;

exports.updateAuthCrons = () => {
    const clearTrials = cron.schedule('* * * * * *', () => {
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const updateQuery = `
            UPDATE tb_users 
            SET login_trials = 0,
            update_at = ?
            WHERE login_trials >= 5 
            AND DATE_ADD(last_login, INTERVAL 5 MINUTE) <= ?;
            `;
        
        connection.query(updateQuery, [currentTime, currentTime], (error, results) => {
            if (error) {
                console.error('Error updating users:', error);
                return;
            }
        
            if (results.affectedRows > 0) {
                console.log(`Updated ${results.affectedRows} users.`);
                appendToLogFile(`Updated ${results.affectedRows} users.`)
            }
        });
    });

    const dbBackup = cron.schedule('0 0 * * *', () => {
        const backupFilePath = path.join(__dirname, '..', 'library/database_backups', `backup-${moment().format('YYYY-MM-DD')}.sql`);

        const scriptmsg = "Database backup done";
        const command = `mysqldump -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > "${backupFilePath}"`;
        if(saveDatabaseBackup == "true"){
            runScriptFile(command, scriptmsg);
        }
    });

    clearTrials.start();
    dbBackup.start();    
    return;
}

exports.signup = (req, res) => {
    const {
        email,
        firstname,
        lastname,
        password
    } = req.body;
    if(!email ||!firstname ||!lastname ||!password){
        const resObject = {
            errorDesc:"Email, First Name, Last Name and Password are required",
            success:"0"
        };
        return res.status(400).send(resObject)
    }
    if(password.length < 6) {  
        const resObject = {
            errorDesc:"The password length should greater than 6",
            success:"0"
        };
        return res.status(400).send(resObject) 
    }

    //  check if user already exist
    checkuserQuery = 'SELECT * FROM tb_users WHERE email = ?'
    connection.query(checkuserQuery,  [email], function(err, rows){
      if(err) {
        return res.send("Error in getting "+email);
      }else{
        if (!rows.length){
            const insertQuery = `INSERT INTO tb_users (email, firstname, lastname, password) VALUES (?, ?, ?, ?)`;
            const insertValues = [email, firstname, lastname, bcrypt.hashSync(password, salt)];
            connection.query(insertQuery , insertValues, function(err, results){
                const resObject = {
                    errorDesc: "Record has been created",
                    success:"1"
                };
                appendToLogFile( email+" has been registered");
                return res.status(200).send(resObject)
            });
        }else{
            const resObject = {
                errorDesc: email+" is already registered",
                success:"0"
            };
            return res.status(400).send(resObject);
        }
       }
    });
};

exports.signin = (req, res) => {
    const {
        email,
        password
    } = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    var sql = "SELECT * FROM tb_users WHERE email= ? AND login_trials <= 5"
    var values = [email];
    connection.query(sql, values, function(error,rows, fields){
        if(error) {
            return res.send("Error in signing the user");
        }else { 
            if(rows.length > 0) { 
                bcrypt.compare(password, rows[0].password, function(error, result) {
                if(result) {
                    const authOTP = generateOTP();
                    const subject = "Auth OTP";
                    const mailbody = `<b>${authOTP}</b> is your verification code`
                    sendEmail(email, subject, mailbody);

                    const updateQuery = `UPDATE tb_users SET auth_otp =?, otp_createdat =? WHERE email=?`;
                    const updateValues = [authOTP, currentTime, email];
                    connection.query(updateQuery , updateValues, function(err, results){
                        const resObject = {
                            errorDesc: "An otp has been send to your email, confirm by inputing the otp",
                            success:"1"
                        };
                        return res.status(200).send(resObject)
                    });
                }
                else {
                    const resObject = {
                        errorDesc: "Invalid details",
                        success:"0"
                    };
                    return res.status(400).send(resObject);
                }
              });
            } else {
                const resObject = {
                    errorDesc: "Too many attempts. Please try again after 5 minutes",
                    success:"0"
                };
                return res.status(400).send(resObject);
            } 
        }
    });
};

exports.otpAuth = (req, res) => {
    const {
        email,
        auth_otp
    } = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    var sql = "SELECT * FROM tb_users WHERE email= ? AND auth_otp= ? AND login_trials <= 5"
    var values = [email, auth_otp];
    connection.query(sql, values, function(error,rows, fields){
        if(error) {
            return res.send("Error in signing the user");
        }else { 
            if(rows.length > 0) {
                const validOTP = validateOTP(email, rows[0].otp_createdat, 5);

                if(validOTP){
                    const updateQuery = `UPDATE tb_users SET last_login =?, login_trials =0 WHERE email=?`;
                    const updateValues = [currentTime, email];
                    
                    connection.query(updateQuery , updateValues, function(err, results){
                        const token = jwt.sign({email: email}, SECRETKEY, {expiresIn: 60 * 60 * 1});  //expires in 1 hour
                        const resObject = {
                            id: rows[0].id,
                            email: rows[0].email,
                            firstname: rows[0].firstname,
                            lastname: rows[0].lastname,
                            phone_number: rows[0].phone_number
                        };
                        req.session.isAuth = true;
                        return res.send({
                            user: resObject,
                            token: token, 
                            success:"1"
                        });
                    });
                }else{
                    const updateQuery = `UPDATE tb_users SET login_trials =?, last_login =? WHERE email=?`;
                    const updatedLoginTrials = (rows[0].login_trials) + 1;
                    const updateValues = [updatedLoginTrials, currentTime, email];

                    connection.query(updateQuery , updateValues, function(err, results){
                        const resObject = {
                            errorDesc: "The otp entered is invalid or has expired",
                            success:"0"
                        };
                        return res.send(resObject);
                    });
                }
                
            } else {
                const updateQuery = `UPDATE tb_users SET login_trials =login_trials + 1, last_login =? WHERE email=?`;
                const updateValues = [currentTime, email];

                connection.query(updateQuery , updateValues, function(err, results){
                    const resObject = {
                        errorDesc: "Otp confirmation failed or you have exceeded the number of trials",
                        success:"0"
                    };
                    return res.send(resObject);
                });
            } 
        }
    });
};

exports.getusers = (req, res) => {
    var sql = "SELECT * FROM tb_users"
    connection.query(sql, function(error,rows, fields){
        if(error) {
            return res.send("Error in getting the users");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};

exports.getuserspagination = (req, res) => {
    const { page = 1, limit = 2, searchTerm = "" } = req.query;
    const offset = (page - 1) * limit;

    var sql = "SELECT * FROM tb_users ORDER BY id ASC LIMIT ?, ?"
    if (searchTerm) {
        sql = `SELECT * FROM tb_users WHERE email LIKE '%${searchTerm}%' OR phone_number LIKE '%${transformPhoneNumber(searchTerm)}%' OR firstname LIKE '%${searchTerm}%' OR lastname LIKE '%${searchTerm}%' OR created_at LIKE '%${searchTerm}%' ORDER BY id ASC LIMIT ?, ?`;
    }

    connection.query(sql, [offset, Number(limit)], function(error,rows){
        if(error) {
            return res.send("Error in getting the users");
        }else { 
            const resObject = {
                data: rows,
                success:"1"
            };
            return res.status(200).send(resObject);
        }
    });
};

exports.uploadFile = (req, res) => {
    const filename = req.file.filename;
    console.log(filename);
    res.send(filename);
};