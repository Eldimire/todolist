import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPassword,
  isValidDateRange,
  isNotEmpty,
  isWithinMaxLength,
} from '../../utils/validation'

describe('validation', () => {
  describe('isValidEmail', () => {
    it('유효한 이메일을 검증한다', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.name+tag@domain.co.kr')).toBe(true)
    })

    it('@가 없는 이메일은 false를 반환한다', () => {
      expect(isValidEmail('userexample.com')).toBe(false)
    })

    it('도메인이 없는 이메일은 false를 반환한다', () => {
      expect(isValidEmail('user@')).toBe(false)
    })

    it('빈 문자열은 false를 반환한다', () => {
      expect(isValidEmail('')).toBe(false)
    })

    it('공백이 포함된 이메일은 false를 반환한다', () => {
      expect(isValidEmail('user @example.com')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('8자 이상은 true를 반환한다', () => {
      expect(isValidPassword('password1')).toBe(true)
      expect(isValidPassword('12345678')).toBe(true)
    })

    it('정확히 8자는 true를 반환한다', () => {
      expect(isValidPassword('12345678')).toBe(true)
    })

    it('7자 이하는 false를 반환한다', () => {
      expect(isValidPassword('1234567')).toBe(false)
    })

    it('빈 문자열은 false를 반환한다', () => {
      expect(isValidPassword('')).toBe(false)
    })
  })

  describe('isValidDateRange', () => {
    it('시작일이 종료일보다 이전이면 true를 반환한다', () => {
      expect(isValidDateRange('2026-05-01', '2026-05-31')).toBe(true)
    })

    it('시작일과 종료일이 같으면 true를 반환한다', () => {
      expect(isValidDateRange('2026-05-28', '2026-05-28')).toBe(true)
    })

    it('종료일이 시작일보다 이전이면 false를 반환한다', () => {
      expect(isValidDateRange('2026-05-31', '2026-05-01')).toBe(false)
    })
  })

  describe('isNotEmpty', () => {
    it('일반 문자열은 true를 반환한다', () => {
      expect(isNotEmpty('hello')).toBe(true)
    })

    it('빈 문자열은 false를 반환한다', () => {
      expect(isNotEmpty('')).toBe(false)
    })

    it('공백만 있는 문자열은 false를 반환한다', () => {
      expect(isNotEmpty('   ')).toBe(false)
    })

    it('공백이 포함된 문자열은 true를 반환한다', () => {
      expect(isNotEmpty(' hello ')).toBe(true)
    })
  })

  describe('isWithinMaxLength', () => {
    it('최대 길이 이하이면 true를 반환한다', () => {
      expect(isWithinMaxLength('hello', 10)).toBe(true)
    })

    it('최대 길이와 같으면 true를 반환한다', () => {
      expect(isWithinMaxLength('hello', 5)).toBe(true)
    })

    it('최대 길이를 초과하면 false를 반환한다', () => {
      expect(isWithinMaxLength('hello world', 5)).toBe(false)
    })

    it('빈 문자열은 어느 최대 길이에도 true를 반환한다', () => {
      expect(isWithinMaxLength('', 0)).toBe(true)
    })
  })
})
