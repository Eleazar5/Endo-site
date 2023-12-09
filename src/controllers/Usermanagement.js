const bcrypt = require('bcryptjs');
const connection = require('../helpers/dbConfig');
const salt = bcrypt.genSaltSync(10);

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