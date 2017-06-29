'use strict';

import * as AWS from 'aws-sdk';

import { Tour } from './Tour';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const apiUrl = 'https://api.aws.daigeb.ch';

export const get = (event: LambdaEvent<{ id: string }>, context: Context, callback: LambdaCallback) => {
  console.log(event, context);
  const tour = new Tour(dynamoDb, event.headers.Authorization, event.requestContext.authorizer.email);

  tour.get(event.pathParameters.id, (error, tour) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the tour item.'));
      return;
    }

    const response: HttpResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(tour)
    };
    callback(null, response);
  });
}
