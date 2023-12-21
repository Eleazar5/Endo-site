const axios = require('axios');
const { getCountryCallingCode  } = require('libphonenumber-js');
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
                console.error('Unknown country:', countryData.cca2);
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