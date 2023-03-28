import { MongoDataSource } from '../datasource'
import { MockDataSource } from './utils';

describe('MongoDataSource', () => {
  it('sets up caching functions', () => {
    const users = {}
    const source = new MockDataSource(users)
    source.initialize()
    expect(source.findOneById).toBeDefined()
    expect(source.findByFields).toBeDefined()
    expect(source.deleteFromCacheById).toBeDefined()
    expect(source.deleteFromCacheByFields).toBeDefined()
    expect(source.collection).toEqual(users)
  })
})

