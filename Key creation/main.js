const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp')

const PDFParser = require("pdf2json");

const JSONFOLDER = '../AnswerKeys'

function nsAnswer(str, num) {
    if (!str) return console.error(num)
    // If contains 'or' returns array of acceptable answers
    if (str.includes('or')) return str.split(' or ')
    /* If question is multiple of 10 (estimation question)  
       return array where first int is min and second in is max */
    if (num % 10 === 0) { return str.split('-').map(s => parseInt(s)) }
    return str
}

const clean = (data, type) => {

    let pages = data.formImage.Pages
    switch (type) {
        case "Calculator":
            pages = pages.slice(8, 10);
            break;
        case "Math":
            pages = pages.slice(6, 7);
            break;
        case "Science":
            pages = pages.slice(-1);
            break;
    }

    let key = pages.map(page => {
        return page.Texts.map(text => {
            return decodeURI(text.R[0].T).replace(/%3D/g, "=").replace(/%24/g, "$").trim()
        })
    })

    return key.flat()
}

async function parseNs(text_path) {
    fs.readFile(text_path, 'utf8', (err, data) => {
        if (err) throw err;

        const path_array = text_path.split('/')
        const type = "Number Sense"
        const level = path_array[2]

        const name = path.parse(text_path).name.slice(0, -4)

        const key = data.trim().split('\n').map(str => str.trim())

        // If key dosent have the proper number of questions print error and return
        if (key.length !== 80) { console.error("Incorrect number of questions for test: " + name); return; }


        let json = {
            type,
            level,
            "year": path_array[4].slice(-5),
            "name": name,
            "path": `${level}/${type}/${path_array[4]}/${name}`,
            "prize": 5,
            "penalty": 4,
            "answers": {}
        }

        /*
        Text Key formats:
        
        Number Sense:
            normal: (num) ans
            multiple acceptable: (num) ans1 or ans2 or ans3
            estimation: *(num) min-max
        */
        let count = 80
        for (let i = 1; i <= count; i++) {
            let str = key[i - 1]
            json.answers[i.toString()] = nsAnswer(str.split(") ")[1], i)

        }
        // Makes path if it dosent exist
        mkdirp.sync(path.join(JSONFOLDER, level, type, path_array[4]))

        // Saves file
        fs.writeFile(path.join(JSONFOLDER, json.path + ' Key.json'), JSON.stringify(json), (err) => {
            if (err) console.error(err)
            else console.log("Saved: " + json.path)
        })

    })
}

async function parseMthSci(key, text_path) {
    let tpath = text_path.split("/").slice(4).join("/").slice(0, -4) + " Key.json"
    const path_array = tpath.split("/")
    const level = path_array[0]
    const type = tpath.includes("Math") ? "Math" : "Science"
    let json = {
        type,
        level,
        "year": path_array[2].slice(-5),
        "name": path_array[3].slice(0, -9),
        "path": `${level}/${type}/${path_array[2]}/${path_array[3].slice(0, -9)}`,
        "prize": 5,
        "penalty": 2,
        "answers": {}
    }

    for (let i = 1; i <= 50; i++) {
        let index = key.findIndex((str, index) => {
            if (!str) return false
            const split1 = str.endsWith(i) && key[index + 1].startsWith(".")
            const split2 = i >= 10
                && str.endsWith(Math.floor(i / 10))
                && key[index + 1].startsWith(i % 10)
                && (key[index + 1].includes(".") || key[index + 2].startsWith("."));
            let found = str.includes(i + ".") || split1 || split2

            // Prevents stuff like 35. being counted for quetsion 5 on science
            if (found) {
                let foundIndex = str.indexOf(i + ".")
                // If started with thing, check end of previous string instead
                if (foundIndex === 0) {
                    return isNaN(key[index - 1].slice(-1))
                }
                // Check if character before where the question was found was a number
                return isNaN(parseInt(str[foundIndex - 1]))
            }
        })

        if (index < 0) {
            console.log(key)
            return console.error("Could not find question " + i + " for test " + json.path)
        }

        let str = key[index];
        let arr = str.split(".")

        if (arr.length > 1 && arr[1].trim()) {
            json.answers[i.toString()] = arr[1].trim()
        }
        else {
            let str = key[++index];
            const answers = ["A", "B", "C", "D", "E"];
            if (!answers.includes(str)) {
                if (!str.includes(".")) str = key[++index]
                if (str === ".") str = key[++index]
                else {
                    if (str.startsWith(".")) str = str.slice(1);
                    else if (str.endsWith(".")) str = key[++index]
                    else str = str.split(".")[1];
                }
            }
            if (!str) console.log(key)
            json.answers[i.toString()] = str
        }
    }

    // Makes folders if they dont exist
    mkdirp.sync(path.join(JSONFOLDER, level, type, path_array[2]));

    // Saves file
    fs.writeFile(path.join(JSONFOLDER, json.path + " Key.json"), JSON.stringify(json), (err) => {
        if (err) console.error(err)
        else console.log("Saved: " + json.path)
    })

    if (Object.keys(json.answers).length !== 50) console.log(Object.keys(json.answers).length, tpath)
}

