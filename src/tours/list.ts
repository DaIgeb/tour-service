'use strict';

import * as AWS from 'aws-sdk';

import { Tour } from './Tour';
import { isAuthorized } from './authorizer';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const list = (event: LambdaEvent<{}>, context: Context, callback: LambdaCallback) => {
  console.log(event, context);
  const isAdmin = true || isAuthorized(event.requestContext.authorizer.roles, 'Admin');
  const tour = new Tour(dynamoDb, event.headers.Authorization, event.requestContext.authorizer.email);
  tour.list((error, result) => {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the tours.'));
      return;
    }

    const response: HttpResponse = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*" 
      },
      body: JSON.stringify(isAdmin ? result : mapTours(result, event.requestContext.authorizer.personId))
    }
    callback(null, response);
  });
}

const mapTours = (tours: TTour[], personId: string) => {
  return tours.map((t) => ({
    ...t,
    participants: t.participants.map((p: TIdParticipant, idx) => p.id !== personId ? ({ id: idx.toString() }) : p)
  }))
}
