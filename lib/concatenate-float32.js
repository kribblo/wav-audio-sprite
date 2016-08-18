'use strict';

const concatenateFloat32 = (arrays) => {
    const length = arrays.reduce((length, arr) => arr.length + length, 0);
    const concat = new Float32Array(length);

    let offset = 0;
    for (const arr of arrays) {
        concat.set(arr, offset);
        offset += arr.length;
    }
    return concat;
};

module.exports = concatenateFloat32;
