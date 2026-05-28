import { describe, it, expect } from 'vitest'
import { getErrorMessage, parseApiError } from '../../utils/errorHandler'

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('UNAUTHORIZED 코드를 사용자 메시지로 변환한다', () => {
      expect(getErrorMessage('UNAUTHORIZED')).toBe('로그인이 필요합니다.')
    })

    it('EMAIL_ALREADY_EXISTS 코드를 변환한다', () => {
      expect(getErrorMessage('EMAIL_ALREADY_EXISTS')).toBe('이미 사용 중인 이메일입니다.')
    })

    it('INVALID_CREDENTIALS 코드를 변환한다', () => {
      expect(getErrorMessage('INVALID_CREDENTIALS')).toBe('이메일 또는 비밀번호가 올바르지 않습니다.')
    })

    it('FORBIDDEN 코드를 변환한다', () => {
      expect(getErrorMessage('FORBIDDEN')).toBe('접근 권한이 없습니다.')
    })

    it('CATEGORY_NOT_FOUND 코드를 변환한다', () => {
      expect(getErrorMessage('CATEGORY_NOT_FOUND')).toBe('카테고리를 찾을 수 없습니다.')
    })

    it('DEFAULT_CATEGORY_NOT_MODIFIABLE 코드를 변환한다', () => {
      expect(getErrorMessage('DEFAULT_CATEGORY_NOT_MODIFIABLE')).toBe('기본 카테고리는 수정할 수 없습니다.')
    })

    it('DEFAULT_CATEGORY_NOT_DELETABLE 코드를 변환한다', () => {
      expect(getErrorMessage('DEFAULT_CATEGORY_NOT_DELETABLE')).toBe('기본 카테고리는 삭제할 수 없습니다.')
    })

    it('TODO_NOT_FOUND 코드를 변환한다', () => {
      expect(getErrorMessage('TODO_NOT_FOUND')).toBe('할일을 찾을 수 없습니다.')
    })

    it('INVALID_DATE_RANGE 코드를 변환한다', () => {
      expect(getErrorMessage('INVALID_DATE_RANGE')).toBe('종료일은 시작일보다 이전일 수 없습니다.')
    })

    it('VALIDATION_ERROR 코드를 변환한다', () => {
      expect(getErrorMessage('VALIDATION_ERROR')).toBe('입력값을 확인해주세요.')
    })

    it('INTERNAL_SERVER_ERROR 코드를 변환한다', () => {
      expect(getErrorMessage('INTERNAL_SERVER_ERROR')).toBe('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    })

    it('알 수 없는 코드는 기본 메시지를 반환한다', () => {
      expect(getErrorMessage('UNKNOWN_CODE')).toBe('알 수 없는 오류가 발생했습니다.')
    })
  })

  describe('parseApiError', () => {
    it('axios 에러 형태에서 code와 message를 추출한다', () => {
      const axiosError = {
        response: {
          data: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
      }
      expect(parseApiError(axiosError)).toEqual({
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      })
    })

    it('response가 없는 에러는 INTERNAL_SERVER_ERROR를 반환한다', () => {
      const result = parseApiError(new Error('network error'))
      expect(result.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('null을 전달하면 INTERNAL_SERVER_ERROR를 반환한다', () => {
      const result = parseApiError(null)
      expect(result.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('response.data에 code가 없으면 INTERNAL_SERVER_ERROR를 반환한다', () => {
      const error = { response: { data: { message: '서버 오류' } } }
      const result = parseApiError(error)
      expect(result.code).toBe('INTERNAL_SERVER_ERROR')
    })
  })
})
