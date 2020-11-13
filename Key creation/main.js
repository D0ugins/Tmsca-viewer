const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PDFParser = require("pdf2json");

const JSONFOLDER = '../AnswerKeys'

function nsAnswer(str, num) {
    // If contains 'or' returns array of acceptable answers
    if (str.includes('or')) return str.split(' or ')
    /* If question is multiple of 10 (estimation question)  
       return array where first int is min and second in is max */
    if (num % 10 === 0) { return str.split('-').map(s => parseInt(s)) }
    return str
}

const cleanCalc = (data) => {
    pages = data.formImage.Pages.slice(8, 10)

    key = pages.map(page => {
        return page.Texts.map(text => {
            return decodeURI(text.R[0].T).replace(/%3D/g, "=").replace(/%24/g, "$")
        })
    })

    return key[0].concat(key[1])
}

async function parseKey(text_path) {
    fs.readFile(text_path, 'utf8', (err, data) => {
        if (err) throw err;

        const path_array = text_path.split('/')
        const type = path_array[1]
        const name = path.parse(text_path).name.slice(0, -4)

        const key = data.trim().split('\n').map(str => str.trim())

        // If key dosent have the proper number of questions print error and return
        if (key.length !== 50 && key.length !== 80) { console.error("Incorrect number of questions for test: " + name); return; }


        let json = {
            "type": type,
            "year": path_array[2].slice(-5),
            "name": name,
            "path": type + '/' + path_array[2] + '/' + name,
            "prize": 5,
            "penalty": type === "Number Sense" ? 4 : 2,
            "answers": {}
        }

        /*
        Text Key formats:
        
        Number Sense:
            normal: (num) ans
            multiple acceptable: (num) ans1 or ans2 or ans3
            estimation: *(num) min-max
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
                if (!fs.existsSync(JSONFOLDER)) fs.mkdirSync(JSONFOLDER)

                fs.mkdirSync(path.join(JSONFOLDER, type))
            }
            fs.mkdirSync(path.join(JSONFOLDER, type, path_array[2]))
        }
        // Saves file
        fs.writeFile(path.join(JSONFOLDER, json.path + ' Key.json'), JSON.stringify(json), (err) => {
            if (err) console.error(err)
            else console.log("Saved: " + json.path)
        })

    })
}

async function parseCalc(key, text_path) {

    let tpath = text_path.split("/").slice(5).join("/").slice(0, -4) + ".json"
    var qnum = 1
    let mode = "new"
    const path_array = tpath.split("/")
    const type = "Calculator"

    let json = {
        "type": type,
        "year": path_array[0].slice(-5),
        "name": path_array[1].slice(0, -5),
        "path": path.join(type, tpath),
        "prize": 5,
        "penalty": 4,
        "answers": {}
    }

    const exceptions = {
        "26, Calculator 18-19/MSCA STATE 18-19.json": ["misexponent"]
    }

    let answers = {}
    for (let i = 0; i < key.length; i++) {
        ans = answers[qnum.toString()]

        let text = key[i].replace(/X/g, "x").replace(/–/g, "-")
        if (!text) continue;

        if (mode == "new") {
            negative = false

            const split = text.endsWith(qnum.toString()[0]) && key[i + 1].startsWith(qnum.toString()[1])
            if (split) {
                i++;
                text = key[i].replace(/X/g, "x");
                end = qnum.toString()[1]
                const split = text.trim().endsWith(end) && key[i + 1].startsWith("=")
                if (text.startsWith(end + " =") || split) {
                    mode = "rest"
                    if (split) continue;

                    let arr = text.trim().split(" = ")
                    if (arr.length === 2) {
                        if (text.includes("x")) answers[qnum.toString()] = { base: arr[1] }
                    } else {
                        let next = key[i + 1]
                        if (next === "-") {
                            i++
                            negative = true
                        }
                    }
                }
            }

            if (text.startsWith(qnum)) {

                const split = text.trim().endsWith(qnum) && key[i + 1].startsWith("=")
                if (text.startsWith(qnum + " =") || split) {
                    mode = "rest"
                    if (split) continue;

                    let arr = text.trim().split(" = ")
                    if (arr.length === 2) {
                        if (text.includes("x")) answers[qnum.toString()] = { base: arr[1].slice(0, -3) }
                    } else {
                        if (key[i + 1] === "-") {
                            i++
                            negative = true
                        }
                    }
                }
            }
        } else {

            if (text === ".") {
                i++;
                text = key[i - 2] + key[i - 1] + key[i]
            }

            if (text.includes("INT")) {
                if (text.trim().length <= 4) text = key[i - 1].trim()
                else {
                    text = text.trim()
                    text = text.slice(0, -4)
                }
                answers[qnum.toString()] = { base: text.trim() }
                mode = "new"
                qnum++
            }

            if (text.startsWith("$")) {
                if (text.length === 1) text = key[i - 1].trim()
                else text = text.slice(1)

                answers[qnum.toString()] = { base: text.trim() }
                mode = "new"
                qnum++
            }

            if (text.startsWith("=")) {
                let arr = text.split("= ")
                if (negative) { i++; continue; }

                if (ans) {
                    if (arr.length == 2) {
                        if (text.includes("x")) {
                            answers[qnum.toString()] = { base: arr[1].slice(0, -3) }
                        }
                    } else {
                        negative = true
                        i++
                    }
                } else {
                    if (text.includes("x")) {
                        answers[qnum.toString()] = { base: arr[1].slice(0, -3) }
                    }
                }
            }
            else {
                if (ans) {
                    if (text === "-") { i++; text = "-" + key[i] }
                    if (!Object.keys(exceptions).includes(qnum + ", " + tpath)) {
                        answers[qnum.toString()]["exponent"] = text
                    }
                    else {
                        answers[qnum.toString()]["exponent"] = 1
                        i--
                    }
                    mode = "new"
                    qnum++
                } else {
                    if (text.includes("x")) {

                        if (text === "x10") {
                            text = key[i - 1]
                        }

                        let base = text.slice(0, -3)
                        let offset = 1;
                        if (base.length < 4) {
                            if (!text.endsWith("x10")) {
                                base = ""
                            }
                        }
                        while (base.length < 4) {
                            base = key[i - offset] + base;
                            if (base.includes("=")) base = base.split("=")[1].trim()
                            offset++;
                        }
                        if (negative) base = "-" + base
                        answers[qnum.toString()] = { base }
                    }
                }
            }
        }
    }

    for (answer in answers) {
        const { base, exponent } = answers[answer]
        if (exponent) {
            answers[answer] = { base: parseFloat(base.toString().trim()), exponent: parseInt(exponent.toString().trim()) }
        }
        else {
            answers[answer] = { base: parseFloat(base.toString().trim()) }
        }

    }

    json.answers = answers

    // Makes folders if they dont exist
    if (!fs.existsSync(path.join(JSONFOLDER, type, path_array[0]))) {
        // If parent folder dosent exist make that first
        if (!fs.existsSync(path.join(JSONFOLDER, type))) {
            // Make base folder if it dosent exist
            if (!fs.existsSync(JSONFOLDER)) fs.mkdirSync(JSONFOLDER)

            fs.mkdirSync(path.join(JSONFOLDER, type))
        }
        fs.mkdirSync(path.join(JSONFOLDER, type, path_array[0]))
    }

    // Saves file
    fs.writeFile(path.join(JSONFOLDER, type, tpath), JSON.stringify(answers), (err) => {
        if (err) console.error(err)
        else console.log("Saved: " + tpath)
    })

    if (Object.keys(answers).length !== 80) console.log(Object.keys(answers).length, tpath)

}

// Gets all text files in working directory
glob("**/*.txt", (err, files) => {
    if (err) throw err;

    files.forEach(path => parseKey(path));
})


glob("../client/build/tests/Calculator/**/*.pdf", (err, paths) => {
    if (err) throw err;
    for (const test_path of paths) {
        let parser = new PDFParser();
        parser.on("pdfParser_dataReady", (data) => {
            parseCalc(cleanCalc(data), test_path);
        })
        parser.loadPDF(test_path);
    }
})