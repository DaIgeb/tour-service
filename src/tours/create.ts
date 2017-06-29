'use strict';

import * as AWS from 'aws-sdk';

import { Tour } from './Tour';
import { isAuthorized } from './authorizer'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const create = (event: LambdaEvent<{}>, context: Context, callback: LambdaCallback) => {
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
  tour.create(JSON.parse(event.body), (error, result) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the tour item.'));
      return;
    }

    console.log('Create Result', result)

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