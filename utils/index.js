const generatedNumbers = new Set();
let length = 4; // Start with 4-digit numbers

function generateUniqueNumber() {
    let lowerBound = Math.pow(10, length - 1);
    let upperBound = Math.pow(10, length) - 1;

    if (generatedNumbers.size >= (upperBound - lowerBound + 1)) {
        generatedNumbers.clear();
        length++;
    }

    let num;
    do {
        num = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
    } while (generatedNumbers.has(num));

    generatedNumbers.add(num);
    return num;
}

// Call the function when needed
console.log(generateUniqueNumber()); // Call this whenever you need a new unique number




//----------------------------------------DATE AND TIME FUNCTION-------------------//

// Function to extract date in yyyy-mm-dd format
function extractDate(dateString) {
    console.log(dateString,"dateString");
    
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Function to extract time in hh:mm:ss format
function extractTime(timeString) {
    console.log(timeString,"timeString");
    
    const date = new Date(timeString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}



// const { admin } = require("../firebase/admin");

// async function sendPushNotification(token, title, body, data = {}) {
//   return admin.messaging().send({
//     token,
//     notification: { title, body },
//     data,
//   });
// }

// module.exports = { sendPushNotification };


export {
    generateUniqueNumber,
    extractDate,
    extractTime

} 