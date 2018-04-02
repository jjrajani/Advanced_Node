const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const redisUrl = keys.redisUrl;
const client = redis.createClient(redisUrl);
// override original with promise version of original
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function (options = {}) {
  this._cache = true;
  this._hashKey = JSON.stringify(options.key || '');

  return this;
}

const generateCacheKey = mogoQuery => {
  return JSON.stringify(Object.assign({}, mogoQuery.getQuery(), {
    collection: mogoQuery.mongooseCollection.name
  }));
}

mongoose.Query.prototype.exec = async function () {
  // client.flushall();
  if (!this._cache)
    return await exec.apply(this, arguments);

  const key = generateCacheKey(this);
  const cached = await client.hget(this._hashKey, key);

  if (cached) {
    const doc = JSON.parse(cached);

    // result will be a mongoose document object instance - NOT JSON
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this._hashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
}
