'use strict';

import * as AWS from 'aws-sdk';

import { isAuthorized } from './authorizer'
import { Tour } from './Tour';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const update = (event: LambdaEvent<{ id: string }>, context: Context, callback: LambdaCallback) => {
  if (!isAuthorized(event.requestContext.authorizer.roles, 'tester')) {
    const response: HttpResponse = {
      statusCode: 403,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify('Not authorized')
    }
    callback(null, response);
    return;
  }

  const tour = new Tour(dynamoDb, event.headers.Authorization, event.requestContext.authorizer.email);
  tour.update(event.pathParameters.id, JSON.parse(event.body), (error, result) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t update the tour item.'));
      return;
    }

    const response: HttpResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(result)
    }
    callback(null, response);
  });
}