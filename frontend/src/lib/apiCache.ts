import { createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

const apiCacheSchema = {
  version: 0,
  primaryKey: 'url',
  type: 'object',
  properties: {
    url: {
      type: 'string',
      maxLength: 1000
    },
    data: {
      type: 'string'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: ['url', 'data', 'updatedAt']
};

let dbPromise: Promise<RxDatabase> | null = null;

export const getApiCacheDb = async () => {
  if (!dbPromise) {
    dbPromise = createRxDatabase({
      name: 'apicachedb',
      storage: getRxStorageDexie(),
      ignoreDuplicate: true
    }).then(async (db) => {
      await db.addCollections({
        apicache: {
          schema: apiCacheSchema
        }
      });
      return db;
    });
  }
  return dbPromise;
};

export const saveToCache = async (url: string, data: string) => {
  try {
    const db = await getApiCacheDb();
    await db.apicache.upsert({
      url,
      data,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('[ApiCache] Failed to save to cache:', error);
  }
};

export const getCachedResponse = async (url: string): Promise<string | null> => {
  try {
    const db = await getApiCacheDb();
    const doc = await db.apicache.findOne(url).exec();
    if (doc) {
      return doc.data;
    }
  } catch (error) {
    console.error('[ApiCache] Failed to read from cache:', error);
  }
  return null;
};
