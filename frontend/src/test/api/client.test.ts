import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('api/client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('TOKEN_KEY 상수를 export한다', async () => {
    const { TOKEN_KEY } = await import('../../api/client')
    expect(typeof TOKEN_KEY).toBe('string')
    expect(TOKEN_KEY.length).toBeGreaterThan(0)
  })

  it('axios 인스턴스를 default export한다', async () => {
    const { default: apiClient } = await import('../../api/client')
    expect(typeof apiClient.get).toBe('function')
    expect(typeof apiClient.post).toBe('function')
    expect(typeof apiClient.patch).toBe('function')
    expect(typeof apiClient.delete).toBe('function')
  })

  it('localStorage에 토큰이 있으면 요청 인터셉터가 Authorization 헤더를 추가한다', async () => {
    localStorage.setItem('token', 'test-jwt-token')
    const { default: apiClient } = await import('../../api/client')
    const config = { headers: { common: {} } as Record<string, unknown> }
    const interceptor = (apiClient.interceptors.request as unknown as {
      handlers: { fulfilled: (c: typeof config) => typeof config }[]
    }).handlers[0]
    const result = interceptor.fulfilled(config)
    expect((result.headers as Record<string, string>)['Authorization']).toBe('Bearer test-jwt-token')
  })

  it('localStorage에 토큰이 없으면 Authorization 헤더를 추가하지 않는다', async () => {
    const { default: apiClient } = await import('../../api/client')
    const config = { headers: {} as Record<string, unknown> }
    const interceptor = (apiClient.interceptors.request as unknown as {
      handlers: { fulfilled: (c: typeof config) => typeof config }[]
    }).handlers[0]
    const result = interceptor.fulfilled(config)
    expect((result.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })
})
