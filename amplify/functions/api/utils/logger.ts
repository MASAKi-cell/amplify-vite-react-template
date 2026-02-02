import { LOG_LEVELS } from '../constants/index.js';

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: LOG_LEVELS.INFO,
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: LOG_LEVELS.ERROR,
      message,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
};
