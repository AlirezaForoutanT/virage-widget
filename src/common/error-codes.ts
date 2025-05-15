// src/common/error-codes.ts

/**
 * Numeric codes for all chat‐gateway errors.
 *
 * 1xxx → Authentication errors
 * 2xxx → Rate‐limiting errors
 */
export enum ErrorCode {
  AUTH_TOKEN_MISSING = 1001, // no token provided
  AUTH_TOKEN_INVALID = 1002, // bad signature
  AUTH_TOKEN_EXPIRED = 1003, // JWT expired
  AUTH_FETCH_FAILED = 1004, // failed to fetch auth token

  RATE_LIMIT_CONNECT = 2001, // too many WS connect attempts
  RATE_LIMIT_MESSAGES = 2002, // too many messages sent
  
  UNKNOWN_ERROR = 9001, // catch-all
}

/** Human‐readable default messages for each code. */
export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_TOKEN_MISSING]: "Authentication token missing",
  [ErrorCode.AUTH_TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCode.AUTH_TOKEN_EXPIRED]: "Authentication token expired",
  [ErrorCode.AUTH_FETCH_FAILED]: "Failed to fetch authentication token",
  [ErrorCode.RATE_LIMIT_CONNECT]: "Too many connection attempts – please wait",
  [ErrorCode.RATE_LIMIT_MESSAGES]: "Too many messages – please wait",
  [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred",
};
