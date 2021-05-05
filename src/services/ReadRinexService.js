const checkArr = (arr, estimatedArrSize = 4, firstLine = false) => {
    let splitCopy = [...arr]
    if(arr.length !== estimatedArrSize) {
        let cnt = 0;
        for(let item in arr) {
            if(arr[item].length > 19) {
                let splitItem = arr[item]
                let values = []

                if(Number(item) === 6 && firstLine) {
                    const seconds = splitItem.substr(0, 2)
                    values.push(seconds)
                    splitItem = splitItem.substr(2, splitItem.length - 2)
                }
                while(splitItem.length > 19) {
                    const idx = splitItem.indexOf('D')
                    const value = splitItem.substr(0, idx + 4)
                    values.push(value)
                    splitItem = splitItem.substr(idx + 4, splitItem.length)
                }
                values.push(splitItem)
                splitCopy.splice(Number(item) + cnt, 1, ...values)
                ++cnt;
            }
        }
    }
    return splitCopy;
}

export default function RINEX3NAV(rinexPlain) {
    const [header, content] = rinexPlain.split('END OF HEADER')
    const satsContent = content.trim().split('G').filter(item => item.length > 0)
    const RINEX = []

    console.log(header)

    for(let c of satsContent) {
        const lines = c.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0)
        let satRINEXObj = {}
        for(let line in lines) {
            switch (Number(line)) {
                case 0:
                    const [satNum, year, month, day, hours,
                        minutes, seconds, aF0, aF1, aF2] = checkArr(lines[line].split(' '), 10, true)
                    satRINEXObj = { ...satRINEXObj, satNum, year, month, day, hours, minutes, seconds, aF0, aF1, aF2}
                    break;
                case 1:
                    const [IODE, Crs, deltaN, M0] = checkArr(lines[line].split(' '))
                    satRINEXObj = { ...satRINEXObj, IODE, Crs, deltaN, M0}
                    break;
                case 2:
                    const [Cuc, e, Cus, sqrtA] = checkArr(lines[line].split(' '))
                    satRINEXObj = { ...satRINEXObj, Cuc, e, Cus, sqrtA}
                    break;
                case 3:
                    const [Toe, Cic, Omega0, Cis] = checkArr(lines[line].split(' '))
                    satRINEXObj = {...satRINEXObj, Toe, Cic, Omega0, Cis}
                    break;
                case 4:
                    const [i0, Crc, omega, Omega] = checkArr(lines[line].split(' '))
                    satRINEXObj = {...satRINEXObj, i0, Crc, omega, Omega}
                    break;
                case 5:
                    const [IDOT, CODEL2, GPSweek, L2PdataFlag] = checkArr(lines[line].split(' '))
                    satRINEXObj = {...satRINEXObj, IDOT, CODEL2, GPSweek, L2PdataFlag}
                    break;
                case 6:
                    const [SVaccuracy, health, Tgd, IODC] = checkArr(lines[line].split(' '))
                    satRINEXObj = {...satRINEXObj, SVaccuracy, health, Tgd, IODC}
                    break;
                case 7:
                    const [Tom, FITinterval, back1, back2] = checkArr(lines[line].split(' '))
                    satRINEXObj = {...satRINEXObj, Tom, FITinterval, back1, back2}
                    break;
                default:
                    break;
            }
        }
        RINEX.push(satRINEXObj)
        satRINEXObj = {}
    }

    return RINEX
}

export const RINEX3OBS = (rinexPlain) => {
    const [useless, withoutUseless] = rinexPlain.split('ANTENNA: DELTA H/E/N')

    const uselessLines = useless.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0)

    const pos = uselessLines.filter(item => item.split('APPROX POSITION XYZ').length > 1)[0].split('APPROX POSITION XYZ')
    const [x, y, z] = pos[0].trim().split(' ').filter(item => item.length > 0)
    console.log(x, y, z)

    const [header, content] = withoutUseless.split("END OF HEADER");
    const types = {
        GPS: [],
        R: [],
        E: [],
        C: [],
        J: [],
        S: []
    }

    const headerTypes = header.split('SYS / # / OBS TYPES').map(item => item.trim()).filter(item => item.split(" ").length < 25)

    let observationMap = new Map([
        ["G", "GPS"],
        ["R", "R"],
        ["E", "E"],
        ["C", "C"],
        ["J", "J"],
        ["S", "S"]
    ])

    let currentSatellites;
    for(let line of headerTypes) {
        const observationTypes = line.split(" ").filter(item => item.length > 0);

        if(observationTypes[0].length === 1)
            currentSatellites = observationMap.get(observationTypes[0]);

        for(let type of observationTypes)
            if(type.length === 3)
                types[currentSatellites].push(type)

    }

    const allObservations = []
    const dates = content.split(">").map(item => item.trim()).filter(item => item.length > 0)

    for(let date of dates) {
        const observation = {
            GPS: [],
            R: [],
            E: [],
            C: [],
            J: [],
            S: [],
            epoch: {}
        }

        const lines = date.split(/[\r\n]+/).map(line => line.trim()).filter(line => line.length > 0)

        let lineCnt = 0;
        for(let line of lines) {
            const values = line.trim().split(" ").map(item => item.trim()).filter(item => item.length > 0)

            if(lineCnt++ === 0) {
                const [year, month, day, hours,
                    minutes, seconds] = values;

                observation.epoch = {year, month, day, hours, minutes, seconds}
            } else {
                const satID = values[0]
                const ID = satID[0]
                const satPRN = satID.substr(1, 2)
                const obs = {satID, satPRN, observations: []}
                const satellites = observationMap.get(ID)
                for(let i = 1; i < values.length; ++i)
                    obs.observations.push({type: types[satellites][i - 1], value: Number(values[i])})

                observation[satellites].push(obs)
            }
        }

        allObservations.push(observation)
    }

    return {allObservations, observerPos: {x, y, z}};
}

export const getValueFromRinexObj = (value) => {
    if(!value) {
        console.log("VALUE", value)
        throw new Error("Undefined passed to function")
    }

    return Number(value.replace('D', 'e'))
}