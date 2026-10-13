// vietnamTime.js - Standardized Vietnam Time (Asia/Ho_Chi_Minh, UTC+7) helper
// Ensures consistent date determination across servers, containers and client locales

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns Vietnam date string in YYYY-MM-DD format
 * @param {Date} [d=new Date()]
 * @returns {string} YYYY-MM-DD
 */
function getVietnamDateString(d = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

/**
 * Returns Vietnam date parts (year, month, day, hour, minute, second)
 * @param {Date} [d=new Date()]
 */
function getVietnamDateParts(d = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  const parts = formatter.formatToParts(d);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour === '24' ? '0' : map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

/**
 * Calculates milliseconds remaining until next 00:00:00 VN time
 * @param {Date} [d=new Date()]
 * @returns {number} milliseconds
 */
function getMsUntilNextMidnightVN(d = new Date()) {
  const p = getVietnamDateParts(d);
  const secondsIntoDay = p.hour * 3600 + p.minute * 60 + p.second;
  const remainingSeconds = 86400 - secondsIntoDay;
  const subMs = d.getTime() % 1000;
  const ms = remainingSeconds * 1000 - subMs;
  return Math.max(500, ms);
}

/**
 * Returns an array of YYYY-MM-DD date strings for the past N days up to today
 * @param {number} [daysCount=7]
 * @param {Date} [refDate=new Date()]
 * @returns {string[]}
 */
function getPastDateStrings(daysCount = 7, refDate = new Date()) {
  const result = [];
  const refTime = refDate.getTime();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(refTime - i * 86400000);
    result.push(getVietnamDateString(d));
  }
  return result;
}

module.exports = {
  VIETNAM_TIMEZONE,
  getVietnamDateString,
  getVietnamDateParts,
  getMsUntilNextMidnightVN,
  getPastDateStrings,
};
