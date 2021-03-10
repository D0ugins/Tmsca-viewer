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

const getTestPath = (name) => {
    const level = levelMap[name.slice(0, 2)]
    const type = typeMap[name.slice(2, 4)]
    return `${level}/${type}/${type} ${name.slice(-5)}/${name}`
}

export { typeMap, levelMap, nameMap, getTestPath }