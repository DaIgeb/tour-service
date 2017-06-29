import * as jwt from 'jsonwebtoken';

export const isAuthorized = (groups: string, requiredGroup: string) => {
    return groups.indexOf(requiredGroup) !== -1;
}

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID; // 'your-auth0-client-id-here';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;  // 'your-auth0-client-secret-here';

// Policy helper function
const generatePolicy = (principalId: string, effect: string, resource: string): Policy => {
  const authResponse: Policy = {
    principalId
  };
  if (effect && resource) { 
    const policyDocument: PolicyDocument = {
      Version: '2012-10-17',
      Statement: []
    };

    const statementOne: PolicyDocumentStatement = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource,
    };

    policyDocument.Statement.push(statementOne);
    authResponse.policyDocument = policyDocument;
  }
  
  return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
export const auth = (event: LambdaEvent<{}>, context: Context, cb: LambdaCallback) => {
  if (event.authorizationToken) {
    // remove "bearer " from token
    const token = event.authorizationToken.substring(7);
    const options = {
      audience: AUTH0_CLIENT_ID,
    };
    jwt.verify(token, AUTH0_CLIENT_SECRET, options, (err, decoded: any) => {
      if (err) {
        cb('Unauthorized');
      } else {
        const policy = generatePolicy(decoded.sub, 'Allow', event.methodArn);
        policy.context = {
          email: decoded.email,
          roles : decoded.roles.join(' '),
          personId: decoded.personId
        };
        console.log(policy)
        cb(null, policy);
      }
    });
  } else {
    cb('Unauthorized');
  }
};