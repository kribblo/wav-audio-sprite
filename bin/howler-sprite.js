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
    console.log('   usage: [--path=.] [--name=audiosprite] [-q|--quiet] files...');
    process.exit(0);
}

const quiet = argv.q || argv.quiet;

wavAudioSprite(argv._)
    .then(result => {
        const {buffer, timings} = result;
        const outputPath = argv.path || process.cwd();
        mkpath.sync(outputPath);

        const name = argv.name || 'audio-sprite';

        if(!quiet) {
            console.log(`Combined ${Object.keys(timings).length} sounds into ${name}.wav:`);
        }

        const wav = path.join(outputPath, `${name}.wav`);
        const json = path.join(outputPath, `${name}.json`);

        const howler = {
            src: [`${name}.wav`],
            sprite: {}
        };

        for(let timing in timings) {
            const sprite = path.basename(timing, '.wav');

            const information = timings[timing];

            const start = Math.round(information.start);
            const duration = Math.round(information.duration);

            if(!quiet) {
                const seconds = (duration / 1000).toFixed(2);
                console.log(`  ${sprite}: ${seconds}s`);
            }

            howler.sprite[sprite] = [start, duration];
        }

        fs.writeFileSync(wav, buffer);
        fs.writeFileSync(json, JSON.stringify(howler, null, 2), 'UTF-8');
    });

