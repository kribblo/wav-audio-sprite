#! /usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const mkpath = require('mkpath');

const wavAudioSprite = require('../');

const argv = require('minimist')(
    process.argv.slice(2), {
        string: ['name', 'path']
    }
);

if(argv.h || argv.help || argv._.length === 0) {
    console.log('   usage: [--path=. --name=audiosprite] files...');
    process.exit(0);
}

wavAudioSprite(argv._, (buffer, timings) => {
    const directory = argv.path || process.cwd();
    mkpath.sync(directory);

    const name = argv.name || 'audio-sprite';

    const wav = path.join(directory, `${name}.wav`);
    const json = path.join(directory, `${name}.json`);

    const howler = {
        src: [`${name}.wav`],
        sprite: {}
    };

    for (let timing in timings) {
        const sprite = path.basename(timing, '.wav');
        howler.sprite[sprite] = [Math.round(timings[timing].start), Math.round(timings[timing].end)];
    }

    fs.writeFileSync(wav, buffer);
    fs.writeFileSync(json, JSON.stringify(howler, null, 2), 'UTF-8');
});

