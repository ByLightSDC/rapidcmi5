import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

/**
 * Get Time Elapsed
 * @param {Date} startDate
 * @returns
 */
const getTimeDurationString = (startDate: Date) => {
  // Get the difference in milliseconds
  const diff = Date.now() - startDate.getTime();

  // Convert to desired units
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
};

/**
 * Displays Clock Time Elapsed
 * @param param0
 * @returns
 */
export default function TimeClock({ startDateStr }: { startDateStr: string }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState('00:00:00');

  const seconds = useRef<number>(0);
  const timerId = useRef<ReturnType<typeof setTimeout> | number>(0);

  /**
   * UE Cleans Up Time Interval
   */
  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, []);

  /**
   * UE Creates Start Date from timestamp
   */
  useEffect(() => {
    console.log('startDateStr', startDateStr);
    if (startDateStr) {
      setStartDate(new Date(startDateStr));
    }
  }, [startDateStr]);

  /**
   * UE Starts Time Interval
   */
  useEffect(() => {
    if (startDate) {
      const doEverySecond = () => {
        seconds.current = seconds.current + 1;
        const displayStr = getTimeDurationString(startDate);
        setDuration(displayStr);
      };

      timerId.current = setInterval(() => {
        doEverySecond();
      }, 1000);
    }
  }, [startDate]);

  return (
    <Box style={{}}>
      <Typography variant="caption">{duration}</Typography>
    </Box>
  );
}
