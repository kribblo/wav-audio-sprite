# wav-audio-sprite

Concatenate WAV files and pads with silence to whole seconds, for use in audio sprites.

Meant to be instantly useful during development and later part of a larger tool-chain.

## Notes on usage

Only concatenates and pads + records information for use by a suitable player later. Does *not* convert to MP3, OGG, or other format. As such, there are no external dependencies such as FFMEPG or SOX that can sometimes trip up people. It is also very fast, so during development, you can do this on the fly for every request.
 
Use the WAVs during development and do final conversion for release builds in a separate part of the tool-chain - or even manually by the sound guy to get the most out of desktop/mobile and different formats.

Padding is *at minimum* one second silence between each sample.

## API usage

    npm install --save-dev wav-audio-sprite

```javascript

const wavAudioSprite = require('wav-audio-sprite');

wavAudioSprite(['sound-a.wav', 'sound-b.wav'])
    .then((buffer, timings) => {
        saveAudioSprite(buffer);
        postProcessTimings(timings);
    })
    .catch(e => console.error(e));
```

`timings` contains each filename, with start, end and durations - different tools wants different data and this is meant to be further processed if needs be:

```json
{
  "sound-a.wav": {
    "start": 0,
    "end": 29538.73015873016,
    "duration": 29538.73015873016
  },
  "sound-b.wav": {
    "start": 31000,
    "end": 88600.23,
    "duration": 57600.23
  }
}
```

## CLI usage

    npm install -g wav-audio-sprite

### howler-sprite

Barely more than an example, but outputs audiosprite and json in [Howler.js format](https://github.com/goldfire/howler.js):

    howler-sprite *.wav

    howler-sprite --name mysprite *.wav

    howler-sprite --path build *.wav

    howler-sprite --path build --name mysprite *.wav

Add `-q` or `--quiet` to silence the output.

**audio-sprite.json:**

```json
{
  "src": [
    "audio-sprite.wav"
  ],
  "sprite": {
    "sound-a": [0, 29538],
    "sound-b": [31000, 88600]
  }
}
```

## See also

Uses [node-wav](https://github.com/andreasgal/node-wav) for decoding/encoding.
