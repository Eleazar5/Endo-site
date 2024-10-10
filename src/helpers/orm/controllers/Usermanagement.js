const bcrypt = require('bcryptjs');
const path = require('path');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const moment = require("moment");
const cron = require('node-cron');
const geoip = require('geoip-lite');

const { User } = require('../models')
const { Op } = require('sequelize');

const {
    transformPhoneNumber,
    capitalizeFirstLetter,
    generateOTP,
    validateOTP,
    sendEmail,
    appendToLogFile,
    appendToLogFileNewUsers,
    runScriptFile,
    fileToBase64Converter,
    getPublicIP
} = require('../../General');

const { 
    DB_USER,
    DB_PASS,
    DB_NAME,
    SECRETKEY,
    saveDatabaseBackup
} = process.env;

exports.updateAuthCrons = () => {
    const clearTrials = cron.schedule('* * * * * *', async () => {
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
            // Update users' login trials
            const users = await User.update(
                { login_trials: 0, updated_at: currentTime },
                {
                    where: {
                        login_trials: { [Op.gte]: 5 },
                        last_login: { [Op.lte]: moment().subtract(5, 'minutes').toDate() }
                    }
                });

            if (users[0] > 0) {
                console.log(`Updated ${users[0]} users.`);
                appendToLogFile(`Updated ${users[0]} users.`);
            }
        } catch (error) {
            console.error('Error updating users:', error);
        }
    });

    const dbBackup = cron.schedule('0 0 * * *', () => {
        const backupFilePath = path.join(__dirname, '..', '../library/database_backups', `backup-${moment().format('YYYY-MM-DD')}.sql`);

        const scriptmsg = "Database backup done";
        const command = `mysqldump -u ${DB_USER} -p${DB_PASS} ${DB_NAME} > "${backupFilePath}"`;
        if (saveDatabaseBackup == "true") {
            runScriptFile(command, scriptmsg);
        }
    });

    clearTrials.start();
    dbBackup.start();
    return;
};

exports.signup = async (req, res) => {
    const { email, firstname, lastname, phone, password } = req.body;

    // Check if required fields are provided
    if (!email || !firstname || !lastname || !password) {
        return res.status(200).send({
            errorDesc: "Email, First Name, Last Name, and Password are required",
            success: "0"
        });
    }

    // Check if password length is valid
    if (password.length < 6) {
        return res.status(200).send({
            errorDesc: "The password length should be greater than 6",
            success: "0"
        });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(200).send({
                errorDesc: `${email} is already registered`,
                success: "0"
            });
        }

        // Create new user
        const hashedPassword = bcrypt.hashSync(password, salt);
        await User.create({
            email,
            firstname,
            lastname,
            phone_number: phone,
            password: hashedPassword,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
        });

        // Log the new user registration
        appendToLogFile(`${email} has been registered`);

        return res.status(200).send({
            errorDesc: "Record has been created",
            success: "1"
        });

    } catch (err) {
        console.error("Error during signup:", err);
        return res.status(500).send({
            errorDesc: "Error during signup, please try again",
            success: "0"
        });
    }
};

// Signin with OTP generation
exports.signin = async (req, res) => {
    const { email, password } = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(200).send({
                errorDesc: "User not found. Sign up to continue",
                success: "0"
            });
        }

        // Check if user has exceeded login trials
        if (user.login_trials > 5) {
            return res.status(200).send({
                errorDesc: "Too many attempts. Please try again after 5 minutes",
                success: "0"
            });
        }

        // Compare password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Generate OTP
            const authOTP = generateOTP();
            const subject = "Auth OTP";
            const mailbody = `Hi ${capitalizeFirstLetter(user.firstname)}, <b>${authOTP}</b> is your verification code`;
            sendEmail(user.email, subject, mailbody);

            // Update the OTP and its creation time in the database
            await User.update(
                { auth_otp: authOTP, otp_createdat: currentTime },
                { where: { email } }
            );

            return res.status(200).send({
                errorDesc: "An OTP has been sent to your email, confirm by inputting the OTP",
                success: "1"
            });
        } else {
            // Increment login trials if password is incorrect
            const updatedLoginTrials = user.login_trials + 1;
            await User.update(
                { login_trials: updatedLoginTrials, last_login: currentTime },
                { where: { email } }
            );

            return res.status(200).send({
                errorDesc: "Invalid details",
                success: "0"
            });
        }
    } catch (error) {
        console.error("Error in signin:", error);
        return res.status(500).send({
            errorDesc: "Error signing in the user",
            success: "0"
        });
    }
};

