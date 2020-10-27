
// Utility functions

// Gets random X digit number (ex. if 2 is passed gets random 2 digit number)
function randXDigitNum(length, exclude1 = 0) {
    if (!length) {
        console.error("Usage: randXDigitNum(length)");
        return;
    };

    // If input is array return array of numbers
    if (Array.isArray(length)) {
        return length.map((len) => { return randXDigitNum(len, exclude1) });
    };

    return Math.floor(
        Math.random()
        * ((10 ** length) - (10 ** (length - 1)) - exclude1)
        + (10 ** (length - 1)) + exclude1
    );
}

// Gets random number that is (factor * some x digit number)
function randMultiple(length, factor) {
    if (!factor || !length) {
        console.error("Usage: randMultiple(length, factor)");
        return;
    };

    return randXDigitNum(length) * factor;
}

const randInRange = (min, max) => Math.floor(Math.random() * (max - min)) + min + 1;


// Fraction helpers

// Formats 2 nums as LaTeX fraction
const frac = nums => `\\frac{${nums[0]}}{${nums[1]}}`

// Fromats 2 nums as typed fraction
const typedFrac = nums => nums[0] + "/" + nums[1]

// Adapted from https://stackoverflow.com/a/17445304
const gcd = (a, b) => b ? gcd(b, a % b) : a

// Funciton to reduce fractions
function reduce(nums) {
    let [a, b] = nums
    let g = gcd(a, b);
    return [a / g, b / g];
}

/*
    Question generator declatations
    {
        name: Human readable name,
        types: Categories the trick falls under,
        presets (optional): {
            name: [...params, [types], explanationFile]
        }
        generate([params]): function to generate random quesiton returns {
            question: String that represents question (formmated with LaTeX),
            answer: Answer to the question
        }
    }
*/

