import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../utils/response.js';
import { extractUserId, verifyOwnership } from '../utils/auth.js';
import { parseRequestBody, validateCreateCommentInput } from '../utils/validation.js';
import * as commentService from '../services/commentService.js';
import * as postService from '../services/postService.js';
import { logger } from '../utils/logger.js';

export const handleGetComments = async (postId: string): Promise<APIGatewayProxyResult> => {
  logger.info('Getting comments for post', { postId });
  await postService.getPostById(postId);
  const comments = await commentService.getCommentsByPostId(postId);
  return createResponse(200, comments);
};

export const handleCreateComment = async (
  event: APIGatewayProxyEvent,
  postId: string
): Promise<APIGatewayProxyResult> => {
  const authorId = await extractUserId(event);
  await postService.getPostById(postId);

  const body = parseRequestBody(event.body);
  const input = validateCreateCommentInput(body);

  logger.info('Creating comment', { postId, authorId });
  const comment = await commentService.createComment(postId, input, authorId);

  return createResponse(201, comment);
};

export const handleDeleteComment = async (
  event: APIGatewayProxyEvent,
  id: string
): Promise<APIGatewayProxyResult> => {
  const requesterId = await extractUserId(event);
  const existingComment = await commentService.getCommentById(id);

  verifyOwnership(existingComment.authorId, requesterId);

  logger.info('Deleting comment', { commentId: id, requesterId });
  await commentService.deleteComment(id);

  return createResponse(204, null);
};
