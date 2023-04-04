import { MongoDataSource } from '../src'
import { MongoClient } from 'mongodb';
import mongoose, { model, Schema } from 'mongoose';
import { MockDataSource, objectID } from './utils';
import { getCollection, isCollectionOrModel, isModel } from '../src/helpers';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('MongoDataSource', () => {
  const userSchema = new Schema({ name: 'string' })
  const UserModel = model('User', userSchema)
  let server, client, userCollection

  beforeAll(async () => {
    server = await MongoMemoryServer.create()
    client = await new MongoClient(server.getUri()).connect()
    await mongoose.connect(server.getUri())
    const db = client.db('test-apollo-datasource')
    userCollection = db.collection('users')
  })

  afterAll(async () => {
    await client.close()
    await mongoose.connection.close()
    await server.stop()
  })

  it('sets up caching functions', () => {
    const source = new MockDataSource({})
    source.initialize()
    expect(source.findOneById).toBeDefined()
    expect(source.findByFields).toBeDefined()
    expect(source.deleteFromCacheById).toBeDefined()
    expect(source.deleteFromCacheByFields).toBeDefined()
    expect(source.collection).toEqual({})
  })

  test('isCollectionOrModel', () => {
    expect(isCollectionOrModel(userCollection)).toBe(true)
    expect(isCollectionOrModel(UserModel)).toBe(true)
    expect(isCollectionOrModel(Function.prototype)).toBe(false)
    expect(isCollectionOrModel(undefined)).toBe(false)
  })

  test('isModel', () => {
    expect(isModel(userCollection)).toBe(false)
    expect(isModel(UserModel)).toBe(true)
    expect(isCollectionOrModel(Function.prototype)).toBe(false)
    expect(isCollectionOrModel(undefined)).toBe(false)
  })

  test('getCollectionName', () => {
    expect(getCollection(userCollection).collectionName).toBe('users')
    expect(getCollection(UserModel).collectionName).toBe('users')
  })

  test('Data Source with Model', async () => {
    const alice = await UserModel.findOneAndUpdate(
      { name: 'Alice' },
      { name: 'Alice' },
      { upsert: true, new: true }
    )
    const users = new MockDataSource(UserModel)
    users.initialize()
    const user = await users.findOneById(alice._id)
    expect(user.name).toBe('Alice')
    expect(user.id).toBe(alice._id.toString())
  })

  test('Data Source with Collection', async () => {
    const bob = await userCollection.insertOne({ name: 'Bob' })
    const users = new MockDataSource(userCollection)
    users.initialize()

    const user = await users.findOneById(bob.insertedId)

    expect(user.name).toBe('Bob')
    expect(user.id).toBeUndefined()
  })

  test('nested findByFields', async () => {
    await userCollection.findOneAndReplace(
      { name: 'Bob' },
      { name: 'Bob', nested: { _id: objectID, field1: 'value1', field2: '' } },
      { upsert: true }
    )
    const users = new MockDataSource(userCollection)
    users.initialize()

    const [user] = await users.findByFields({ 'nested._id': objectID })

    expect(user).toBeDefined()
    expect(user.name).toBe('Bob')

    const res1 = await users.findByFields({ 'nested.field1': 'value1' })
    const res2 = await users.findByFields({ 'nested.field2': 'value1' })

    expect(res1[0].name).toBe('Bob')
    expect(res2[0]).toBeUndefined()
  })
})

