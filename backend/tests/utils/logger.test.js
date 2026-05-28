'use strict';

describe('src/utils/logger.js', () => {
  let logger;

  beforeEach(() => {
    jest.resetModules();
    logger = require('../../src/utils/logger');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('일반 문자열 인자를 그대로 출력한다', () => {
    logger.info('hello world');
    expect(console.log).toHaveBeenCalledWith('[INFO]', 'hello world');
  });

  it('객체의 password 키를 [REDACTED]로 치환한다', () => {
    logger.info({ username: 'alice', password: 'secret123' });
    expect(console.log).toHaveBeenCalledWith('[INFO]', {
      username: 'alice',
      password: '[REDACTED]',
    });
  });

  it('객체의 token 키를 [REDACTED]로 치환한다', () => {
    logger.info({ userId: 1, token: 'abc.def.ghi' });
    expect(console.log).toHaveBeenCalledWith('[INFO]', {
      userId: 1,
      token: '[REDACTED]',
    });
  });

  it('원시값(number, boolean)은 그대로 통과한다', () => {
    logger.info(42, true);
    expect(console.log).toHaveBeenCalledWith('[INFO]', 42, true);
  });

  it('info 레벨 메서드가 console.log를 호출한다', () => {
    logger.info('test');
    expect(console.log).toHaveBeenCalledWith('[INFO]', 'test');
  });

  it('warn 레벨 메서드가 console.warn을 호출한다', () => {
    logger.warn('test');
    expect(console.warn).toHaveBeenCalledWith('[WARN]', 'test');
  });

  it('error 레벨 메서드가 console.error를 호출한다', () => {
    logger.error('test');
    expect(console.error).toHaveBeenCalledWith('[ERROR]', 'test');
  });

  it('debug 레벨 메서드가 console.debug를 호출한다', () => {
    logger.debug('test');
    expect(console.debug).toHaveBeenCalledWith('[DEBUG]', 'test');
  });
});
