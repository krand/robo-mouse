'use strict';

const {buildKey} = require('./utils');

test('simple key', () => {
    expect(buildKey(2, 1)).toBe('1-2');
});

test('key with a string', () => {
    expect(buildKey(4, 'd', 100)).toBe('d-4-100');
});

test('complex key', () => {
    expect(buildKey(4, 'd', 100, 'aa')).toBe('aa-d-4-100');
});
