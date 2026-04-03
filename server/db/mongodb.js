/**
 * MongoDB connection
 */
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGODB_DB || 'AlgorithmCamp'

let client = null
let db = null

async function connect() {
  if (db) return db
  
  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })
    
    await client.connect()
    db = client.db(DB_NAME)
    console.log('[DB] Connected to MongoDB')
    return db
  } catch (err) {
    console.error('[DB] Connection failed:', err.message)
    throw err
  }
}

function isConnected() {
  return !!(client && client.topology && client.topology.isConnected())
}

async function getDb() {
  if (!db) {
    await connect()
  }
  return db
}

async function close() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

// User operations
async function findUserByUsername(username) {
  const database = await getDb()
  return database.collection('users').findOne({ username })
}

async function createUser(username, passwordHash) {
  const database = await getDb()
  const result = await database.collection('users').insertOne({
    username,
    passwordHash,
    createdAt: new Date()
  })
  return result.insertedId
}

async function getUserSettings(userId) {
  const database = await getDb()
  return database.collection('settings').findOne({ userId })
}

async function updateUserSettings(userId, settings) {
  const database = await getDb()
  await database.collection('settings').updateOne(
    { userId },
    { $set: { ...settings, userId } },
    { upsert: true }
  )
}

// Progress operations
async function getProgress(userId) {
  const database = await getDb()
  const id = typeof userId === 'string' ? new ObjectId(userId) : userId
  return database.collection('progress').findOne({ userId: id })
}

async function saveProgress(userId, progress) {
  const database = await getDb()
  const id = typeof userId === 'string' ? new ObjectId(userId) : userId
  await database.collection('progress').updateOne(
    { userId: id },
    { $set: { data: progress, updatedAt: new Date() } },
    { upsert: true }
  )
}

async function updateChapterProgress(userId, chapterId, problemId, value) {
  const database = await getDb()
  await database.collection('progress').updateOne(
    { userId },
    { 
      $set: { 
        [`data.${chapterId}.${problemId}`]: value,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  )
}

// Token operations
async function storeRefreshToken(userId, tokenHash, family, expiresAt) {
  const database = await getDb()
  await database.collection('tokens').insertOne({
    userId,
    tokenHash,
    family,
    expiresAt,
    createdAt: new Date()
  })
}

async function findRefreshToken(tokenHash) {
  const database = await getDb()
  return database.collection('tokens').findOne({ tokenHash })
}

async function deleteRefreshToken(tokenHash) {
  const database = await getDb()
  await database.collection('tokens').deleteOne({ tokenHash })
}

async function revokeToken(tokenHash) {
  return deleteRefreshToken(tokenHash)
}

async function findUserById(userId) {
  const database = await getDb()
  const id = typeof userId === 'string' ? new ObjectId(userId) : userId
  return database.collection('users').findOne({ _id: id })
}

async function cleanupExpiredTokens() {
  const database = await getDb()
  await database.collection('tokens').deleteMany({
    expiresAt: { $lt: new Date() }
  })
}

// ObjectId helper
const { ObjectId } = require('mongodb')

module.exports = {
  connect,
  isConnected,
  getDb,
  close,
  findUserByUsername,
  findUserById,
  createUser,
  getUserSettings,
  updateUserSettings,
  getProgress,
  saveProgress,
  updateChapterProgress,
  storeRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  revokeToken,
  cleanupExpiredTokens,
  ObjectId
}
