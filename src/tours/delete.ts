'use strict';

import * as AWS from 'aws-sdk';

import { tourTable } from './config'

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const remove = (event: LambdaEvent<{ id: string }>, context: Context, callback: LambdaCallback) => {
  const params = {
    TableName: tourTable,
    Key: {
      id: event.pathParameters.id
    }
  };

  dynamoDb.delete(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t delete the tour item.'));
      return;
    }

    const response: HttpResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*" 
      },
      body: JSON.stringify({})
    }
    callback(null, response);
  });
}