let Generators = [
    {
        name: "Multiply by ",
        types: ["Multplication tricks"],

        presets: {
            "11": [2, 11, ["Multiply by 1s and 0s"], "x11.md"],
            "101": [3, 101, ["Multiply by 1s and 0s"], "x101.md"],
            "111": [3, 111, ["Multiply by 1s and 0s"], "x111.md"],
            "1001": [4, 1001, ["Multiply by 1s and 0s"], "x1001.md"],
            "12": [3, 12, ["Multiply by Teens"], "x12.md"],
            "15": [2, 15, [], "x15.md"],
            "25": [3, 25, ["Multiply by 25s", "Multiply by factors of 1s and 0s"], "x25.md"],
            "50": [3, 50, ["Multiply by 25s", "Multiply by factors of 1s and 0s"], "x50.md"],
        },

        generate([length, constNum]) {

            if (!length || !constNum) {
                console.error("Usage: generate([#digits, constant number])");
                return;
            }

            const a = randXDigitNum(length);
            return {
                question: a + ' \\times ' + constNum,
                answer: a * constNum
            };
        }
    },

    {
        name: "Multiply by ",
        types: ["Multiplicaition Tricks"],

        presets: {
            "33.3": [2, 3, 100, "33 " + frac([1, 3]), ["Multiply by factors of 1s and 0s"], "x33.md"],
            "16.6": [2, 6, 100, "16 " + frac([2, 3]), ["Multiply by factors of 1s and 0s"], "x166.md"],
            "12.5": [2, 8, 100, "12 " + frac([1, 2]), ["Multiply by factors of 1s and 0s"], "x125.md"],
            "143": [2, 7, 1001, "143", ["Multiply by factors of 1s and 0s"], "x143.md"],
            "75": [2, 4, 100, "75", ["Multiply by 25s", "Multiply by factors of 1s and 0s"], "x75.md"],
        },

        generate([length, factor, base, string]) {
            if (!length || !factor || !base || !string) {
                console.error("Usage: genMultipleTrick([length, factor, base, string])");
                return;
            };
            const a = randMultiple(length, factor);
            return {
                question: a + ' \\times ' + string,
                answer: (a / factor) * base
            };
        }
    },

    {
        name: "Arithmetic ",
        types: ["Arithmetic"],

        presets: {
            "addition": [3, 3, "+", []],
            "subtraction": [3, 3, "-", []],
            "foil": [2, 2, "*", [], "foil.md"],
            "division 1": [4, 1, "/", []],
            "division 2": [5, 2, "/", []]
        },

        generate([aLen, bLen, op]) {

            if (!aLen || !bLen || !op) {
                console.error("Usage: generate(aLength, bLength, operation)");
                return;
            }

            let nums = randXDigitNum([aLen, bLen], 1);

            switch (op) {
                case "+":
                    return {
                        question: nums[0] + " + " + nums[1],
                        answer: nums[0] + nums[1]
                    };
                case "-":
                    // Sorts nums so result isnt negative
                    nums = nums.sort();
                    return {
                        question: nums[1] + " - " + nums[0],
                        answer: nums[1] - nums[0]
                    };
                case "*":
                    return {
                        question: nums[0] + " \\times " + nums[1],
                        answer: nums[0] * nums[1]
                    };
                case "/":
                    // Makes sure nums evnely divide
                    nums[0] = randMultiple(aLen - 1, nums[1]);
                    return {
                        question: nums[0] + " \\div " + nums[1],
                        answer: nums[0] / nums[1]
                    };
                default:
                    console.error("Invalid operation");
                    return;
            }
        }
    },

    {
        name: "Remainder of number divided by ",
        types: ["Remainders"],
        presets: {
            "11": [5, 11, [], "remain11.md"],
            "9": [5, 9, [], "remain9.md"]
        },

        generate([length, num]) {
            if (!length || !num) {
                console.error("Usage: generate([length, divisor])");
                return;
            }

            let a = randXDigitNum(length)
            return {
                question: a + " \\div " + num + "\\text{ has a remainder of}",
                answer: a % num
            }
        }

    },

    {
        name: "Multiply numbers ending in 5",
        types: ["Multiplication tricks"],
        generate() {
            let [a, b] = randXDigitNum([1, 1]);
            return {
                question: a + "5 \\times " + b + '5',
                answer: ((a * 10) + 5) * ((b * 10) + 5)
            }
        },
        explanationFile: "endIn5.md"
    },

    {
        name: "Multiply numbers slightly below or above Power of 10",
        types: ["Multiplication tricks"],
        generate([pow = 2, mode = "random"]) {
            let a = randInRange(1, 12);
            let b = randInRange(1, 13 - a);

            let base = 10 ** pow

            if (mode === "above") {
                a = base + a
                b = base + b
            }
            else if (mode === "below") {
                a = base - a
                b = base - b
            }
            else {
                if (Math.random() > 0.5) a = base + a
                else a = base - a

                if (Math.random() > 0.5) b = base + b
                else b = base - b
            }

            return {
                question: a + " \\times " + b,
                answer: a * b
            };
        },
        explanationFile: "abvblwpow10.md"
    },

    {
        name: "Multiply X below and X above multiple of 5",
        type: ["Multiplication Tricks"],
        generate() {
            let base = randInRange(5, 19) * 5
            let a = randInRange(1, 6);
            return {
                question: (base - a) + " \\times " + (base + a),
                answer: (base - a) * (base + a)
            }

        },
        explanationFile: "abvblw.md"
    },

    {
        name: "Square roots",
        type: ["Square roots"],
        generate([min = 11, max = 59]) {
            let a = randInRange(min, max);
            return {
                question: "\\sqrt{" + a * a + "}",
                answer: a
            }
        }
    },

    {
        name: "Squares",
        type: ["Sqaures", "Shape numbers"],
        generate([min = 11, max = 30]) {
            let a = randInRange(min, max);
            return {
                question: a + "^2",
                answer: a * a
            }
        },
        explanationFile: "squares.md"
    },

    {
        name: "Squares Ending in 5",
        type: ["Sqaures", "Shape numbers"],
        generate([min = 3, max = 9]) {
            let a = randInRange(min, max);
            return {
                question: a + "5^2",
                answer: (a * 10 + 5) ** 2
            }
        },
        explanationFile: "sqaureEndIn5.md"
    },

    {
        name: "Squares Ending in 0",
        type: ["Sqaures", "Shape numbers"],
        generate([min = 3, max = 9]) {
            let a = randInRange(min, max);
            return {
                question: a + "0^2",
                answer: (a * 10) ** 2
            }
        },
        explanationFile: "sqaureEndIn0.md"
    },

    {
        name: "X² + 3X²",
        type: ["Sqaures", "Squares tricks"],
        generate([min = 11, max = 25]) {
            let a = randInRange(min, max);
            return {
                question: `${a}^2 + ${a * 3}^2`,
                answer: a * a * 10
            }
        },
        explanationFile: "x3xsquared.md"
    },

    {
        name: "Difference of squares",
        type: ["Sqaures", "Squares tricks"],
        generate() {
            let type = ""
            let sum = undefined
            let dif = undefined
            /* 
                Randomly picks if either sum or difference is an easy number to multiply with
                Then randomly decides between either a special number such as 11 or a single digit / divisble by 10
            */
            if (Math.random() < .3) {
                type = "sum"
                if (Math.random() < .2) sum = 101
                else sum = randInRange(4, 9) * 10
            }
            else {
                type = "dif"
                if (Math.random() < .2) dif = 11
                else dif = randInRange(4, 9)
            }
            let top = 90

            if (type === "sum") top = sum / 1.5
            let a = randInRange(25, top)
            let b = type === "sum" ? sum - a : a - dif

            // One in 10 chance to make them reverse order so negative
            if (Math.random() < .1) {
                [a, b] = [a, b].sort()
            }
            else {
                [b, a] = [a, b].sort()
            }

            return {
                question: `${a}^2 - ${b}^2`,
                answer: (a + b) * (a - b)
            }

        },
        explanationFile: "difsqrs.md"
    },

    {
        name: "Number + reciprocal",
        types: ["Fraction tricks", "Addition tricks"],
        generate() {
            let a = randInRange(5, 13);
            let b = randInRange(3, 13);

            if (a === b) { a += 3 }
            [b, a] = [a, b].sort()

            let question = ''
            let answer = ''
            // 1/10 chance that one of them is mixed number
            if (Math.random() < .1) question = '1' + frac([a - b, b]) + ' + ' + frac([b, a])
            else question = frac([a, b]) + ' + ' + frac([b, a])

            let absqr = (a - b) * (a - b)
            if (absqr > a * b) answer = "3 " + typedFrac(reduce([absqr - (a * b), a * b]))
            else answer = "2 " + typedFrac(reduce([absqr, a * b]))

            return {
                question,
                answer
            }
        },
        explanationFile: "num+recip.md"
    },

    {
        name: "Consecutive Integers",
        types: ["Addition tricks", "Shape numbers"],
        generate([min = 10, max = 24]) {
            let rand = Math.random()
            let len = randInRange(max, min)

            if (rand < .33) {
                // Normal consecutive
                return {
                    question: "1 + 2 + 3 \\ldots " + len,
                    answer: (len * (len + 1)) / 2
                }
            }
            else if (rand < .66) {
                // Consectutive even
                return {
                    question: "2 + 4 + 6 \\ldots " + len * 2,
                    answer: (len * (len + 1))
                }
            }
            else {
                // Consectutive odd
                return {
                    question: "1 + 3 + 5 \\ldots " + ((len * 2) - 1),
                    answer: (len ** 2)
                }
            }

        },
        explanationFile: "consecint.md"
    },

    {
        name: "To base 10",
        types: ["Bases", "Conversions"],
        generate([min = 4, max = 7, length = 3]) {

            let base = randInRange(min, max)
            let question = ""
            let answer = 0
            for (let i = length - 1; i >= 0; i--) {
                let num = randInRange(0, base - 1)
                question += num
                answer += num * (base ** i)
            }

            return {
                question: question + "_" + base + "\\text{ to base 10}",
                answer
            }
        },
        explanationFile: "tobase10.md"
    }
]

let generators = [];
let i = 0
Generators.map(gen => {
    if (gen.presets) return Object.keys(gen.presets).map(preset => {

        let explanationFile = gen.presets[preset].slice(-1)[0]
        if (typeof explanationFile !== "string") explanationFile = null

        return generators.push({
            ...gen,
            name: gen.name + preset,
            explanationFile,
            preset: gen.presets[preset],
            id: i++
        });
    })
    else return generators.push({ ...gen, id: i++ });
})

export default Generators = generators
