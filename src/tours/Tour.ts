import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

import { tourTable } from './config'
import { validate } from './validator'

export class Tour {
  constructor(private db: AWS.DynamoDB.DocumentClient, private userEmail: string) { }

  public get = (id: string, callback: (error: Error, tour?: TTour) => void) => {
    const params = {
      TableName: tourTable,
      Key: {
        id
      }
    };

    this.db.get(params, (error, result) => {
      if (error) {
        console.error(error);
        callback(new Error('Couldn\'t fetch the tour item.'));
        return;
      }

      const tour = result.Item as TTour;

      callback(null, tour);
    });
  }

  public list = (callback: (error: Error, tour?: TTour[]) => void) => {
    const params = {
      TableName: tourTable
    };

    this.db.scan(params, (error, result) => {
      if (error) {
        console.error(error);
        callback(new Error('Couldn\'t fetch the tours.'));
        return;
      }

      callback(null, result.Items as TTour[]);
    });
  }

  public create = (data: TTour, callback: (error: Error, tour?: TTour) => void) => {
    if (!validate(data)) {
      console.error('Validation Failed');
      callback(new Error('Couldn\'t create the tour item.'));
      return;
    }

    const timestamp = new Date().getTime();
    const params = {
      TableName: tourTable,
      Item: {
        ...data,
        id: uuid.v4(),
        user: this.userEmail,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    };

    this.db.put(params, (error, result) => {
      console.log('Put', error, result)
      if (error) {
        console.error(error);
        callback(new Error('Couldn\'t create the tour item.'));
        return;
      }

      callback(null, params.Item as any as TTour);
    });
  }

  public update = (id: string, tour: TTour, callback: (error: Error, tour?: TTour) => void) => {
    const data = {
      ...tour,
      id,
    };

    if (!validate(data)) {
      console.error('Validation Failed');
      callback(new Error('Couldn\'t create the tour item.'));
      return;
    }

    const timestamp = new Date().getTime();
    const params = {
      TableName: tourTable,
      Item: {
        ...data,
        updateAt: timestamp
      }
    };

    this.db.put(params, (error, result) => {
      if (error) {
        console.error(error);
        callback(new Error('Couldn\'t create the tour item.'));
        return;
      }

      callback(null, params.Item as any as TTour);
    });
  }
}