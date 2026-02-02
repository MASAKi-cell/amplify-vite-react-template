import { ERROR_MESSAGES } from '../constants/index.js';
import { ValidationError } from '../errors/index.js';
import type { CREATE_POST_INPUT, UPDATE_POST_INPUT, CREATE_COMMENT_INPUT } from '../types/index.js';

export const parseRequestBody = <T>(body: string | null): T => {
  if (!body) {
    throw new ValidationError(ERROR_MESSAGES.INVALID_REQUEST_BODY);
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new ValidationError(ERROR_MESSAGES.INVALID_REQUEST_BODY);
  }
};

export const validateCreatePostInput = (input: unknown): CREATE_POST_INPUT => {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT);
  }

  const { title, content, imageKey } = input as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError(ERROR_MESSAGES.TITLE_REQUIRED);
  }

  if (title.length > 200) {
    throw new ValidationError(ERROR_MESSAGES.TITLE_TOO_LONG);
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError(ERROR_MESSAGES.CONTENT_REQUIRED);
  }

  return {
    title: title.trim(),
    content: content.trim(),
    imageKey: typeof imageKey === 'string' ? imageKey : undefined,
  };
};

export const validateUpdatePostInput = (input: unknown): UPDATE_POST_INPUT => {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT);
  }

  const { title, content, imageKey } = input as Record<string, unknown>;
  const result: UPDATE_POST_INPUT = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.TITLE_REQUIRED);
    }
    if (title.length > 200) {
      throw new ValidationError(ERROR_MESSAGES.TITLE_TOO_LONG);
    }
    result.title = title.trim();
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CONTENT_REQUIRED);
    }
    result.content = content.trim();
  }

  if (imageKey !== undefined) {
    result.imageKey = typeof imageKey === 'string' ? imageKey : undefined;
  }

  return result;
};

export const validateCreateCommentInput = (input: unknown): CREATE_COMMENT_INPUT => {
  if (!input || typeof input !== 'object') {
    throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT);
  }

  const { content } = input as Record<string, unknown>;

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError(ERROR_MESSAGES.CONTENT_REQUIRED);
  }

  return {
    content: content.trim(),
  };
};
