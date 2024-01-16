const moment = require("moment");
const nodeMailer = require('nodemailer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer')

const {
    mailUser,
    mailPass,
    saveActiviyLogs
} = process.env;

//Create file logs
const appendToLogFile = (log) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const timeNow = moment().format('HH:mm:ss');

    const logMessage = `${timeNow} - ${log} \n`;
    const logsFilePath = path.join(__dirname, '..', 'library/activity_logs', `logs-${currentDate}.txt`);
    if(saveActiviyLogs == "true"){
        fs.appendFile(logsFilePath, logMessage, function (err) {
            if (err) throw err;
        });
    }    
}

//Run script files
const runScriptFile = (command, scriptmsg) => {  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(error.message)
      return;
    }
    if (stderr) {
      console.error(stderr)
      return;
    }
    console.log(stdout);
    appendToLogFile(scriptmsg)
  });
};

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
        return true;
    } else {
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

const sendEmail = (email, subject, mailbody, attachment) => {
    const uploadDir = path.join(__dirname, '..', 'library/images');
    const mailOptions = {
        to: email,
        subject: subject,
        html: mailbody
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment,
          path: `${uploadDir}/${attachment}`,
        },
      ];
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err)
        } else {
          console.log("message send")
        }
    });
}


//Upload image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'library/images'))
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, Date.now() +path.extname(file.originalname))
  }
})

const upload = multer({storage: storage}).single("endofile");

module.exports = {
    transformPhoneNumber,
    generateOTP,
    validateOTP,
    sendEmail,
    appendToLogFile,
    runScriptFile,
    upload
}