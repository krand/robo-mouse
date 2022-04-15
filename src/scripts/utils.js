'use strict';

function buildKey(...keys) {
    return keys.sort((a, b) => {
        if (isNaN(a)) {
            if (isNaN(b)) {
                return String(a).localeCompare(b);
            } else {
                return -1;
            }
        } else {
            if (isNaN(b)) {
                return 1;
            } else {
                return a - b;
            }
        }
    }).join('-');
}

function swap(set, ...keys) {
    let key = buildKey(...keys);
    if (!set.delete(key)) {
        set.add(key);
    }
}

module.exports = {buildKey, swap};