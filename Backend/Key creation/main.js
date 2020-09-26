const fs = require('fs');
const path = require('path');
const glob = require('glob');

const TEXTSPATH = path.join(__dirname, 'Text Keys');

async function parseKey(path) {
    fs.readFile(path, 'utf8', (err, key) => {
        if (err) throw err;
        // Checks for non ascii characters (usually because of errors in transcription)
        if (key.charCodeAt(0) > 128) {
            console.error("Invalid character in: " + path)
            return 1;
        }
    })
}

// Gets all text files in working directory
glob("**/*.txt", (err, files) => {
    if (err) throw err;

    files.forEach(path => parseKey(path));
})