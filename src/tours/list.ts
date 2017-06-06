'use strict';

import * as AWS from 'aws-sdk';

import { isAuthenticated } from './authorizer'
import { Tour } from './Tour';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const list = (event: LambdaEvent<{}>, context: Context, callback: LambdaCallback) => {
  if (!isAuthenticated(event.headers.Authorization, event.requestContext.authorizer.claims.iss)) {
    const response = {
      statusCode: 401,
      body: JSON.stringify('Not authenticated')
    }
    callback(null, response);
    return;
  }

  const tour = new Tour(dynamoDb, event.headers.Authorization, event.requestContext.authorizer.claims.email);
  tour.list((error, result) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the tours.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(result)
    }
    callback(null, response);
  });
}
