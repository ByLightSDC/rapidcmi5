import { v4 as uuidv4 } from 'uuid';

export const useTimeStampUUID = () => {
  const generateId = (timestamp?: string) => {
    // Use provided timestamp or current time
    const time = timestamp || Date.now();

    // Format timestamp as YYYYMMDDHHMMSS
    const date = new Date(time);
    const timestampStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0') +
      date.getHours().toString().padStart(2, '0') +
      date.getMinutes().toString().padStart(2, '0') +
      date.getSeconds().toString().padStart(2, '0');

    // Generate UUIDv4
    const uuid = uuidv4();

    // Combine timestamp and UUID
    return `${timestampStr}-${uuid}`;
  };
  return { generateId };
};
