'use strict';

import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const create = (event: LambdaEvent<{}>, context: Context, callback: LambdaCallback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  if (typeof data.text !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t create the tour item.'));
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v4(),
      text: data.text,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };

  dynamoDb.put(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t create the tour item.'));
      return;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }
    callback(null, response);
  });
}