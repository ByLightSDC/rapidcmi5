import format from 'date-fns/format';

/**
 * Returns formatted date in local time
 * @param {string} databaseDate Local date string
 * @param {string} [dateFormat = 'MM/dd/yyyy hh:mm a'] Format
 * @return {JSX.Element} Formatted date
 * @example databaseDate '2023-03-28T18:28:31.503Z' returns '03/28/2023 02:28 PM'
 */
export const useDisplayDateFormatter = () => {
  const formatDisplayDateTime = ({
    databaseDate,
    dateFormat = 'MM/dd/yyyy hh:mm a',
  }: {
    databaseDate: string;
    dateFormat?: string;
  }) => {
    if (databaseDate) {
      try {
        return getLocalTime(databaseDate, dateFormat);
      } catch (error: any) {
        return ' '; //'Date Unavailable';
      }
    }
    return '';
  };
  return { formatDisplayDateTime };
};

/**
 * Returns formatted date in local time
 * @param {string} localDateStr Local date string
 * @param {string} [dateFormat = 'MM/dd/yyyy hh:mm a'] Format
 * @return {JSX.Element} Formatted date
 */
const getLocalTime = (localDateStr: string, dateFormat: string): string => {
  const localDate = new Date(localDateStr);
  return format(localDate, dateFormat);
};

/**
 * Returns formatted date in local time
 * @param {string} localDateStr Local date string
 * @param {string} [dateFormat = 'MM/dd/yyyy hh:mm a'] Format
 * @return {JSX.Element} Formatted date
 */
const getUTCTime = (localDateStr: string, dateFormat: string): string => {
  const localDate = new Date(localDateStr);
  const displayDate = new Date(
    localDate.getTime() + localDate.getTimezoneOffset() * 60000,
  );
  return format(displayDate, dateFormat);
};
