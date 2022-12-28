// Converts different time units to milliseconds
const days = (days) => {
    return days * 24 * 60 * 60 * 1000;
}

const hours = (hours) => {
    return hours * 60 * 60 * 1000;
}

const minutes = (minutes) => {
    return minutes * 60 * 1000;
}

const seconds = (seconds) => {
    return seconds * 1000;
}

module.exports = { days, hours, minutes, seconds }