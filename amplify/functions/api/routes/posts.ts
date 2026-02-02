import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../utils/response.js';
import { extractUserId, verifyOwnership } from '../utils/auth.js';
import { parseRequestBody, validateCreatePostInput, validateUpdatePostInput } from '../utils/validation.js';
import * as postService from '../services/postService.js';
import { logger } from '../utils/logger.js';

export const handleGetPosts = async (): Promise<APIGatewayProxyResult> => {
  logger.info('Getting all posts');
  const posts = await postService.getAllPosts();
  return createResponse(200, posts);
};

export const handleGetPost = async (id: string): Promise<APIGatewayProxyResult> => {
  logger.info('Getting post', { postId: id });
  const post = await postService.getPostById(id);
  return createResponse(200, post);
};

export const handleCreatePost = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorId = await extractUserId(event);
  const body = parseRequestBody(event.body);
  const input = validateCreatePostInput(body);

  logger.info('Creating post', { authorId, title: input.title });
  const post = await postService.createPost(input, authorId);

  return createResponse(201, post);
};

export const handleUpdatePost = async (
  event: APIGatewayProxyEvent,
  id: string
): Promise<APIGatewayProxyResult> => {
  const requesterId = await extractUserId(event);
  const existingPost = await postService.getPostById(id);

  verifyOwnership(existingPost.authorId, requesterId);

  const body = parseRequestBody(event.body);
  const input = validateUpdatePostInput(body);

  logger.info('Updating post', { postId: id, requesterId });
  const post = await postService.updatePost(id, input);

  return createResponse(200, post);
};

export const handleDeletePost = async (
  event: APIGatewayProxyEvent,
  id: string
): Promise<APIGatewayProxyResult> => {
  const requesterId = await extractUserId(event);
  const existingPost = await postService.getPostById(id);

  verifyOwnership(existingPost.authorId, requesterId);

  logger.info('Deleting post', { postId: id, requesterId });
  await postService.deletePost(id);

  return createResponse(204, null);
};
