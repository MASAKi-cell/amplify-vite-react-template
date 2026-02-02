import type { APIGatewayProxyResult } from 'aws-lambda';
import { ERROR_MESSAGES, HTTP_HEADERS, HTTP_HEADER_VALUES } from '../constants/index.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/index.js';
import { logger } from './logger.js';

export const createResponse = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADER_VALUES.APPLICATION_JSON,
    [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN]: HTTP_HEADER_VALUES.ALLOW_ALL_ORIGINS,
    [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS]: HTTP_HEADER_VALUES.ALLOWED_HEADERS,
    [HTTP_HEADERS.ACCESS_CONTROL_ALLOW_METHODS]: HTTP_HEADER_VALUES.ALLOWED_METHODS,
  },
  body: JSON.stringify(body),
});

export const handleError = (error: unknown): APIGatewayProxyResult => {
  logger.error('Request error', error);

  if (error instanceof ValidationError) {
    return createResponse(400, { error: error.message });
  }
  if (error instanceof NotFoundError) {
    return createResponse(404, { error: error.message });
  }
  if (error instanceof UnauthorizedError) {
    return createResponse(403, { error: error.message });
  }

  return createResponse(500, { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
};