async function parseCalc(key, text_path) {

    let tpath = text_path.split("/").slice(4).join("/").slice(0, -4) + " Key.json"
    const path_array = tpath.split("/")
    const level = path_array[0]
    if (level === "Elementary") return;
    const type = "Calculator"

    let json = {
        type,
        level,
        "year": path_array[2].slice(-5),
        "name": path_array[3].slice(0, -9),
        "path": `${level}/${type}/${path_array[2]}/${path_array[3].slice(0, -9)}`,
        "prize": 5,
        "penalty": 4,
        "answers": {}
    }

    const exceptions = {
        "26, Middle/Calculator/Calculator 18-19/MSCA STATE 18-19 Key.json": ["misexponent"]
    }

    let qnum = 1
    let mode = "new"
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
                const split = text.endsWith(end) && key[i + 1].startsWith("=")
                if (text.startsWith(end + " =") || split) {
                    mode = "rest"
                    if (split) continue;

                    let arr = text.split(" = ")
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

                const split = text.endsWith(qnum) && key[i + 1].startsWith("=")
                if (text.startsWith(qnum + " =") || split) {
                    mode = "rest"
                    if (split) continue;

                    let arr = text.split(" = ")
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
                if (text.length <= 4) text = key[i - 1]
                else {
                    text = text.trim()
                    text = text.slice(0, -4)
                }
                answers[qnum.toString()] = { base: text.trim() }
                mode = "new"
                qnum++
            }

            if (text.startsWith("$")) {
                if (text.length === 1) text = key[i - 1]
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
                    if (!Object.keys(exceptions).includes(qnum + ", " + json.path)) {
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
    mkdirp.sync(path.join(JSONFOLDER, level, type, path_array[2]));

    // Saves file
    fs.writeFile(path.join(JSONFOLDER, json.path + " Key.json"), JSON.stringify(json), (err) => {
        if (err) console.error(err)
        else console.log("Saved: " + json.path)
    })

    if (Object.keys(answers).length !== 80) console.log(Object.keys(answers).length, tpath)

}

// Gets all text files in working directory
glob("./Text Keys/**/*.txt", (err, files) => {
    if (err) throw err;

    files.forEach(path => parseNs(path));
})


glob("../client/public/tests/**/*CA*.pdf", (err, paths) => {
    if (err) throw err;
    for (const test_path of paths) {
        let parser = new PDFParser();
        parser.on("pdfParser_dataReady", (data) => {
            parseCalc(clean(data, "Calculator"), test_path);
        })
        parser.loadPDF(test_path);
    }
})

glob("../client/public/tests/**/*MA*.pdf", (err, paths) => {
    if (err) throw err;

    for (const test_path of paths) {
        let parser = new PDFParser();
        parser.on("pdfParser_dataReady", (data) => {
            parseMthSci(clean(data, "Math"), test_path);
        })
        parser.loadPDF(test_path);
    }
})


glob("../client/public/tests/**/*SC*.pdf", (err, paths) => {
    if (err) throw err;

    for (const test_path of paths) {
        if (test_path.includes("CA")) continue;
        let parser = new PDFParser();
        parser.on("pdfParser_dataReady", (data) => {
            parseMthSci(clean(data, "Science"), test_path);
        })
        parser.loadPDF(test_path);
    }
})
