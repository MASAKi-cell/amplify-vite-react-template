import type { APIGatewayProxyEvent } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { ERROR_MESSAGES } from "../constants/index.js";
import { UnauthorizedError } from "../errors/index.js";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

const getVerifier = () => {
  if (!verifier) {
    const userPoolId = process.env.USER_POOL_ID;
    const clientId = process.env.USER_POOL_CLIENT_ID;

    if (!userPoolId || !clientId) {
      throw new Error(
        ERROR_MESSAGES.ENV_NOT_SET("USER_POOL_ID or USER_POOL_CLIENT_ID")
      );
    }

    verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "access",
      clientId,
    });
  }
  return verifier;
};

export const extractUserId = async (
  event: APIGatewayProxyEvent
): Promise<string> => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN_PROVIDED);
  }

  try {
    const payload = await getVerifier().verify(token);
    return payload.sub;
  } catch {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
  }
};

export const extractUserIdOptional = async (
  event: APIGatewayProxyEvent
): Promise<string | null> => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    const payload = await getVerifier().verify(token);
    return payload.sub;
  } catch {
    return null;
  }
};

export const verifyOwnership = (
  resourceAuthorId: string,
  requesterId: string
): void => {
  if (resourceAuthorId !== requesterId) {
    throw new UnauthorizedError(ERROR_MESSAGES.NO_PERMISSION);
  }
};
