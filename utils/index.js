const generatedNumbers = new Set();
let length = 4; // Start with 4-digit numbers

function generateUniqueNumber() {
  let lowerBound = Math.pow(10, length - 1);
  let upperBound = Math.pow(10, length) - 1;

  if (generatedNumbers.size >= upperBound - lowerBound + 1) {
    generatedNumbers.clear();
    length++;
  }

  let num;
  do {
    num =
      Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
  } while (generatedNumbers.has(num));

  generatedNumbers.add(num);
  return num;
}

// Call the function when needed
// Call this whenever you need a new unique number

//----------------------------------------DATE AND TIME FUNCTION-------------------//

// Function to extract date in yyyy-mm-dd format
function extractDate(dateString) {
  console.log(dateString, "dateString");

  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Function to extract time in hh:mm:ss format
function extractTime(timeString) {
  if (!timeString || typeof timeString !== "string" || !timeString.includes(":")) {
    console.error("Invalid timeString:", timeString);
    return "00:00:00"; // Or throw an error / return null based on your app logic
  }

  const [hours, minutes, seconds] = timeString.split(":");
  const formatted = `${hours.padStart(2, "0")}:${minutes.padStart(
    2,
    "0"
  )}:${seconds.padStart(2, "0")}`;

  return formatted;
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

export { generateUniqueNumber, extractDate, extractTime };
