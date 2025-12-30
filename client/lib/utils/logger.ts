/**
 * Client-side logging utility
 * Provides structured logging with environment-aware log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if logging is enabled for a given level
 */
const shouldLog = (level: LogLevel): boolean => {
  if (isDevelopment) return true; // Log everything in development
  if (isProduction) {
    // In production, only log warn and error
    return level === 'warn' || level === 'error';
  }
  return true;
};

/**
 * Format log message with context
 */
const formatMessage = (message: string, context?: LogContext): string => {
  if (!context || Object.keys(context).length === 0) {
    return message;
  }
  return `${message} | Context: ${JSON.stringify(context)}`;
};

/**
 * Get stack trace for error logging
 */
const getStackTrace = (error?: Error): string | undefined => {
  if (!error?.stack) return undefined;
  // Only include stack in development or for errors
  if (isDevelopment) {
    return error.stack;
  }
  // In production, include first few lines of stack
  return error.stack.split('\n').slice(0, 3).join('\n');
};

/**
 * Log debug messages (development only)
 */
export const logDebug = (message: string, context?: LogContext): void => {
  if (!shouldLog('debug')) return;
  console.log(`[DEBUG] ${formatMessage(message, context)}`);
};

/**
 * Log info messages
 */
export const logInfo = (message: string, context?: LogContext): void => {
  if (!shouldLog('info')) return;
  console.log(`[INFO] ${formatMessage(message, context)}`);
};

/**
 * Log warning messages
 */
export const logWarn = (message: string, context?: LogContext, error?: Error): void => {
  if (!shouldLog('warn')) return;
  const contextWithStack = error?.stack 
    ? { ...context, stack: getStackTrace(error) }
    : context;
  console.warn(`[WARN] ${formatMessage(message, contextWithStack)}`);
};

/**
 * Log error messages
 */
export const logError = (message: string, error?: Error, context?: LogContext): void => {
  if (!shouldLog('error')) return;
  
  const errorContext: LogContext = {
    ...context,
    errorMessage: error?.message,
    errorName: error?.name,
    stack: getStackTrace(error),
  };
  
  console.error(`[ERROR] ${formatMessage(message, errorContext)}`);
  
  // In production, you might want to send to error tracking service
  if (isProduction && typeof window !== 'undefined') {
    // Could integrate with Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: context });
  }
};

/**
 * Log API requests
 */
export const logApiRequest = (
  method: string,
  url: string,
  context?: LogContext
): void => {
  logDebug(`API Request: ${method} ${url}`, {
    method,
    url,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

/**
 * Log API responses
 */
export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  context?: LogContext
): void => {
  const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
  const logFn = level === 'error' ? logError : level === 'warn' ? logWarn : logInfo;
  
  logFn(`API Response: ${method} ${url} - ${status}`, undefined, {
    method,
    url,
    status,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

/**
 * Log API errors
 */
export const logApiError = (
  method: string,
  url: string,
  error: Error,
  status?: number,
  context?: LogContext
): void => {
  logError(`API Error: ${method} ${url}`, error, {
    method,
    url,
    status,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

