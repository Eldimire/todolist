'use strict';

const { hashPassword, comparePassword } = require('../../src/utils/hash');

describe('src/utils/hash.js', () => {
  it('hashPassword는 bcrypt 해시를 반환하며 원문과 다르다', async () => {
    const plain = 'password123';
    const hashed = await hashPassword(plain);
    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith('$2b$')).toBe(true);
  });

  it('comparePassword는 올바른 비밀번호에 대해 true를 반환한다', async () => {
    const plain = 'password123';
    const hashed = await hashPassword(plain);
    const result = await comparePassword(plain, hashed);
    expect(result).toBe(true);
  });

  it('comparePassword는 잘못된 비밀번호에 대해 false를 반환한다', async () => {
    const plain = 'password123';
    const hashed = await hashPassword(plain);
    const result = await comparePassword('wrong', hashed);
    expect(result).toBe(false);
  });
});
