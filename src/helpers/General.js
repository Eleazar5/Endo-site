//Correct phone number
const transformPhoneNumber = (input) => {
    // Remove all spaces from the input string
    const stringWithoutSpaces = input.replace(/ /g, '');
  
    // Take the last 9 characters
    const transformedString = stringWithoutSpaces.slice(-9);
  
    return transformedString;
}

module.exports = {
    transformPhoneNumber
}