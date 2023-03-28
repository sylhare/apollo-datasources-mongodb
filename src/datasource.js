import { DataSource } from 'apollo-datasource'
import { createCachingMethods } from './cache'
import { isCollectionOrModel, isModel } from './helpers'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';

class MongoDataSource extends DataSource {
  constructor(collection) {
    super()

    if (!isCollectionOrModel(collection)) {
      throw new Error(
        'MongoDataSource constructor must be given a collection or Mongoose model'
      )
    }

    if (isModel(collection)) {
      this.model = collection
      this.collection = this.model.collection
    } else {
      this.collection = collection
    }
  }

  // https://github.com/apollographql/apollo-server/blob/master/packages/apollo-datasource/src/index.ts
  initialize({ context, cache } = {}) {
    this.context = context

    const methods = createCachingMethods({
      collection: this.collection,
      model: this.model,
      cache: cache || new InMemoryLRUCache()
    })

    Object.assign(this, methods)
  }
}

export { MongoDataSource }
