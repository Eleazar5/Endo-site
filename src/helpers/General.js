const moment = require("moment");
const nodeMailer = require('nodemailer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const ping = require('ping');
const PDFDocument = require('pdfkit');
const translate = require('@vitalets/google-translate-api');

const {
    mailUser,
    mailPass,
    saveActiviyLogs,
    sitebaseURL,
    organization,
    emailuser,
    emailusertitle,
    orgsite,
    orgphone
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

//Create file logs
const appendToLogFileNewUsers = (log) => {
  const logMessage = `${log} \n`;
  const logsFilePath = path.join(__dirname, '..', 'library/activity_logs', `Mpesa.txt`);
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

const capitalizeFirstLetter = (wordtotransform) => {
  return wordtotransform.charAt(0).toUpperCase() + wordtotransform.slice(1);
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
    
    const footerSignature = `
      <br><br>
      <div style="display: flex; align-items: center;">
          <div style="display: flex; flex: 1; align-items: center;">
              <!-- Text only, no logo -->
              <div style="flex: 1 1 auto;">
                  <div class="text">
                      <strong><span style="color: #007bff;">${emailuser}</span></strong><br>
                      <strong>${emailusertitle}</strong><br>
                      <strong>${organization}</strong><br>
                      <a href="tel:254${transformPhoneNumber(orgphone)}">${orgphone}</a><br>
                      <a href="${orgsite}">${orgsite}</a>
                  </div>
              </div>
          </div>
      </div>
      <br>
    `;
    const completeMailBody = `${mailbody}${footerSignature}`;
    const mailOptions = {
        to: email,
        subject: subject,
        html: completeMailBody
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
    cb(null, path.join(__dirname, '..', 'library/files'))
  },
  filename: (req, file, cb) => {
    // console.log(file)
    cb(null, Date.now() +path.extname(file.originalname))
  }
})

const upload = multer({storage: storage}).single("endofile");


const handleNewData = (newData) => {  
  let config = {
    method: 'post',
    url: `${sitebaseURL}/webhook`,
    headers: { 
      'Content-Type': 'application/json', 
    },
    data : newData
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
}

const fileToBase64Converter = (filePath) => {  
  const base64encoded = fs.readFileSync(filePath, {encoding: 'base64'});
  return JSON.stringify(base64encoded);
}

const pingToTestServer = async (host) => {
  try {
    const res = await ping.promise.probe(host);
    if (res.alive) {
      return JSON.stringify({
        server_status: "Ok",
        server_res: `${host} is alive`,
        server_host: res.numeric_host
      });
    } else {
      return JSON.stringify({
        server_status: "Fail",
        server_res: `${host} is not reachable`
      });
    }
  } catch (error) {
    return JSON.stringify({
      server_status: "Error",
      server_res: error.message
    });
  }
};

//Generate new pdf
const generateNewPDF = (req, res) => {
  // Create a document
  const imagePath = path.join(__dirname, '..', 'library/images/facebook.png');
  const doc = new PDFDocument();

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');

  // To download direct without preview uncomment this
  // res.setHeader('Content-Disposition', 'attachment; filename=example.pdf');
  // doc.pipe(res);

  // Adding functionality
  doc
      .fontSize(47)
      .text('This the article for GeeksforGeeks', 100, 100);

  // Adding an image in the pdf.
  doc.image(imagePath, {
      fit: [300, 300],
      align: 'center',
      valign: 'center'
  });

  doc
      .addPage()
      .fontSize(15)
      .text('Generating PDF with the help of pdfkit', 100, 100);

  // Apply some transforms and render an SVG path
  doc
      .scale(0.6)
      .translate(470, -380)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('red', 'even-odd')
      .restore();

  // Add some text with annotations
  doc
      .addPage()
      .fillColor('blue')
      .text('The link for GeeksforGeeks website', 100, 100)
      .link(100, 100, 160, 27, 'https://www.geeksforgeeks.org/');

  // Finalize PDF file
  doc.pipe(res);
  doc.end();
};

const generateNewPDFBase64 = (title = '', message1 = '', message2 = '', imagePath = '') => {
  return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      if (title) {
          doc.fontSize(27).text(title, 100, 100);
      }

      if (message1) {
          doc.fontSize(18).text(message1, 100, 150);
      }

      if (message2) {
          doc.fontSize(18).text(message2, 100, 200);
      }

      if (imagePath) {
          doc.image(imagePath, {
              fit: [300, 300],
              align: 'center',
              valign: 'center'
          });
      }

      if (message1) {
        doc
        .addPage()
        .fontSize(18).text(message1, 100, 150);
      }

      doc.on('data', chunk => {
          chunks.push(chunk);
      });

      doc.on('end', () => {
          const result = Buffer.concat(chunks).toString('base64');
          resolve(result);
      });

      doc.end();
  });
};

//Get My currect public ip
const getPublicIP = async () => {
  let config = {
    method: 'get',
    url: 'https://api.ipify.org?format=json',
    headers: { 
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await axios.request(config);
    const ip = response.data.ip;
    return ip; 
  } catch (error) {
    console.error('Error fetching public IP:', error);
    throw error;
  }
};

const translateText =  async (text, targetLanguage) => {
  try {
    const res = await translate(text, { to: targetLanguage });
    console.log(`Original Text: ${text}`);
    console.log(`Translated Text: ${res.text}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = {
    transformPhoneNumber,
    capitalizeFirstLetter,
    generateOTP,
    validateOTP,
    sendEmail,
    appendToLogFile,
    appendToLogFileNewUsers,
    runScriptFile,
    upload,
    handleNewData,
    fileToBase64Converter,
    pingToTestServer,
    generateNewPDF,
    generateNewPDFBase64,
    getPublicIP,
    translateText
}