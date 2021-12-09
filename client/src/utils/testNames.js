const typeMap = {
    'NS': 'Number Sense',
    'MA': 'Math',
    'SC': 'Science',
    'CA': 'Calculator'
}

const levelMap = {
    'MS': "Middle",
    'EL': 'Elementary'
}

const nameMap = {
    'Kickoff': ' KO',
    'Gear up': ' GU',
    'Tune up': ' TU',
    'Regional': ' REG',
    'State': ' STATE',
    'Spring online': ' SPRING OL'
}

const getNums = (level, year) => {

    // Years for elementary tests
    if (level === "EL") {
        if (year === "20-21") return ["Spring online", "State"]
        return []
    }

    // Creates array for test numbers 1-13
    let base = []
    for (let i = 1; i <= 13; i++) { base.push(i.toString()) }

    // List of all the non standard 1-13 tests for each year
    const extras = {
        "20-21": ['11A', 'Kickoff', 'Gear up', 'Regional', 'Tune up'],
        "19-20": ['Kickoff', 'Regional'],
        "18-19": ['Kickoff', 'Gear up', 'Regional', 'Tune up', 'State'],
        "17-18": ['Regional', 'State']
    };
    if (year === "21-22" && level === "MS") return ['Gear up'];
    return base.concat(extras[year]);
}

const getTestPath = (name) => {
    const level = levelMap[name.slice(0, 2)]
    const type = typeMap[name.slice(2, 4)]
    return `${level}/${type}/${type} ${name.slice(-5)}/${name}`
}

export { typeMap, levelMap, nameMap, getTestPath, getNums }