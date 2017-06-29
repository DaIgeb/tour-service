// Type definitions for AWS Lambda
// Definitions by: James Darbyshire (http://darb.io)

/************************************************
*                                               *
*               AWS Lambda API                  *
*                                               *
************************************************/

// Context
// http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
interface Context {
  // Properties
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: number;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: CognitoIdentity;
  clientContext?: ClientContext;

  // Functions
  succeed(result?: Object): void;
  fail(error?: Error): void;
  done(error?: Error, result?: Object): void; // result must be JSON.stringifyable
  getRemainingTimeInMillis(): number;
}

interface CognitoIdentity {
  cognito_identity_id: string;
  cognito_identity_pool_id: string;
}

interface ClientContext {
  client: ClientContextClient;
  Custom?: any;
  env: ClientContextEnv;
}

interface ClientContextClient {
  installation_id: string;
  app_title: string;
  app_version_name: string;
  app_version_code: string;
  app_package_name: string;
}

interface ClientContextEnv {
  platform_version: string;
  platform: string;
  make: string;
  model: string;
  locale: string;
}

interface HttpResponse {
  statusCode: number;
  headers: {
    "Access-Control-Allow-Origin": "*"
  };
  body: string;
}

interface LambdaCallback {
  (error: any, result?: HttpResponse | Policy): void;
}

interface LambdaEvent<TPathParameters> {
  body: string;
  pathParameters?: TPathParameters;
  headers: {
    Authorization: string;
  }
  methodArn?: string;
  authorizationToken?: string;
  requestContext: {
    stage: string;
    authorizer: {
      roles: string;
      principalId: string;
      email: string;
      personId: string;
    }
  }
}

interface Policy {
  principalId: string;
  policyDocument?: PolicyDocument;
  context?: {
    email: string;
    roles: string;
    personId: string;
  }
}

interface PolicyDocument {
  Version: string;
  Statement: PolicyDocumentStatement[];
}

interface PolicyDocumentStatement {
  Action: string;
  Effect: string;
  Resource: string;

}