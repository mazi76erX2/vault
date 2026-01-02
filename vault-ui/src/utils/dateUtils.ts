/**
 * Gets today's date in ISO format.
 * @returns {string} Today's date in ISO format
 */
export const getTodayISO = (): string => new Date().toISOString();

/**
 * Formats an ISO date string to YYYY-MM-DD format.
 * @param {string} isoDate - The date in ISO format
 * @returns {string} The date in YYYY-MM-DD format
 */
export const formatDateForDisplay = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  } catch (e) {
    return formatDateForDisplay(getTodayISO());
  }
};

/**
 * Formats a date string from YYYY-MM-DD to ISO format.
 * @param {string} dateStr - The date in YYYY-MM-DD format
 * @returns {string} The date in ISO format
 */
export const formatDateForSubmission = (dateStr: string): string => {
  try {
    // Create a new date from the YYYY-MM-DD format
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  } catch (e) {
    return getTodayISO(); // Fallback to current date if invalid
  }
};
