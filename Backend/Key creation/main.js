const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONFOLDER = 'Json Keys'

function nsAnswer(str, num) {
    // If contains 'or' returns array of acceptable answers
    if (str.includes('or')) return str.split(' or ')
    /* If question is multiple of 10 (estimation question) 
       return array where first int is min and second in is max */
    if (num % 10 === 0) {return str.split('-').map(s => parseInt(s))}
    return str
}

async function parseKey(text_path) {
    fs.readFile(text_path, 'utf8', (err, data) => {
        if (err) throw err;

        const path_array = text_path.split('/')
        const type = path_array[1]
        const name = path.parse(text_path).name.slice(0, -4)

        const key = data.split('\n').map(str => str.trim())
        // If '' at end of array remove it
        if (key[key.length - 1] === '') key.pop()
        // If key dosent have the proper number of questions print error and return
        if (key.length !== 50 && key.length !== 80) {console.error("Incorrect number of questions for test: " + name); return;}
        
        
        let json = {
            "type": type,
            "year": path_array[2].slice(-5),
            "name": name,
            "path": type + '/' + path_array[2] + '/' + name,
            "prize": 5,
            "penatly": type === "Number Sense" ? 4 : 2,
            "answers": {}
        }
        
        /*
        Text Key formats:
        
        Number Sense:
            normal: (num) ans
            multiple acceptable: (num) ans1 or ans2 or ans3
            estimation: (num) min-max
        Mth/Sci:
            normal: num. ans
        */
        let count = type === "Number Sense" ? 80 : 50
        for (let i = 1; i <= count; i++) {
                
            let str = key[i - 1]
            let answer = type === "Number Sense" ? nsAnswer(str.split(") ")[1], i) 
                        : str.split(". ")[1]

            json.answers[i.toString()] = answer

        }
        // Makes path if it dosent exist
        if (!fs.existsSync(path.join(JSONFOLDER, type, path_array[2]))) {
            // If parent folder dosent exist make that first
            if (!fs.existsSync(path.join(JSONFOLDER, type))) {
                // Make base folder if it dosent exist
                if (!fs.existsSync(JSONFOLDER)) mkdirSync(JSONFOLDER)

                fs.mkdirSync(path.join(JSONFOLDER, type))
            }
            fs.mkdirSync(path.join(JSONFOLDER, type, path_array[2]))
        }
        // Saves file
        fs.writeFile(path.join(JSONFOLDER, json.path + ' Key.json'), JSON.stringify(json, null, 4), (err) => {
            if (err) console.error(err)
            else console.log("Saved: " + json.path)
        })

    })
}

// Gets all text files in working directory
glob("**/*.txt", (err, files) => {
    if (err) throw err;

    files.forEach(path => parseKey(path));
})