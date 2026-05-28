import { describe, it, expect } from 'vitest'

describe('FE-01: 프로젝트 초기화 검증', () => {
  it('vitest 환경이 정상 동작한다', () => {
    expect(1 + 1).toBe(2)
  })

  it('환경 변수 타입이 정의되어 있다', () => {
    // Vite 환경변수 타입 확인
    expect(typeof import.meta.env).toBe('object')
  })
})
