import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse, handleError } from './utils/response.js';
import { handleGetPosts, handleGetPost, handleCreatePost, handleUpdatePost, handleDeletePost } from './routes/posts.js';
import { handleGetComments, handleCreateComment, handleDeleteComment } from './routes/comments.js';
import { logger } from './utils/logger.js';
import { NotFoundError } from './errors/index.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Received request', {
    method: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
  });

  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, null);
  }

  try {
    const method = event.httpMethod;
    const path = event.path;
    const pathParams = event.pathParameters || {};

    // POST /posts
    if (method === 'POST' && path === '/posts') {
      return await handleCreatePost(event);
    }

    // GET /posts
    if (method === 'GET' && path === '/posts') {
      return await handleGetPosts();
    }

    // GET /posts/{id}
    if (method === 'GET' && path.match(/^\/posts\/[^/]+$/) && pathParams.id) {
      return await handleGetPost(pathParams.id);
    }

    // PUT /posts/{id}
    if (method === 'PUT' && path.match(/^\/posts\/[^/]+$/) && pathParams.id) {
      return await handleUpdatePost(event, pathParams.id);
    }

    // DELETE /posts/{id}
    if (method === 'DELETE' && path.match(/^\/posts\/[^/]+$/) && pathParams.id) {
      return await handleDeletePost(event, pathParams.id);
    }

    // GET /posts/{id}/comments
    if (method === 'GET' && path.match(/^\/posts\/[^/]+\/comments$/) && pathParams.id) {
      return await handleGetComments(pathParams.id);
    }

    // POST /posts/{id}/comments
    if (method === 'POST' && path.match(/^\/posts\/[^/]+\/comments$/) && pathParams.id) {
      return await handleCreateComment(event, pathParams.id);
    }

    // DELETE /comments/{id}
    if (method === 'DELETE' && path.match(/^\/comments\/[^/]+$/) && pathParams.commentId) {
      return await handleDeleteComment(event, pathParams.commentId);
    }

    throw new NotFoundError('Endpoint');
  } catch (error) {
    return handleError(error);
  }
};
