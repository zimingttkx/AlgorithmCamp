/**
 * useDataExport Composable Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDataExport } from './useDataExport.js'

describe('useDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have initial state values', () => {
      const export_ = useDataExport()
      expect(export_.isExporting.value).toBe(false)
      expect(export_.isImporting.value).toBe(false)
      expect(export_.lastExportDate.value).toBeNull()
      expect(export_.lastImportDate.value).toBeNull()
    })
  })

  describe('dataSummary', () => {
    it('should provide dataSummary computed', () => {
      const { dataSummary } = useDataExport()
      expect(dataSummary.value).toBeDefined()
      expect(typeof dataSummary.value.totalKeys).toBe('number')
    })
  })

  describe('export methods', () => {
    it('should provide exportProgressJSON function', () => {
      const { exportProgressJSON } = useDataExport()
      expect(typeof exportProgressJSON).toBe('function')
    })

    it('should provide exportProgressCSV function', () => {
      const { exportProgressCSV } = useDataExport()
      expect(typeof exportProgressCSV).toBe('function')
    })

    it('should provide exportBackupJSON function', () => {
      const { exportBackupJSON } = useDataExport()
      expect(typeof exportBackupJSON).toBe('function')
    })
  })

  describe('import methods', () => {
    it('should provide importBackupJSON function', () => {
      const { importBackupJSON } = useDataExport()
      expect(typeof importBackupJSON).toBe('function')
    })

    it('should provide importProgressJSON function', () => {
      const { importProgressJSON } = useDataExport()
      expect(typeof importProgressJSON).toBe('function')
    })
  })

  describe('data management', () => {
    it('should provide clearAllData function', () => {
      const { clearAllData } = useDataExport()
      expect(typeof clearAllData).toBe('function')
    })

    it('should provide progressToArray function', () => {
      const { progressToArray } = useDataExport()
      expect(typeof progressToArray).toBe('function')
    })
  })
})
