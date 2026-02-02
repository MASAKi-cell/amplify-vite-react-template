import { defineBackend } from "@aws-amplify/backend";
import { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";
import { auth } from "./auth/resource";
import { api } from "./functions/api/resource";
import { storage } from "./storage/resource";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { RemovalPolicy, Stack } from "aws-cdk-lib";

// 使用するリソースを定義する
const backend = defineBackend({
  auth,
  api,
  storage,
});

// Lambda関数と同じスタックを使用（循環参照を回避）
const apiStack = Stack.of(backend.api.resources.lambda);

// DynamoDB：Posts Tableの設定
const postsTable = new dynamodb.Table(apiStack, "PostsTable", {
  partitionKey: {
    name: "id",
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: Stack.of(apiStack).stackName.includes("sandbox")
    ? RemovalPolicy.DESTROY
    : RemovalPolicy.RETAIN,
});

// DynamoDB：Comments Tableの設定
const commentsTable = new dynamodb.Table(apiStack, "CommentsTable", {
  partitionKey: {
    name: "id",
    type: dynamodb.AttributeType.STRING,
  },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: Stack.of(apiStack).stackName.includes("sandbox")
    ? RemovalPolicy.DESTROY
    : RemovalPolicy.RETAIN,
});

// GSI for querying comments by postId
// @see https://qiita.com/NaoyaOshiro/items/d2e520ee23476f477bb2
commentsTable.addGlobalSecondaryIndex({
  indexName: "byPostId",
  partitionKey: {
    name: "postId",
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: "createdAt",
    type: dynamodb.AttributeType.STRING,
  },
});

// DynamoDB への権限付与
const lambdaFunction = backend.api.resources.lambda as LambdaFunction;
postsTable.grantReadWriteData(lambdaFunction);
commentsTable.grantReadWriteData(lambdaFunction);

// Add environment variables to Lambda
lambdaFunction.addEnvironment("POSTS_TABLE_NAME", postsTable.tableName);
lambdaFunction.addEnvironment("COMMENTS_TABLE_NAME", commentsTable.tableName);

// Get Cognito User Pool info for JWT verification
const { cfnResources } = backend.auth.resources;
const userPool = cfnResources.cfnUserPool;
const userPoolClient = cfnResources.cfnUserPoolClient;

lambdaFunction.addEnvironment("USER_POOL_ID", userPool.ref);
lambdaFunction.addEnvironment("USER_POOL_CLIENT_ID", userPoolClient.ref);

// S3 Storage
const s3Bucket = backend.storage.resources.bucket;
s3Bucket.grantReadWrite(lambdaFunction); // S3への権限付与
lambdaFunction.addEnvironment("STORAGE_BUCKET_NAME", s3Bucket.bucketName);

// API Gateway
const restApi = new apigateway.RestApi(apiStack, "BlogApi", {
  restApiName: "Blog API",
  description: "Blog Platform REST API",
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ["Content-Type", "Authorization"],
  },
});

const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

// /posts
const postsResource = restApi.root.addResource("posts");
postsResource.addMethod("GET", lambdaIntegration);
postsResource.addMethod("POST", lambdaIntegration);

// /posts/{id}
const postResource = postsResource.addResource("{id}");
postResource.addMethod("GET", lambdaIntegration);
postResource.addMethod("PUT", lambdaIntegration);
postResource.addMethod("DELETE", lambdaIntegration);

// /posts/{id}/comments
const commentsResource = postResource.addResource("comments");
commentsResource.addMethod("GET", lambdaIntegration);
commentsResource.addMethod("POST", lambdaIntegration);

// /comments/{commentId}
const commentsRootResource = restApi.root.addResource("comments");
const commentResource = commentsRootResource.addResource("{commentId}");
commentResource.addMethod("DELETE", lambdaIntegration);

// Output the API URL
backend.addOutput({
  custom: {
    apiEndpoint: restApi.url,
  },
});
