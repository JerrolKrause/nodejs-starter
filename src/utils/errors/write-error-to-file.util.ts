import fs from 'fs';
import path from 'path';

/**
 * Asynchronously writes error details to a log file.
 *
 * @param {Error} err - The error object to log.
 */
export const writeErrorToLog = (err: Error) => {
  const logDir = './logs';
  const filePath = path.join(logDir, 'error.log');

  // Ensure logs directory exists, if not create it
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // Check file size before writing to it
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

    // If file size exceeds 5 MB, rename and start a new log file
    if (fileSizeInMegabytes >= 5) {
      const newPath = path.join(logDir, `error-${new Date().toISOString()}.log`);
      fs.renameSync(filePath, newPath);
    }
  }

  // Write the error to the log file
  fs.appendFile(filePath, `${new Date().toISOString()} - ${err.stack || err.message}\n`, 'utf8', writeErr => {
    if (writeErr) {
      console.error('Error writing to log file:', writeErr);
    }
  });
};
