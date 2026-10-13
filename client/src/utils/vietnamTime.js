// vietnamTime.js - Frontend Vietnam Timezone Utilities (Asia/Ho_Chi_Minh, UTC+7)

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns Vietnam date string formatted as YYYY-MM-DD
 * @param {Date} [d=new Date()]
 * @returns {string} YYYY-MM-DD
 */
export function getVietnamDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Formats a date into user-friendly Vietnamese format with timeZone
 * @param {Date|string} [d=new Date()]
 * @returns {string} e.g. "11/10/2026 (Giờ VN)"
 */
export function formatVietnamDisplayDate(d = new Date()) {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
  return `${parts} (Giờ VN)`;
}

/**
 * Computes milliseconds until next 00:00:00 VN time + small safety offset (500ms)
 * @param {Date} [d=new Date()]
 * @returns {number} milliseconds
 */
export function getMsUntilNextMidnightVN(d = new Date()) {
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
  const hour = parseInt(map.hour === '24' ? '0' : map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const second = parseInt(map.second, 10);

  const secondsIntoDay = hour * 3600 + minute * 60 + second;
  const remainingSeconds = 86400 - secondsIntoDay;
  const subMs = d.getTime() % 1000;
  const ms = remainingSeconds * 1000 - subMs;
  return Math.max(1000, ms + 500); // 500ms buffer past midnight
}
