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

import moment from "moment-timezone";

/**
 * Convert user's local date/time to UTC for storage
 * @param {string} dateString - YYYY-MM-DD format
 * @param {string} timeString - HH:mm:ss format
 * @param {string} timezone - User's timezone (e.g., "Asia/Karachi")
 * @returns {object} - { utcDate, utcTime, utcDateTime }
 */
export function convertToUTC(dateString, timeString, timezone = "UTC") {
  if (!dateString || !timeString) {
    console.error("Date or time missing:", { dateString, timeString });
    return null;
  }

  try {
    // Combine date and time
    const dateTimeString = `${dateString} ${timeString}`;
    
    // Parse in user's timezone
    const userDateTime = moment.tz(dateTimeString, "YYYY-MM-DD HH:mm:ss", timezone);
    
    if (!userDateTime.isValid()) {
      console.error("Invalid datetime:", dateTimeString);
      return null;
    }

    // Convert to UTC
    const utcDateTime = userDateTime.utc();

    return {
      utcDate: utcDateTime.format("YYYY-MM-DD"),
      utcTime: utcDateTime.format("HH:mm:ss"),
      utcDateTime: utcDateTime.toISOString(),
      originalTimezone: timezone
    };
  } catch (error) {
    console.error("Error converting to UTC:", error);
    return null;
  }
}

/**
 * Convert UTC date/time to user's local timezone
 * @param {string} utcDate - YYYY-MM-DD format
 * @param {string} utcTime - HH:mm:ss format
 * @param {string} targetTimezone - Target timezone
 * @returns {object} - { localDate, localTime, localDateTime }
 */
export function convertFromUTC(utcDate, utcTime, targetTimezone = "UTC") {
  if (!utcDate || !utcTime) {
    console.error("UTC date or time missing:", { utcDate, utcTime });
    return null;
  }

  try {
    // Combine UTC date and time
    const utcDateTimeString = `${utcDate} ${utcTime}`;
    
    // Parse as UTC
    const utcDateTime = moment.utc(utcDateTimeString, "YYYY-MM-DD HH:mm:ss");
    
    if (!utcDateTime.isValid()) {
      console.error("Invalid UTC datetime:", utcDateTimeString);
      return null;
    }

    // Convert to target timezone
    const localDateTime = utcDateTime.tz(targetTimezone);

    return {
      localDate: localDateTime.format("YYYY-MM-DD"),
      localTime: localDateTime.format("HH:mm:ss"),
      localDateTime: localDateTime.format("YYYY-MM-DD HH:mm:ss"),
      timezone: targetTimezone
    };
  } catch (error) {
    console.error("Error converting from UTC:", error);
    return null;
  }
}

/**
 * Extract and validate date
 * @param {string} dateString - YYYY-MM-DD format
 * @returns {string|null} - Validated date string
 */
export function extractDate(dateString) {
  if (!dateString) return null;

  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) {
    console.error("Invalid date format (expected YYYY-MM-DD):", dateString);
    return null;
  }

  const date = moment(dateString, "YYYY-MM-DD", true);
  if (!date.isValid()) {
    console.error("Invalid date:", dateString);
    return null;
  }

  return date.format("YYYY-MM-DD");
}

/**
 * Extract and validate time
 * @param {string} timeString - HH:mm:ss or HH:mm format
 * @returns {string} - HH:mm:ss format
 */
export function extractTime(timeString) {
  if (!timeString) {
    console.error("Invalid timeString:", timeString);
    return "00:00:00";
  }

  const timeMatch = timeString.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (!timeMatch) {
    console.error("Invalid time format:", timeString);
    return "00:00:00";
  }

  const [_, hours, minutes, seconds = "00"] = timeMatch;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

/**
 * Check if a booking time conflicts with existing bookings
 * @param {string} newDate - YYYY-MM-DD (in UTC)
 * @param {string} newTime - HH:mm:ss (in UTC)
 * @param {Array} existingBookings - Array of bookings with orderStartDate and orderStartTime
 * @returns {boolean} - True if conflict exists
 */
export function hasTimeConflict(newDate, newTime, existingBookings) {
  const newDateTime = moment.utc(`${newDate} ${newTime}`, "YYYY-MM-DD HH:mm:ss");

  for (const booking of existingBookings) {
    const bookingDateTime = moment.utc(
      `${booking.orderStartDate} ${booking.orderStartTime}`,
      "YYYY-MM-DD HH:mm:ss"
    );

    // Check if times are within 1 hour of each other
    const diffMinutes = Math.abs(newDateTime.diff(bookingDateTime, "minutes"));
    if (diffMinutes < 60) {
      return true;
    }
  }

  return false;
}

/**
 * Generate unique number (keeping your existing function)
 */
// export function generateUniqueNumber() {
//   return Math.floor(100000 + Math.random() * 900000);
// }

function calculateTotalAmount(serviceFee, platformFeePercentage, taxJarTaxAmount, paypalFeePercentage, paypalFixedFee) {

  
  const subTotalBeforePayPalFee = serviceFee + platformFeePercentage + taxJarTaxAmount;



  const totalAmount = (subTotalBeforePayPalFee + paypalFixedFee) / (1 - paypalFeePercentage);


  return Number(totalAmount.toFixed(2));
}





export { generateUniqueNumber,calculateTotalAmount };
