'use strict';

const fs = require('fs');

const wav = require('node-wav');

const concatenateFloat32 = require('./concatenate-float32');

function getSilentPaddingAudio(audio, duration) {
    var sampleRate = audio.sampleRate / 1000;
    var channels = audio.channelData.length;

    var length = Math.round(duration * sampleRate);

    var padding = {
        sampleRate: audio.sampleRate,
        bitDepth: audio.bitDepth,
        channelData: []
    };

    for (let i = 0; i < channels; i++) {
        padding.channelData[i] = new Float32Array(length);
    }

    return padding;
}

function getDuration(audio) {
    var length = audio.channelData[0].length;
    var sampleRate = audio.sampleRate / 1000;

    return length / sampleRate;
}

function mergeAudio(audios) {
    var first = audios[0];

    var channels = first.channelData.length;

    const merged = {
        channelData: []
    };

    for (let i = 0; i < channels; i++) {
        const channel = audios.map((a) => a.channelData[i]);
        merged.channelData[i] = concatenateFloat32(channel);
    }

    merged.sampleRate = first.sampleRate;

    return merged;
}

function wavAudioSprite(files, callback) {
    const audioData = [];
    const timings = {};

    let start = 0;

    files.forEach((file) => {
        const buffer = fs.readFileSync(file);
        const audio = wav.decode(buffer);

        const duration = getDuration(audio);
        const end = start + duration;

        timings[file] = {
            start: start,
            end: end,
            duration: duration
        };

        const padding = Math.ceil(duration / 1000) * 1000 - duration + 1000;
        const silent = getSilentPaddingAudio(audio, padding);

        audioData.push(audio, silent);
        start = end + padding;
    });

    const merged = mergeAudio(audioData);
    const encoded = wav.encode(merged.channelData, {sampleRate: merged.sampleRate});

    callback(encoded, timings);
}

module.exports = wavAudioSprite;
