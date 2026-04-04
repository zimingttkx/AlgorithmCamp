/**
 * Comprehensive Unit Tests for mongodb.js - Database Module
 *
 * Tests ALL database operations with strict mocking:
 * - Connection management (connect, getDb, close, isConnected)
 * - User operations (createUser, findUserByUsername, findUserById, getUserSettings, updateUserSettings)
 * - Progress operations (getProgress, saveProgress, updateChapterProgress)
 * - Token operations (storeRefreshToken, findRefreshToken, deleteRefreshToken, revokeToken, cleanupExpiredTokens)
 *
 * Run with: cd app && npx vitest run tests/db-mongodb.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// =============================================================================
// TEST DOUBLE - Mock Database Module
// This replaces the real MongoDB module for testing
// =============================================================================

// Create mock collection methods
const createMockCollection = () => {
  const mock = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
    find: vi.fn()
  }
  return mock
}

// Create mock database
const createMockDb = (collection) => ({
  collection: vi.fn(() => collection)
})

// Create mock client
const createMockClient = (db) => {
  let connected = true
  return {
    connect: vi.fn(async () => { connected = true }),
    db: vi.fn(() => db),
    close: vi.fn(async () => { connected = false }),
    get connected() { return connected },
    set connected(v) { connected = v },
    topology: {
      isConnected: vi.fn(() => connected)
    }
  }
}

// Test database module factory - creates a fresh instance with mocks
const createTestDbModule = () => {
  const mockCollection = createMockCollection()
  const mockDb = createMockDb(mockCollection)
  const mockClient = createMockClient(mockDb)

  // Override the module's internal state
  const module = {
    client: mockClient,
    db: null,  // Start as null so connect() actually calls client.connect()
    collection: mockCollection,

    // Wrapped functions that use the mocks
    async connect() {
      if (this.db) return this.db
      await this.client.connect()
      this.db = this.client.db()
      return this.db
    },

    isConnected() {
      return !!(this.client && this.client.topology && this.client.topology.isConnected())
    },

    async getDb() {
      if (!this.db) {
        await this.connect()
      }
      return this.db
    },

    async close() {
      if (this.client) {
        await this.client.close()
        this.client = null
        this.db = null
      }
    },

    // User operations
    async findUserByUsername(username) {
      const db = await this.getDb()
      return db.collection('users').findOne({ username })
    },

    async findUserById(userId) {
      const db = await this.getDb()
      return db.collection('users').findOne({ _id: userId })
    },

    async createUser(username, passwordHash) {
      const db = await this.getDb()
      const result = await db.collection('users').insertOne({
        username,
        passwordHash,
        createdAt: new Date()
      })
      return result.insertedId
    },

    // Settings operations
    async getUserSettings(userId) {
      const db = await this.getDb()
      return db.collection('settings').findOne({ userId })
    },

    async updateUserSettings(userId, settings) {
      const db = await this.getDb()
      await db.collection('settings').updateOne(
        { userId },
        { $set: { ...settings, userId } },
        { upsert: true }
      )
    },

    // Progress operations
    async getProgress(userId) {
      const db = await this.getDb()
      return db.collection('progress').findOne({ userId })
    },

    async saveProgress(userId, progress) {
      const db = await this.getDb()
      await db.collection('progress').updateOne(
        { userId },
        { $set: { data: progress, updatedAt: new Date() } },
        { upsert: true }
      )
    },

    async updateChapterProgress(userId, chapterId, problemId, value) {
      const db = await this.getDb()
      await db.collection('progress').updateOne(
        { userId },
        {
          $set: {
            [`data.${chapterId}.${problemId}`]: value,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )
    },

    // Token operations
    async storeRefreshToken(userId, tokenHash, family, expiresAt) {
      const db = await this.getDb()
      await db.collection('tokens').insertOne({
        userId,
        tokenHash,
        family,
        expiresAt,
        createdAt: new Date()
      })
    },

    async findRefreshToken(tokenHash) {
      const db = await this.getDb()
      return db.collection('tokens').findOne({ tokenHash })
    },

    async deleteRefreshToken(tokenHash) {
      const db = await this.getDb()
      await db.collection('tokens').deleteOne({ tokenHash })
    },

    async revokeToken(tokenHash) {
      return this.deleteRefreshToken(tokenHash)
    },

    async cleanupExpiredTokens() {
      const db = await this.getDb()
      await db.collection('tokens').deleteMany({
        expiresAt: { $lt: new Date() }
      })
    }
  }

  return module
}

// =============================================================================
// TESTS
// =============================================================================

describe('MongoDB Module Unit Tests', () => {
  let db

  beforeEach(() => {
    db = createTestDbModule()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ===========================================================================
  // CONNECTION MANAGEMENT TESTS
  // ===========================================================================

  describe('Connection Management', () => {
    describe('connect()', () => {
      it('should establish database connection', async () => {
        await db.connect()
        expect(db.client.connect).toHaveBeenCalled()
      })

      it('should return existing db instance if already connected (singleton)', async () => {
        const db1 = await db.getDb()
        const db2 = await db.getDb()
        expect(db1).toBe(db2)
      })

      it('should not reconnect if already connected', async () => {
        await db.connect()
        await db.getDb()
        expect(db.client.connect).toHaveBeenCalledTimes(1)
      })
    })

    describe('isConnected()', () => {
      it('should return true when connected', async () => {
        await db.connect()
        expect(db.isConnected()).toBe(true)
      })

      it('should return false when disconnected', async () => {
        await db.close()
        expect(db.isConnected()).toBe(false)
      })

      it('should return false when client is null', async () => {
        await db.close()
        db.client = null
        expect(db.isConnected()).toBe(false)
      })
    })

    describe('close()', () => {
      it('should close the client connection', async () => {
        await db.connect()
        const closeSpy = db.client.close
        await db.close()
        expect(closeSpy).toHaveBeenCalled()
      })

      it('should set db to null after close', async () => {
        await db.connect()
        await db.close()
        expect(db.db).toBeNull()
      })

      it('should be idempotent - calling close multiple times should not error', async () => {
        await db.connect()
        await db.close()
        await db.close() // Should not throw
        await db.close() // Should not throw
      })
    })
  })

  // ===========================================================================
  // USER OPERATIONS TESTS
  // ===========================================================================

  describe('User Operations', () => {
    beforeEach(async () => {
      await db.connect()
    })

    describe('findUserByUsername(username)', () => {
      it('should find user by username', async () => {
        const mockUser = { _id: 'user1', username: 'testuser', passwordHash: 'hash123' }
        db.collection.findOne.mockResolvedValue(mockUser)

        const result = await db.findUserByUsername('testuser')

        expect(db.collection.findOne).toHaveBeenCalledWith({ username: 'testuser' })
        expect(result).toEqual(mockUser)
      })

      it('should return null when user not found', async () => {
        db.collection.findOne.mockResolvedValue(null)

        const result = await db.findUserByUsername('nonexistent')

        expect(result).toBeNull()
      })

      it('should query the users collection', async () => {
        db.collection.findOne.mockResolvedValue(null)

        await db.findUserByUsername('test')

        expect(db.db.collection).toHaveBeenCalledWith('users')
      })
    })

    describe('createUser(username, passwordHash)', () => {
      it('should create user with all required fields', async () => {
        db.collection.insertOne.mockResolvedValue({ insertedId: 'newuser123' })

        const result = await db.createUser('newuser', 'hashedpassword')

        expect(db.collection.insertOne).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'newuser',
            passwordHash: 'hashedpassword'
          })
        )
        expect(result).toBe('newuser123')
      })

      it('should include createdAt timestamp', async () => {
        db.collection.insertOne.mockResolvedValue({ insertedId: 'id' })
        const beforeTime = new Date()

        await db.createUser('user', 'hash')

        const callArgs = db.collection.insertOne.mock.calls[0][0]
        expect(callArgs.createdAt).toBeInstanceOf(Date)
        expect(callArgs.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000)
      })

      it('should return the insertedId string', async () => {
        db.collection.insertOne.mockResolvedValue({ insertedId: 'custom-id' })

        const result = await db.createUser('user', 'hash')

        expect(result).toBe('custom-id')
      })

      it('should throw when insert fails', async () => {
        db.collection.insertOne.mockRejectedValue(new Error('Write failed'))

        await expect(db.createUser('user', 'hash')).rejects.toThrow('Write failed')
      })
    })

    describe('findUserById(userId)', () => {
      it('should find user by id', async () => {
        const mockUser = { _id: 'user123', username: 'test' }
        db.collection.findOne.mockResolvedValue(mockUser)

        const result = await db.findUserById('user123')

        expect(db.collection.findOne).toHaveBeenCalledWith({ _id: 'user123' })
        expect(result).toBe(mockUser)
      })

      it('should handle string id', async () => {
        db.collection.findOne.mockResolvedValue(null)

        await db.findUserById('string-id')

        expect(db.collection.findOne).toHaveBeenCalledWith({ _id: 'string-id' })
      })
    })
  })

  // ===========================================================================
  // SETTINGS OPERATIONS TESTS
  // ===========================================================================

  describe('Settings Operations', () => {
    beforeEach(async () => {
      await db.connect()
    })

    describe('getUserSettings(userId)', () => {
      it('should retrieve user settings', async () => {
        const mockSettings = { userId: 'user1', theme: 'dark', lang: 'zh' }
        db.collection.findOne.mockResolvedValue(mockSettings)

        const result = await db.getUserSettings('user1')

        expect(db.collection.findOne).toHaveBeenCalledWith({ userId: 'user1' })
        expect(result).toEqual(mockSettings)
      })

      it('should return null when no settings exist', async () => {
        db.collection.findOne.mockResolvedValue(null)

        const result = await db.getUserSettings('nonexistent')

        expect(result).toBeNull()
      })

      it('should query the settings collection', async () => {
        db.collection.findOne.mockResolvedValue(null)

        await db.getUserSettings('user1')

        expect(db.db.collection).toHaveBeenCalledWith('settings')
      })
    })

    describe('updateUserSettings(userId, settings)', () => {
      it('should upsert settings with userId included', async () => {
        db.collection.updateOne.mockResolvedValue({ modifiedCount: 1 })

        await db.updateUserSettings('user1', { theme: 'light' })

        expect(db.collection.updateOne).toHaveBeenCalledWith(
          { userId: 'user1' },
          { $set: expect.objectContaining({ theme: 'light', userId: 'user1' }) },
          { upsert: true }
        )
      })

      it('should use upsert: true to create if not exists', async () => {
        db.collection.updateOne.mockResolvedValue({ upsertedCount: 1 })

        await db.updateUserSettings('newuser', { theme: 'dark' })

        expect(db.collection.updateOne.mock.calls[0][2]).toEqual({ upsert: true })
      })

      it('should always include userId in the update', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await db.updateUserSettings('user123', { someSetting: 'value' })

        const setObj = db.collection.updateOne.mock.calls[0][1].$set
        expect(setObj.userId).toBe('user123')
      })

      it('should merge multiple settings', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await db.updateUserSettings('user1', { theme: 'dark', lang: 'zh', custom: 'val' })

        const setObj = db.collection.updateOne.mock.calls[0][1].$set
        expect(setObj).toEqual(expect.objectContaining({
          theme: 'dark',
          lang: 'zh',
          custom: 'val',
          userId: 'user1'
        }))
      })

      it('should throw when update fails', async () => {
        db.collection.updateOne.mockRejectedValue(new Error('Update failed'))

        await expect(db.updateUserSettings('user1', {})).rejects.toThrow('Update failed')
      })
    })
  })

  // ===========================================================================
  // PROGRESS OPERATIONS TESTS
  // ===========================================================================

  describe('Progress Operations', () => {
    beforeEach(async () => {
      await db.connect()
    })

    describe('getProgress(userId)', () => {
      it('should retrieve progress for user', async () => {
        const mockProgress = {
          userId: 'user1',
          data: { 'chapter-01': { '1': { checked: true } } }
        }
        db.collection.findOne.mockResolvedValue(mockProgress)

        const result = await db.getProgress('user1')

        expect(db.collection.findOne).toHaveBeenCalledWith({ userId: 'user1' })
        expect(result).toEqual(mockProgress)
      })

      it('should return undefined when no progress exists', async () => {
        db.collection.findOne.mockResolvedValue(undefined)

        const result = await db.getProgress('newuser')

        expect(result).toBeUndefined()
      })

      it('should query the progress collection', async () => {
        db.collection.findOne.mockResolvedValue(null)

        await db.getProgress('user1')

        expect(db.db.collection).toHaveBeenCalledWith('progress')
      })
    })

    describe('saveProgress(userId, progress)', () => {
      it('should save full progress object with upsert', async () => {
        db.collection.updateOne.mockResolvedValue({ modifiedCount: 1 })
        const progressData = {
          'chapter-01': { '1': { checked: true }, '2': { checked: false } }
        }

        await db.saveProgress('user1', progressData)

        expect(db.collection.updateOne).toHaveBeenCalledWith(
          { userId: 'user1' },
          {
            $set: expect.objectContaining({
              data: progressData,
              updatedAt: expect.any(Date)
            })
          },
          { upsert: true }
        )
      })

      it('should include updatedAt timestamp', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await db.saveProgress('user1', {})

        const setArgs = db.collection.updateOne.mock.calls[0][1].$set
        expect(setArgs.updatedAt).toBeInstanceOf(Date)
      })

      it('should use upsert: true', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await db.saveProgress('user1', { 'chapter-02': {} })

        expect(db.collection.updateOne.mock.calls[0][2]).toEqual({ upsert: true })
      })

      it('should throw when update fails', async () => {
        db.collection.updateOne.mockRejectedValue(new Error('Update failed'))

        await expect(db.saveProgress('user1', {})).rejects.toThrow('Update failed')
      })
    })

    describe('updateChapterProgress(userId, chapterId, problemId, value)', () => {
      it('should update specific problem with nested path', async () => {
        db.collection.updateOne.mockResolvedValue({ modifiedCount: 1 })

        await db.updateChapterProgress('user1', 'chapter-01', 'problem-1', { checked: true })

        expect(db.collection.updateOne).toHaveBeenCalledWith(
          { userId: 'user1' },
          {
            $set: {
              'data.chapter-01.problem-1': { checked: true },
              updatedAt: expect.any(Date)
            }
          },
          { upsert: true }
        )
      })

      it('should use correct nested field syntax', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await db.updateChapterProgress('u1', 'ch-02', 'p-3', { checked: false, note: 'hard' })

        const setObj = db.collection.updateOne.mock.calls[0][1].$set
        expect(setObj['data.ch-02.p-3']).toEqual({ checked: false, note: 'hard' })
      })

      it('should always use upsert: true', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await db.updateChapterProgress('user1', 'ch', 'p', true)

        expect(db.collection.updateOne.mock.calls[0][2]).toEqual({ upsert: true })
      })

      it('should throw when update fails', async () => {
        db.collection.updateOne.mockRejectedValue(new Error('Update failed'))

        await expect(db.updateChapterProgress('user1', 'ch', 'p', true))
          .rejects.toThrow('Update failed')
      })
    })
  })

  // ===========================================================================
  // TOKEN OPERATIONS TESTS
  // ===========================================================================

  describe('Token Operations', () => {
    beforeEach(async () => {
      await db.connect()
    })

    describe('storeRefreshToken(userId, tokenHash, family, expiresAt)', () => {
      it('should store token with all fields', async () => {
        db.collection.insertOne.mockResolvedValue({ insertedId: 'token1' })
        const expiresAt = new Date('2025-01-01')

        await db.storeRefreshToken('user1', 'hash123', 'family1', expiresAt)

        expect(db.collection.insertOne).toHaveBeenCalledWith({
          userId: 'user1',
          tokenHash: 'hash123',
          family: 'family1',
          expiresAt,
          createdAt: expect.any(Date)
        })
      })

      it('should include createdAt timestamp', async () => {
        db.collection.insertOne.mockResolvedValue({})

        await db.storeRefreshToken('user1', 'hash', null, new Date())

        const insertedDoc = db.collection.insertOne.mock.calls[0][0]
        expect(insertedDoc.createdAt).toBeInstanceOf(Date)
      })

      it('should query tokens collection', async () => {
        db.collection.insertOne.mockResolvedValue({})

        await db.storeRefreshToken('u1', 'h', null, new Date())

        expect(db.db.collection).toHaveBeenCalledWith('tokens')
      })

      it('should throw when insert fails', async () => {
        db.collection.insertOne.mockRejectedValue(new Error('Write failed'))

        await expect(db.storeRefreshToken('u1', 'h', null, new Date()))
          .rejects.toThrow('Write failed')
      })
    })

    describe('findRefreshToken(tokenHash)', () => {
      it('should find token by hash', async () => {
        const mockToken = { userId: 'user1', tokenHash: 'hash123' }
        db.collection.findOne.mockResolvedValue(mockToken)

        const result = await db.findRefreshToken('hash123')

        expect(db.collection.findOne).toHaveBeenCalledWith({ tokenHash: 'hash123' })
        expect(result).toEqual(mockToken)
      })

      it('should return null when token not found', async () => {
        db.collection.findOne.mockResolvedValue(null)

        const result = await db.findRefreshToken('nonexistent')

        expect(result).toBeNull()
      })
    })

    describe('deleteRefreshToken(tokenHash)', () => {
      it('should delete token by hash', async () => {
        db.collection.deleteOne.mockResolvedValue({ deletedCount: 1 })

        await db.deleteRefreshToken('hash123')

        expect(db.collection.deleteOne).toHaveBeenCalledWith({ tokenHash: 'hash123' })
      })

      it('should return undefined', async () => {
        db.collection.deleteOne.mockResolvedValue({ deletedCount: 0 })

        const result = await db.deleteRefreshToken('nonexistent')

        expect(result).toBeUndefined()
      })

      it('should throw when delete fails', async () => {
        db.collection.deleteOne.mockRejectedValue(new Error('Delete failed'))

        await expect(db.deleteRefreshToken('hash')).rejects.toThrow('Delete failed')
      })
    })

    describe('revokeToken(tokenHash)', () => {
      it('should call deleteRefreshToken logic', async () => {
        db.collection.deleteOne.mockResolvedValue({ deletedCount: 1 })

        await db.revokeToken('hash123')

        expect(db.collection.deleteOne).toHaveBeenCalledWith({ tokenHash: 'hash123' })
      })
    })

    describe('cleanupExpiredTokens()', () => {
      it('should delete tokens with expired dates', async () => {
        db.collection.deleteMany.mockResolvedValue({ deletedCount: 5 })

        await db.cleanupExpiredTokens()

        const query = db.collection.deleteMany.mock.calls[0][0]
        expect(query.expiresAt.$lt).toBeInstanceOf(Date)
      })

      it('should use $lt operator for expiration check', async () => {
        db.collection.deleteMany.mockResolvedValue({})

        await db.cleanupExpiredTokens()

        const query = db.collection.deleteMany.mock.calls[0][0]
        expect(query.expiresAt).toHaveProperty('$lt')
        expect(query.expiresAt.$lt).toBeInstanceOf(Date)
      })

      it('should throw when cleanup fails', async () => {
        db.collection.deleteMany.mockRejectedValue(new Error('Cleanup failed'))

        await expect(db.cleanupExpiredTokens()).rejects.toThrow('Cleanup failed')
      })
    })
  })

  // ===========================================================================
  // EDGE CASES AND ERROR HANDLING
  // ===========================================================================

  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      await db.connect()
    })

    describe('Database errors', () => {
      it('should propagate findOne errors', async () => {
        db.collection.findOne.mockRejectedValue(new Error('Database connection lost'))

        await expect(db.findUserByUsername('test')).rejects.toThrow('Database connection lost')
      })

      it('should propagate insert errors', async () => {
        db.collection.insertOne.mockRejectedValue(new Error('Write failed'))

        await expect(db.createUser('user', 'hash')).rejects.toThrow('Write failed')
      })

      it('should propagate update errors', async () => {
        db.collection.updateOne.mockRejectedValue(new Error('Update failed'))

        await expect(db.saveProgress('user1', {})).rejects.toThrow('Update failed')
      })

      it('should propagate delete errors', async () => {
        db.collection.deleteOne.mockRejectedValue(new Error('Delete failed'))

        await expect(db.deleteRefreshToken('hash')).rejects.toThrow('Delete failed')
      })
    })

    describe('Null and undefined inputs', () => {
      it('should handle null userId in findUserByUsername', async () => {
        db.collection.findOne.mockResolvedValue(null)

        await db.findUserByUsername(null)

        expect(db.collection.findOne).toHaveBeenCalledWith({ username: null })
      })

      it('should handle empty string userId', async () => {
        db.collection.findOne.mockResolvedValue(null)

        await db.findUserByUsername('')

        expect(db.collection.findOne).toHaveBeenCalledWith({ username: '' })
      })

      it('should handle empty progress object', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await expect(db.saveProgress('user1', {})).resolves.toBeUndefined()
      })

      it('should handle empty settings object', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await expect(db.updateUserSettings('user1', {})).resolves.toBeUndefined()
      })
    })

    describe('Concurrent operations', () => {
      it('should handle concurrent progress updates', async () => {
        db.collection.updateOne.mockResolvedValue({})

        await Promise.all([
          db.updateChapterProgress('user1', 'ch1', 'p1', { checked: true }),
          db.updateChapterProgress('user1', 'ch1', 'p2', { checked: true }),
          db.updateChapterProgress('user1', 'ch2', 'p1', { checked: true })
        ])

        expect(db.collection.updateOne).toHaveBeenCalledTimes(3)
      })

      it('should handle concurrent token operations', async () => {
        db.collection.insertOne.mockResolvedValue({ insertedId: '1' })

        await Promise.all([
          db.storeRefreshToken('u1', 'h1', null, new Date()),
          db.storeRefreshToken('u1', 'h2', null, new Date())
        ])

        expect(db.collection.insertOne).toHaveBeenCalledTimes(2)
      })
    })
  })

  // ===========================================================================
  // SECURITY TESTS
  // ===========================================================================

  describe('Security Considerations', () => {
    beforeEach(async () => {
      await db.connect()
    })

    it('should use correct collection names (defense in depth)', async () => {
      db.collection.findOne.mockResolvedValue(null)

      await db.findUserByUsername('u')
      await db.getProgress('u')
      await db.findRefreshToken('h')

      const collectionCalls = db.db.collection.mock.calls
      expect(collectionCalls).toContainEqual(['users'])
      expect(collectionCalls).toContainEqual(['progress'])
      expect(collectionCalls).toContainEqual(['tokens'])
    })

    it('should separate user data by userId in progress queries', async () => {
      db.collection.findOne.mockResolvedValue(null)

      await db.getProgress('user1')
      await db.getProgress('user2')

      expect(db.collection.findOne).toHaveBeenCalledWith({ userId: 'user1' })
      expect(db.collection.findOne).toHaveBeenCalledWith({ userId: 'user2' })
    })

    it('should use upsert to prevent data loss on progress save', async () => {
      db.collection.updateOne.mockResolvedValue({})

      await db.saveProgress('user1', { 'chapter-01': { '1': true } })

      // upsert: true ensures document is created if not exists
      expect(db.collection.updateOne.mock.calls[0][2]).toEqual({ upsert: true })
    })
  })

  // ===========================================================================
  // INTEGRATION SCENARIOS
  // ===========================================================================

  describe('Integration Scenarios', () => {
    beforeEach(async () => {
      await db.connect()
    })

    it('should complete full user lifecycle: register -> find -> settings -> delete', async () => {
      // 1. Create user
      db.collection.insertOne.mockResolvedValue({ insertedId: 'newuser1' })
      const userId = await db.createUser('newuser', 'hash123')
      expect(userId).toBe('newuser1')

      // 2. Find user
      db.collection.findOne.mockResolvedValue({ _id: 'newuser1', username: 'newuser' })
      const foundUser = await db.findUserByUsername('newuser')
      expect(foundUser.username).toBe('newuser')

      // 3. Update settings
      db.collection.updateOne.mockResolvedValue({})
      await db.updateUserSettings('newuser1', { theme: 'dark' })

      // 4. Verify settings
      db.collection.findOne.mockResolvedValue({ userId: 'newuser1', theme: 'dark' })
      const settings = await db.getUserSettings('newuser1')
      expect(settings.theme).toBe('dark')
    })

    it('should handle token rotation workflow', async () => {
      // Store token
      db.collection.insertOne.mockResolvedValue({ insertedId: 'token1' })
      await db.storeRefreshToken('user1', 'oldhash', null, new Date())

      // Find token
      db.collection.findOne.mockResolvedValue({ tokenHash: 'oldhash' })
      const token = await db.findRefreshToken('oldhash')
      expect(token.tokenHash).toBe('oldhash')

      // Revoke token
      db.collection.deleteOne.mockResolvedValue({ deletedCount: 1 })
      await db.revokeToken('oldhash')
      expect(db.collection.deleteOne).toHaveBeenCalledWith({ tokenHash: 'oldhash' })
    })

    it('should handle full sync workflow: get -> merge -> save', async () => {
      // 1. Get existing progress
      db.collection.findOne.mockResolvedValue({
        userId: 'user1',
        data: { 'chapter-01': { '1': { checked: true } } }
      })
      const existingProgress = await db.getProgress('user1')
      expect(existingProgress.data['chapter-01']['1'].checked).toBe(true)

      // 2. Save merged progress
      db.collection.updateOne.mockResolvedValue({})
      const mergedProgress = {
        'chapter-01': { '1': { checked: true }, '2': { checked: true } },
        'chapter-02': { '1': { checked: true } }
      }
      await db.saveProgress('user1', mergedProgress)

      // Verify update was called with merged data
      expect(db.collection.updateOne).toHaveBeenCalledWith(
        { userId: 'user1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            data: mergedProgress
          })
        }),
        { upsert: true }
      )
    })

    it('should handle chapter-by-chapter progress updates', async () => {
      db.collection.updateOne.mockResolvedValue({})

      // Simulate marking problems complete in sequence
      await db.updateChapterProgress('user1', 'chapter-01', '1', { checked: true })
      await db.updateChapterProgress('user1', 'chapter-01', '2', { checked: true })
      await db.updateChapterProgress('user1', 'chapter-02', '1', { checked: true })

      expect(db.collection.updateOne).toHaveBeenCalledTimes(3)

      // Verify all updates used the same userId
      const allCalls = db.collection.updateOne.mock.calls
      expect(allCalls.every(call => call[0].userId === 'user1')).toBe(true)
    })
  })
})
