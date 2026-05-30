import { describe, expect, it } from 'vitest';
import { decode, decodeSync, isStandardSchema, type StandardSchemaV1 } from './standard-schema';

const numberFromString: StandardSchemaV1<string, number> = {
  '~standard': { version: 1, vendor: 'test', validate: (value) => ({ value: Number(value) }) }
};

const alwaysInvalid: StandardSchemaV1<unknown, never> = {
  '~standard': { version: 1, vendor: 'test', validate: () => ({ issues: [{ message: 'nope' }] }) }
};

const asyncSchema: StandardSchemaV1<unknown, string> = {
  '~standard': { version: 1, vendor: 'test', validate: () => Promise.resolve({ value: 'x' }) }
};

describe('isStandardSchema', () => {
  it('detects a standard schema', () => expect(isStandardSchema(numberFromString)).toBe(true));
  it('rejects a function', () => expect(isStandardSchema((value: unknown) => value)).toBe(false));
  it('rejects null', () => expect(isStandardSchema(null)).toBe(false));
});

describe('decodeSync', () => {
  it('returns the decoded value', () => expect(decodeSync(numberFromString, '42')).toBe(42));
  it('throws with the issue messages on failure', () => expect(() => decodeSync(alwaysInvalid, 'x')).toThrow('nope'));
});

describe('decode', () => {
  it('returns the raw success result', () => expect(decode(numberFromString, '42')).toEqual({ value: 42 }));
  it('throws on async validation', () => expect(() => decode(asyncSchema, 'x')).toThrow(TypeError));
});
