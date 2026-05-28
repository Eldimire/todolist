import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTodayKST,
  formatDate,
  isDateBeforeToday,
  isDateAfterToday,
} from '../../utils/dateUtils'

describe('dateUtils', () => {
  describe('getTodayKST', () => {
    it('YYYY-MM-DD 형식을 반환한다', () => {
      const result = getTodayKST()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('월과 일이 2자리 패딩으로 반환된다', () => {
      vi.setSystemTime(new Date('2026-01-05T00:00:00Z'))
      const result = getTodayKST()
      expect(result.split('-')[1].length).toBe(2)
      expect(result.split('-')[2].length).toBe(2)
      vi.useRealTimers()
    })

    it('UTC 자정(00:00)은 KST 기준 09:00이므로 같은 날짜를 반환한다', () => {
      vi.setSystemTime(new Date('2026-05-28T00:00:00Z'))
      const result = getTodayKST()
      expect(result).toBe('2026-05-28')
      vi.useRealTimers()
    })

    it('UTC 15:00은 KST 자정(00:00)이므로 다음날을 반환한다', () => {
      vi.setSystemTime(new Date('2026-05-28T15:00:00Z'))
      const result = getTodayKST()
      expect(result).toBe('2026-05-29')
      vi.useRealTimers()
    })
  })

  describe('formatDate', () => {
    it('YYYY-MM-DD를 YYYY.MM.DD로 변환한다', () => {
      expect(formatDate('2026-05-28')).toBe('2026.05.28')
    })

    it('빈 문자열을 입력하면 빈 문자열을 반환한다', () => {
      expect(formatDate('')).toBe('')
    })

    it('월/일 패딩을 유지한다', () => {
      expect(formatDate('2026-01-05')).toBe('2026.01.05')
    })
  })

  describe('isDateBeforeToday', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-05-28T00:00:00Z'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('오늘보다 이전 날짜는 true를 반환한다', () => {
      expect(isDateBeforeToday('2026-05-27')).toBe(true)
    })

    it('오늘 날짜는 false를 반환한다', () => {
      expect(isDateBeforeToday('2026-05-28')).toBe(false)
    })

    it('오늘보다 이후 날짜는 false를 반환한다', () => {
      expect(isDateBeforeToday('2026-05-29')).toBe(false)
    })
  })

  describe('isDateAfterToday', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-05-28T00:00:00Z'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('오늘보다 이후 날짜는 true를 반환한다', () => {
      expect(isDateAfterToday('2026-05-29')).toBe(true)
    })

    it('오늘 날짜는 false를 반환한다', () => {
      expect(isDateAfterToday('2026-05-28')).toBe(false)
    })

    it('오늘보다 이전 날짜는 false를 반환한다', () => {
      expect(isDateAfterToday('2026-05-27')).toBe(false)
    })
  })
})
