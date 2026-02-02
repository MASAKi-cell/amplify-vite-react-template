import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import type {
  POST,
  CREATE_POST_INPUT,
  UPDATE_POST_INPUT,
} from "../types/index.js";
import { TABLE_NAMES } from "../constants/index.js";
import { NotFoundError } from "../errors/index.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const createPost = async (
  input: CREATE_POST_INPUT,
  authorId: string
): Promise<POST> => {
  const now = new Date().toISOString();
  const post: POST = {
    id: randomUUID(),
    title: input.title,
    content: input.content,
    imageKey: input.imageKey,
    authorId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAMES.POSTS,
      Item: post,
    })
  );

  return post;
};

export const getPostById = async (id: string): Promise<POST> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAMES.POSTS,
      Key: { id },
    })
  );

  if (!result.Item) {
    throw new NotFoundError("Post");
  }

  return result.Item as POST;
};

export const getAllPosts = async (): Promise<POST[]> => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAMES.POSTS,
    })
  );

  const posts = (result.Items as POST[]) || [];
  return posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const updatePost = async (
  id: string,
  input: UPDATE_POST_INPUT
): Promise<POST> => {
  const now = new Date().toISOString();

  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": now,
  };

  if (input.title !== undefined) {
    updateExpressions.push("#title = :title");
    expressionAttributeNames["#title"] = "title";
    expressionAttributeValues[":title"] = input.title;
  }

  if (input.content !== undefined) {
    updateExpressions.push("#content = :content");
    expressionAttributeNames["#content"] = "content";
    expressionAttributeValues[":content"] = input.content;
  }

  if (input.imageKey !== undefined) {
    updateExpressions.push("#imageKey = :imageKey");
    expressionAttributeNames["#imageKey"] = "imageKey";
    expressionAttributeValues[":imageKey"] = input.imageKey;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAMES.POSTS,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as POST;
};

export const deletePost = async (id: string): Promise<void> => {
  await getPostById(id);

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAMES.POSTS,
      Key: { id },
    })
  );
};
