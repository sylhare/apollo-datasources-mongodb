import { ObjectId } from 'mongodb';
import { MongoDataSource } from '../src/datasource';

export const hexId = '5cf82e14a220a607eb64a7d4'
export const objectID = new ObjectId(hexId)

export const wait = (amount = 0) => new Promise(resolve => setTimeout(resolve, amount));

export class MockDataSource extends MongoDataSource {
  initialize(config) {
    super.initialize(config)
  }
}