// Login without OTP (direct login)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(200).send({
                errorDesc: "User not found. Sign up to continue",
                success: "0"
            });
        }

        // Check if user has exceeded login trials
        if (user.login_trials > 5) {
            return res.status(200).send({
                errorDesc: "Too many attempts. Please try again after 5 minutes",
                success: "0"
            });
        }

        // Compare password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Generate JWT token
            const token = jwt.sign({ email: user.email }, SECRETKEY, { expiresIn: 60 * 60 * 1 });  // expires in 1 hour

            const resObject = {
                id: user.id,
                email: user.email,
                firstname: capitalizeFirstLetter(user.firstname),
                lastname: capitalizeFirstLetter(user.lastname),
                phone_number: user.phone_number
            };

            req.session.isAuth = true;

            // Get user's geographical location based on IP
            const ip = await getPublicIP();
            const geo = geoip.lookup(ip);
            const geoData = geo ? {
                country: geo.country,
                region: geo.region,
                city: geo.city,
                ll: [geo.ll[0], geo.ll[1]]
            } : {};

            return res.status(200).send({
                user: resObject,
                token: token,
                success: "1",
                location: geoData
            });
        } else {
            // Increment login trials if password is incorrect
            const updatedLoginTrials = user.login_trials + 1;
            await User.update(
                { login_trials: updatedLoginTrials, last_login: currentTime },
                { where: { email } }
            );

            return res.status(200).send({
                errorDesc: "Invalid details",
                success: "0"
            });
        }
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).send({
            errorDesc: "Error logging in the user",
            success: "0"
        });
    }
};

exports.resendOtp = async (req, res) => {
    const { email } = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        // Fetch the user from the database
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(200).send({
                errorDesc: "User not found. Sign up to continue",
                success: "0"
            });
        }

        // Check if the user has exceeded the login trials
        if (user.login_trials > 5) {
            return res.status(200).send({
                errorDesc: "Too many attempts. Please try again after 5 minutes",
                success: "0"
            });
        }

        // Generate OTP and send it via email
        const authOTP = generateOTP();
        const subject = "Auth OTP";
        const mailbody = `Hi ${capitalizeFirstLetter(user.firstname)}, <b>${authOTP}</b> is your verification code`;
        sendEmail(email, subject, mailbody);

        // Update OTP in the database
        await User.updateOne({ email }, {
            auth_otp: authOTP,
            otp_createdat: currentTime
        });

        return res.status(200).send({
            errorDesc: "An otp has been sent to your email",
            success: "1"
        });
    } catch (error) {
        return res.status(500).send("Error in signing the user");
    }
};

exports.otpAuth = async (req, res) => {
    const { email, auth_otp } = req.body;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        // Fetch the user from the database
        const user = await User.findOne({ email, auth_otp, login_trials: { $lte: 5 } });

        if (!user) {
            await User.updateOne({ email }, {
                $inc: { login_trials: 1 },
                last_login: currentTime
            });
            return res.status(200).send({
                errorDesc: "Otp confirmation failed or you have exceeded the number of trials",
                success: "0"
            });
        }

        // Validate the OTP
        const validOTP = validateOTP(email, user.otp_createdat, 5);

        if (validOTP) {
            // Update the login trials and last login time
            await User.updateOne({ email }, {
                login_trials: 0,
                last_login: currentTime
            });

            const token = jwt.sign({ email }, SECRETKEY, { expiresIn: '10h' });  // Expires in 10 hours

            const resObject = {
                id: user.id,
                email: user.email,
                firstname: capitalizeFirstLetter(user.firstname),
                lastname: capitalizeFirstLetter(user.lastname),
                phone_number: user.phone_number
            };

            req.session.isAuth = true;

            return res.status(200).send({
                user: resObject,
                token: token,
                success: "1"
            });
        } else {
            await User.updateOne({ email }, {
                $inc: { login_trials: 1 },
                last_login: currentTime
            });

            return res.status(200).send({
                errorDesc: "The otp entered is invalid or has expired",
                success: "0"
            });
        }

    } catch (error) {
        return res.status(500).send("Error in signing the user");
    }
};

exports.getusers = (req, res) => {
    User.findAll()
    .then((users) => {
        res.send(users);
    })
    .catch((err)=>{
        console.log(err)
        res.send(err);
    })
};

exports.getuserspagination = async (req, res) => {
    const { page = 1, limit = 2, searchTerm = "" } = req.query;
    const offset = (page - 1) * limit;

    try {
        const query = {};

        if (searchTerm) {
            // Build the query to search across multiple fields
            query.$or = [
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone_number: { $regex: transformPhoneNumber(searchTerm), $options: 'i' } },
                { firstname: { $regex: searchTerm, $options: 'i' } },
                { lastname: { $regex: searchTerm, $options: 'i' } },
                { created_at: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Fetch paginated and filtered users
        const users = await User.find(query)
            .skip(offset)
            .limit(Number(limit))
            .sort({ id: 1 });

        const resObject = {
            data: users,
            success: "1"
        };
        return res.status(200).send(resObject);

    } catch (error) {
        return res.status(500).send("Error in getting the users");
    }
};

exports.uploadFile = (req, res) => {
    const filename = req.file.filename;
    console.log(filename);
    res.send(filename);
};

exports.uploadAndConvertFile = (req, res) => {
    const fileBase64 = fileToBase64Converter(req.file.path);
    const fileObject = {
        base64Code: fileBase64
    };
    const dataUri = `data:${req.file.mimetype};base64,${fileBase64}`;
    res.status(200).send(dataUri);
};

exports.signupTest = (req, res) => {
    const {
        email,
        firstname,
        lastname,
        phone,
        password
    } = req.body;
    const useerData = {
        email: email,
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        password: password
    }
    appendToLogFileNewUsers(JSON.stringify(useerData))
    res.status(200).send(useerData);
}