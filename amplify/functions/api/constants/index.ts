export const ERROR_MESSAGES = {
  NO_TOKEN_PROVIDED: 'No token provided',
  INVALID_TOKEN: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized',
  NO_PERMISSION: 'You do not have permission to modify this resource',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_INPUT: 'Invalid input',
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_LONG: 'Title must be 200 characters or less',
  CONTENT_REQUIRED: 'Content is required',
  NOT_FOUND: (resource: string) => `${resource} not found`,
  ENV_NOT_SET: (name: string) => `${name} environment variable is not set`,
  INVALID_REQUEST_BODY: 'Invalid request body',
  POST_ID_REQUIRED: 'Post ID is required',
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
} as const;

export const HTTP_HEADER_VALUES = {
  APPLICATION_JSON: 'application/json',
  ALLOW_ALL_ORIGINS: '*',
  ALLOWED_HEADERS: 'Content-Type,Authorization',
  ALLOWED_METHODS: 'GET,POST,PUT,DELETE,OPTIONS',
} as const;

export const LOG_LEVELS = {
  INFO: 'INFO',
  ERROR: 'ERROR',
} as const;

export const TABLE_NAMES = {
  POSTS: process.env.POSTS_TABLE_NAME || '',
  COMMENTS: process.env.COMMENTS_TABLE_NAME || '',
} as const;

export const STORAGE = {
  BUCKET_NAME: process.env.STORAGE_BUCKET_NAME || '',
} as const;
