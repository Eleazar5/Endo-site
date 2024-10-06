const axios = require('axios');
const { getCountryCallingCode  } = require('libphonenumber-js');
const {
    pingToTestServer
} = require('../helpers/General');

const {
    generateNewPDFBase64,
    translateText
} = require('../helpers/General')
const pdf = require('pdf-parse');
const fs = require('fs');

//get all countries
exports.worldCountries = (req, res) => {
    const url = 'https://restcountries.com/v3.1/all';
    const headers = { }

    axios
    .get(url, {
        headers
    })
    .then((response) => {
        const transformedCountries = response.data.map(countryData => {
            let callingCode;
            try {
                callingCode = getCountryCallingCode(countryData.cca2);
            } catch (error) {
                callingCode = 'N/A'; 
            }

            return {
                country_name: countryData.name?.common,
                nameCode: countryData.cca2,
                countryDialCode: callingCode
            };
        });
        res.send(transformedCountries)
    })
    .catch((error) => {
        console.log(error);
        res.send(JSON.stringify(error.response))
    });
}

exports.checkServerAlive = async (req, res) => {
    const { host } = req.body;
  
    try {
      const serverstatus = await pingToTestServer(host);
      res.send(serverstatus);
    } catch (error) {
      res.status(500).send({
        server_status: "Error",
        server_res: error.message
      });
    }
};

exports.generatePDFandExportBase64 = async (req, res) => {
    try {
        const filePath = req?.file?.path; // Ensure to access path safely
        const { title, message1, message2 } = req.body;
        
        // Validate input parameters (optional)
        if (!title && !message1 && !message2 && !filePath) {
            return res.status(400).send('Missing input parameters');
        }
        
        const base64String = await generateNewPDFBase64(title, message1, message2, filePath);
        const dataUri = `data:application/pdf;base64,${base64String}`;
        //const dataUri = base64String;
        const resObject = {
            src: dataUri
        };
        res.status(200).send(resObject);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
};

exports.simplePdfUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req?.file?.path;
    
    let dataBuffer = fs.readFileSync(filePath);

    pdf(dataBuffer).then(function (data) {
        let cleanedText = data.text
                .replace(/\/\/+/g, '') // Remove unwanted characters
                .replace(/\n+/g, ' ')  // Replace newlines with a space
                .replace(//g, '•')      // Replace bullet character with dot bullet
                .trim();               // Trim any leading/trailing whitespace
        let jsonData = {
            numPages: data.numpages,
            numRenders: data.numrender,
            text: cleanedText,
            info: data.info,
            metadata: data.metadata
        };

        // Send the entire extracted data as JSON response
        res.send(translateText(jsonData.text, 'sw'));

        fs.unlinkSync(filePath);

    }).catch(function (error) {
        console.error('Error reading PDF:', error);
        res.status(500).json({ error: 'Error processing PDF' });
    });
};