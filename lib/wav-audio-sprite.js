'use strict';

const fs = require('fs');
const wav = require('node-wav');
const concatenateFloat32 = require('./concatenate-float32');

function getSilentPaddingAudio(audio, duration) {
    const sampleRate = audio.sampleRate / 1000;
    const channels = audio.channelData.length;

    const length = Math.round(duration * sampleRate);

    const padding = {
        sampleRate: audio.sampleRate,
        bitDepth: audio.bitDepth,
        channelData: []
    };

    for(let i = 0; i < channels; i++) {
        padding.channelData[i] = new Float32Array(length);
    }

    return padding;
}

function getDuration(audio) {
    const length = audio.channelData[0].length;
    const sampleRate = audio.sampleRate / 1000;

    return length / sampleRate;
}

function mergeAudio(audios) {
    const first = audios[0];

    const channels = first.channelData.length;

    const merged = {
        channelData: []
    };

    for(let i = 0; i < channels; i++) {
        const channel = audios.map((a) => a.channelData[i]);
        merged.channelData[i] = concatenateFloat32(channel);
    }

    merged.sampleRate = first.sampleRate;

    return merged;
}

function wavAudioSprite(files) {
    return new Promise((resolve, reject) => {
        const audioData = [];
        const timings = {};

        let start = 0;
        let channels, sampleRate;

        files.forEach((filename) => {
            const file = fs.readFileSync(filename);
            const audio = wav.decode(file);

            channels = channels || audio.channelData.length;
            sampleRate = sampleRate || audio.sampleRate;

            if(audio.channelData.length !== channels) {
                return reject(`Different number of channels in wav file: ${filename} has ${audio.channelData.length}, previous had ${channels}`);
            }

            if(audio.sampleRate !== sampleRate) {
                return reject(`Different sample rate in wav file: ${filename} has ${audio.sampleRate}, previous had ${sampleRate}`);
            }

            const duration = getDuration(audio);
            const end = start + duration;

            timings[filename] = {
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
        const buffer = wav.encode(merged.channelData, {sampleRate: merged.sampleRate});

        return resolve({buffer, timings});
    });
}

module.exports = wavAudioSprite;
