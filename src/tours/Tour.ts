import * as AWS from 'aws-sdk';
import * as request from 'superagent';
import * as uuid from 'uuid';

import { tourTable } from './config'
import { validate } from './validator'

const apiUrl = 'https://api.aws.daigeb.ch';

class Person {
  constructor(private authorization: string) { }

  public get = (id: string, callback: (error: Error, participant?: TParticipant) => void) => {
    request
      .get(`${apiUrl}/people/${id}`)
      .set('authorization', this.authorization)
      .set('Accept', 'application/json')
      .end((err, response) => callback(err, err ? null : response.body));
  }

  public create = (data: TParticipant, callback: (error: Error, participant?: TParticipant & TIdParticipant) => void) => {
    request
      .post(`${apiUrl}/people`)
      .set('authorization', this.authorization)
      .set('Accept', 'application/json')
      .send(data)
      .end((err, response) => callback(err, err ? null : response.body));
  }
}

export class Tour {
  constructor(private db: AWS.DynamoDB.DocumentClient, private authorization: string, private userEmail: string) { }

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

    this.mapParticipants(
      data.participants.slice(),
      (error, result) => {
        console.log('Mapped', error, result);
        if (error) {
          console.error(error);
          callback(new Error('Couldn\'t create the tour item.'));
          return;
        }

        const timestamp = new Date().getTime();
        const params = {
          TableName: tourTable,
          Item: {
            ...data,
            participants: result,
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
    );
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

    this.mapParticipants(
      data.participants.slice(),
      (error, result) => {
        if (error) {
          console.error(error);
          callback(new Error('Couldn\'t create the tour item.'));
          return;
        }

        const timestamp = new Date().getTime();
        const params = {
          TableName: tourTable,
          Item: {
            ...data,
            participants: result,
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
    );
  }

  private isIdParticipant = (participant: TIdParticipant | TParticipant): participant is TIdParticipant => participant.hasOwnProperty('id');

  private mapParticipants = (participants: TParticipants, callback: (error: Error, participants: TIdParticipant[]) => void) => {
    const person = new Person(this.authorization);

    const result: TIdParticipant[] = [];
    const map = () => {
      const p = participants.pop();
      console.log(participants, p)
      if (p) {
        if (this.isIdParticipant(p)) {
          result.push(p);
          map();
        } else {
          person.create(p, (err, participant) => {
            if (err) {
              callback(err, null);
              return;
            } else if (!participant) {
              callback(new Error('Couldn\'t map participant'), null);
              return;
            } else {
              result.push({ id: participant.id });
            }
            map();
          });
        }
      } else {
        callback(null, result);
      }
    };

    map();
  }
}