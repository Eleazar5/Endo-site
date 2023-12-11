const moment = require("moment");
const nodeMailer = require('nodemailer');
const fs = require('fs');

const {
    mailUser,
    mailPass
} = process.env;

const savelogs = true;

//Create file logs
const appendToLogFile = (log) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const timeNow = moment().format('HH:mm:ss');

    const logMessage = `${timeNow} - ${log} \n`;
    if(savelogs){
        fs.appendFile(`logs-${currentDate}.txt`, logMessage, function (err) {
            if (err) throw err;
        });
    }    
}

//Correct phone number
const transformPhoneNumber = (input) => {
    // Remove all spaces from the input string
    const stringWithoutSpaces = input.replace(/ /g, '');
  
    // Take the last 9 characters
    const transformedString = stringWithoutSpaces.slice(-9);
  
    return transformedString;
}

//Generate 6 digit otp
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

const validateOTP = (userEmail, otpCreatedAt, expirationTimeInMinutes) => {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    const otpExpirationTime = moment(otpCreatedAt).add(expirationTimeInMinutes, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    if (currentTime <= otpExpirationTime) {
        console.log('OTP is valid for user:', userEmail);
        return true;
    } else {
        console.log('OTP has expired for user:', userEmail);
        return false;
    }
}

// send email
const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
      user: mailUser,
      pass: mailPass
    }
});

const sendEmail = (email, subject, mailbody) => {
    const mailOptions = {
        to: email,
        subject: subject,
        html: mailbody
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          res.json({
            msg: 'fail'
          })
        } else {
          res.json({
            msg: 'success'
          })
        }
    });
}

module.exports = {
    transformPhoneNumber,
    generateOTP,
    validateOTP,
    sendEmail,
    appendToLogFile
}