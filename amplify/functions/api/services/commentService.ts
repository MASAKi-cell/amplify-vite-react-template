import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import type { COMMENT, CREATE_COMMENT_INPUT } from '../types/index.js';
import { TABLE_NAMES } from '../constants/index.js';
import { NotFoundError } from '../errors/index.js';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const createComment = async (
  postId: string,
  input: CREATE_COMMENT_INPUT,
  authorId: string
): Promise<COMMENT> => {
  const now = new Date().toISOString();
  const comment: COMMENT = {
    id: randomUUID(),
    postId,
    content: input.content,
    authorId,
    createdAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAMES.COMMENTS,
    Item: comment,
  }));

  return comment;
};

export const getCommentById = async (id: string): Promise<COMMENT> => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAMES.COMMENTS,
    Key: { id },
  }));

  if (!result.Item) {
    throw new NotFoundError('Comment');
  }

  return result.Item as COMMENT;
};

export const getCommentsByPostId = async (postId: string): Promise<COMMENT[]> => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAMES.COMMENTS,
    IndexName: 'byPostId',
    KeyConditionExpression: 'postId = :postId',
    ExpressionAttributeValues: {
      ':postId': postId,
    },
  }));

  const comments = (result.Items as COMMENT[]) || [];
  return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const deleteComment = async (id: string): Promise<void> => {
  await getCommentById(id);

  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAMES.COMMENTS,
    Key: { id },
  }));
};
