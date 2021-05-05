// import * as math from "mathjs";
// import { Decimal } from "decimal.js"
// import { getValueFromRinexObj } from "./ReadRinexService";
// import { TimeService } from "./TimeService";
//
//
// export class SatellitesService {
//     static async SatellitePosition(rinex, day, hour, minute, second) {
//
//
//         const time = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, second);
//
//         const groupedSats = rinex.reduce((groups, item) => ({
//             ...groups,
//                 [item.satNum]: [...(groups[item.satNum] || []), item]
//         }), {});
//
//         const tow = TimeService.towFromDate(day, hour, minute, second) - 0.072;
//
//         const satellitesPositions = [];
//
//         for (const s of Object.keys(groupedSats)) {
//             const closest = groupedSats[s].reduce((closestItem, item) => {
//                 const closestTime = new Date(Number(closestItem.year), Number(closestItem.month) - 1, Number(closestItem.day),
//                     Number(closestItem.hours), Number(closestItem.minutes), Number(closestItem.seconds))
//                 const itemTime = new Date(Number(item.year), Number(item.month) - 1, Number(item.day),
//                     Number(item.hours), Number(item.minutes), Number(item.seconds))
//                 return (Math.abs(time - closestTime) < Math.abs(time - itemTime) ? closestItem : item)
//             }
//         )
//
//         const Toe = getValueFromRinexObj(closest.Toe);
//         const Tk = tow - Toe;
//
//         const constants = {
//             my: 3.986005 * Math.pow(10, 14),
//             omegaE: 7.2921151467 * Math.pow(10, -5),
//             c: 299792458
//         }
//
//             const a = Math.pow(getValueFromRinexObj(closest.sqrtA), 2);
//             const N0 = Math.sqrt(mi / Math.pow(a, 3))
//             const N = N0 + getValueFromRinexObj(closest.deltaN)
//             const Mk = getValueFromRinexObj(closest.M0) + N * Tk;
//             let Ek = Mk;
//             const e = getValueFromRinexObj(closest.e)
//             let E2 = Mk + e * Math.sin(Ek);
//
//         const dayZero = new Date("1980-01-06 00:00:00"),
//             difference = day.getTime() - dayZero.getTime(); //difference between dates in miliseconds
//
//         const msInWeek = 604800000;
//
//         let week;
//         week = Math.floor(difference / msInWeek); //full weeks between dayZero and day
//
//         let diff2ms;
//         diff2ms = difference - (week * msInWeek); //miliseconds left after substracting full weeks
//
//         week -= 2048;//two full epochs (two times 1024 weeks) passed since dayZero, hardcoded for now
//
//         const seconds = diff2ms / 1000; //seconds left after substracting full weeks
//
//         const t = (week * 604800) + seconds;
//
//         for (const sat of satellites) {
//
//             const toe = s.toe;
//             const tk = t - toe;
//
//             const semimajorAxis = Math.pow(s.a, 2);
//
//             let meanMotion = Math.sqrt(constants.my / Math.pow(semimajorAxis, 3));
//
//             meanMotion = meanMotion + s.deltaN;
//
//             const Mk = (s.meanAnomaly + meanMotion * tk) % (2 * Math.PI);
//
//             const eccentricity = s.eccentricity;
//             let E = Mk;
//             let Ei = Mk + eccentricity * Math.sin(E);
//             const stopCondition = Math.pow(10, -12)
//
//             while ((Ei - E) > stopCondition) {
//                 E = Ei;
//                 Ei = Mk + eccentricity * Math.sin(E);
//             }
//
//             const vk = Math.atan2(Math.sqrt(1 - Math.pow(eccentricity, 2)) * Math.sin(Ei), Math.cos(Ei) - eccentricity);
//
//             const phik = vk + s.argumentOfPeriapsis;
//
//             const deltaUk = s.cus * Math.sin(2 * phik) + s.cuc * Math.cos(2 * phik);
//             const deltaRk = s.crs * Math.sin(2 * phik) + s.crc * Math.cos(2 * phik);
//             const deltaIk = s.cis * Math.sin(2 * phik) + s.cic * Math.cos(2 * phik);
//
//             const uk = phik + deltaUk;
//             const rk = semimajorAxis(1 - eccentricity * Math.cos(Ei)) + deltaRk;
//             const ik = s.i + s.IDOT * tk + deltaIk;
//
//             const xk = rk * Math.cos(uk);
//             const yk = rk * Math.sin(uk);
//
//             const bigOmegaK = s.rightAscension + (s.rightAscensionDot - constants.omegaE) * tk - constants.omegaE * toe;
//
//             const Xk = xk * Math.cos(bigOmegaK) - yk * Math.cos(ik) * Math.sin(bigOmegaK);
//             const Yk = xk * Math.sin(bigOmegaK) - yk * Math.cos(ik) * Math.cos(bigOmegaK);
//             const Zk = yk * Math.sin(ik);
//
//             const diff = t - toe;
//             const syncError = s.late + s.drift * diff + s.driftFrequency * Math.pow(diff, 2);
//
//             satsArr.push({Xk, Yk, Zk, syncError});
//         }
//
//         return satsArr;
//     }
//
// }

import {Decimal} from "decimal.js";
import * as math from 'mathjs'
import {getValueFromRinexObj} from "./ReadRinexService";
import {TimeService} from "./TimeService";


export class SatellitesService {
    static async SatellitesPosition(rinex, date, hours, minutes, seconds) {

        const userTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds)

        const groupedSats = rinex.reduce((groups, item) => ({
            ...groups,
            [item.satNum]: [...(groups[item.satNum] || []), item]
        }), {});

        const time = TimeService.towFromDate(date, hours, minutes, seconds) - 0.072

        const satsPos = []

        for(const sat of Object.keys(groupedSats)) {
            const closest = groupedSats[sat].reduce((closestItem, item) => {
                const closestTime = new Date(Number(closestItem.year), Number(closestItem.month) - 1, Number(closestItem.day),
                    Number(closestItem.hours), Number(closestItem.minutes), Number(closestItem.seconds))
                const itemTime = new Date(Number(item.year), Number(item.month) - 1, Number(item.day),
                    Number(item.hours), Number(item.minutes), Number(item.seconds))
                return (Math.abs(userTime - closestTime) < Math.abs(userTime - itemTime) ? closestItem : item)
            })

            const Toe = getValueFromRinexObj(closest.Toe)
            const Tk = time - Toe;

            const a = getValueFromRinexObj(closest.sqrtA) ** 2;
            const mi = 3.986005e14
            const c = 299792458
            const N0 = Math.sqrt(mi / Math.pow(a, 3))
            const N = N0 + getValueFromRinexObj(closest.deltaN)
            const Mk = getValueFromRinexObj(closest.M0) + N * Tk;
            let Ek = Mk;
            const e = getValueFromRinexObj(closest.e)
            let E2 = Mk + e * Math.sin(Ek);

            while(Math.abs(E2 - Ek) > 10e-15) {
                Ek = E2;
                E2 = Mk + e * Math.sin(Ek)
            }

            const Vk = Math.atan2(Math.sqrt(1 - Math.pow(e, 2)) * Math.sin(E2),
                Math.cos(E2) - e)

            const phiK = Vk + getValueFromRinexObj(closest.omega);
            const deltaUk = getValueFromRinexObj(closest.Cus) * Math.sin(2 * phiK) + getValueFromRinexObj(closest.Cuc) * Math.cos(2 * phiK);
            const deltaRk = getValueFromRinexObj(closest.Crs) * Math.sin(2 * phiK) + getValueFromRinexObj(closest.Crc) * Math.cos(2 * phiK)
            const deltaIk = getValueFromRinexObj(closest.Cis) * Math.sin(2 * phiK) + getValueFromRinexObj(closest.Cic) * Math.cos(2 * phiK)

            const Uk = phiK + deltaUk;
            const Rk = a * (1 - e * Math.cos(Ek)) + deltaRk;
            const i0 = getValueFromRinexObj(closest.i0)
            const IDOT = getValueFromRinexObj(closest.IDOT)
            const Ik = i0 + IDOT * Tk + deltaIk;

            const xk = Rk * Math.cos(Uk);
            const yk = Rk * Math.sin(Uk);
            const Rcontrol = Math.sqrt(xk ** 2 + yk ** 2);

            if(Math.abs(Rcontrol - Rk) > 0.01)
                throw new Error("Bad control")

            const We = 7.2921151467 * Math.pow(10, -5)
            const OmegaK = getValueFromRinexObj(closest.Omega0) + (getValueFromRinexObj(closest.Omega) - We) * Tk - We * Toe;


            const Xk = xk * Math.cos(OmegaK) - yk * Math.cos(Ik) * Math.sin(OmegaK)
            const Yk = xk * Math.sin(OmegaK) + yk * Math.cos(Ik) * Math.cos(OmegaK)
            const Zk = yk * Math.sin(Ik)


            const positions = {Xk, Yk, Zk}


            const Rcontrol2 = Math.sqrt(Xk ** 2 + Yk ** 2 + Zk ** 2)

            if(Math.abs(Rcontrol2 - Rk) > 0.01)
                throw new Error("Bad control")

            const relative = -2 * Math.sqrt(mi) / Math.pow(c, 2) * e * Math.sqrt(a) * Math.sin(E2)
            const deltaTs = getValueFromRinexObj(closest.aF0) + getValueFromRinexObj(closest.aF1) * Tk
                + getValueFromRinexObj(closest.aF2) * Math.pow(Tk, 2) + relative

            const obj = {data: closest, time: new Date(Number(closest.year), Number(closest.month) - 1, Number(closest.day),
                    Number(closest.hours), Number(closest.minutes), Number(closest.seconds)), pos: {...positions,  deltaTs}}

            satsPos.push(obj)
        }

        console.log("T", satsPos)

        return satsPos
    }

    static async ReceiverPosition(sats, rinexObs, observatioMask = 0) {
        console.log("SATPOS", sats)
        let Tau = 0.072
        const we = 7.2921151467 * Math.pow(10, -5);
        const c = 299792458
        let deltaTr = 0

        const mulMatrix = math.matrix([
            [Math.cos(we * Tau), Math.sin(we * Tau), 0],
            [-Math.sin(we * Tau), math.cos(we * Tau), 0],
            [0, 0, 1]
        ])

        for(let sat of sats) {
            const satPosRot = math.multiply(mulMatrix, [sat.pos.Xk, sat.pos.Yk, sat.pos.Zk])
            const x = satPosRot.subset(math.index(0))
            const y = satPosRot.subset(math.index(1))
            const z = satPosRot.subset(math.index(2))

            sat.pos.Xk = x
            sat.pos.Yk = y
            sat.pos.Zk = z


            const distance = Math.sqrt(
                Math.pow(x - rinexObs.observerPos.x, 2) +
                Math.pow(y - rinexObs.observerPos.y, 2) +
                Math.pow(z - rinexObs.observerPos.z, 2)
            )

            sat['distanceWithObserver'] = distance
        }

        const observerBLH = this.hirvonen(rinexObs.observerPos)
        console.log("OBSERVER", observerBLH)
        const satsWithObserver = this.directionsToSatellites(sats, observerBLH)

        const visibleSats = satsWithObserver.filter(item => item.withObserver.elevation > observatioMask)
        console.log("VISIBLE", visibleSats)

        const visiblePrns = visibleSats.map(sat => sat.data.satNum)
        console.log(visiblePrns)


        console.log(rinexObs)

        const Prz = []

        const Pobs = []
        visibleSats.forEach(sat => Prz.push([sat.distanceWithObserver - c * sat.pos.deltaTs]))

        console.log(Prz)
    }

    static hirvonen({x, y, z}) {
        const a = 6378137
        const e2 = 0.00669438002290

        const calculateN = B => {
            return a / Math.sqrt((1 - e2 * Math.pow(Math.sin(B), 2)))
        }

        const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
        let B = Math.atan(z / (r * (1 - e2)))
        let N = calculateN(B)
        let H = r / Math.cos(B) - N
        let nextB = Math.atan(z / (r * (1 - (e2 * (N / (N + H))))))
        while (Math.abs(nextB - B) > (0.00001/206265)) {
            B = nextB
            N = calculateN(B)
            H = r / Math.cos(B) - N
            nextB = Math.atan(z / (r * (1 - (e2 * (N / (N + H))))))
        }

        return {lambda: Math.atan(y / x), phi: nextB, h: r / Math.cos(nextB) - calculateN(nextB)}
    }

    static directionsToSatellites(satellites, {phi, lambda, h}) {
        const phiRad = phi
        const lambdaRad = lambda
        const e2 = 0.00669438002290
        const N = 6378137 / Math.sqrt(1 - e2 * Math.pow(Math.sin(phiRad), 2))
        const x = (N + h) * Math.cos(phiRad) * Math.cos(lambdaRad)
        const y = (N + h) * Math.cos(phiRad) * Math.sin(lambdaRad)
        const z = (N * (1 - e2) + h) * Math.sin(phiRad)

        const satelitesCords = []

        for(let s of satellites) {
            const vector = [s.pos.Xk - x, s.pos.Yk - y, s.pos.Zk - z]


            const R = math.matrix([
                [-(Math.sin(phiRad) * Math.cos(lambdaRad)), -Math.sin(lambdaRad), Math.cos(phiRad) * Math.cos(lambdaRad)],
                [-(Math.sin(phiRad) * Math.sin(lambdaRad)), Math.cos(lambdaRad), Math.cos(phiRad) * Math.sin(lambdaRad)],
                [Math.cos(phiRad), 0, Math.sin(phiRad)]
            ])

            const Rt = math.transpose(R)
            const Xr = math.multiply(Rt, vector)

            const n = Xr.subset(math.index(0))
            const e = Xr.subset(math.index(1))
            const u = Xr.subset(math.index(2))

            let Az = Math.atan2(e, n) * 180 / Math.PI

            if(Az < 0)
                Az += 360
            else if (Az > 360)
                Az -= 360


            const el = Math.asin(u / Math.sqrt(Math.pow(n, 2) + Math.pow(e, 2) + Math.pow(u, 2))) * 180 / Math.PI
            const ro = math.norm(vector)


            satelitesCords.push({...s, withObserver: {
                    observerPosition: {
                        x: x,
                        y: y,
                        z: z
                    },
                    elevation: el,
                    azimuth: Az,
                    forAMatrix: {
                        ro: ro,
                        xDiff: vector[0],
                        yDiff: vector[1],
                        zDiff: vector[2]
                    },
                    RMatrix: R,
                    satellitePosition: {
                        n: n,
                        e: e,
                        u: u}}})
        }

        return satelitesCords;
    }

    static calculateDOPS(visibleSatellites) {
        console.log("VISIBLE SATS", visibleSatellites)

        const aVector = [];


        for (let s of visibleSatellites)
            aVector.push([
                -s.withObserver.forAMatrix.xDiff / s.withObserver.forAMatrix.ro,
                -s.withObserver.forAMatrix.yDiff / s.withObserver.forAMatrix.ro,
                -s.withObserver.forAMatrix.zDiff / s.withObserver.forAMatrix.ro,
                1
            ])
        const aMatrix = math.matrix(aVector)


        const qMatrix = math.inv(math.multiply(math.transpose(aMatrix), aMatrix))


        const diag = math.diag(qMatrix).toArray()


        let GDOP = 0;
        let PDOP = 0;
        let TDOP = 0;

        for(let q in diag) {
            GDOP += diag[Number(q)]
            if(q < 3)
                PDOP += diag[Number(q)]
            if(Number(q) === 3)
                TDOP += diag[Number(q)]
        }

        GDOP = Math.sqrt(GDOP)
        PDOP = Math.sqrt(PDOP)
        TDOP = Math.sqrt(TDOP)
        const Qxyz = math.subset(qMatrix, math.index([0, 1, 2], [0, 1, 2]))
        const Qn = math.multiply(math.transpose(visibleSatellites[0].withObserver.RMatrix), Qxyz, visibleSatellites[0].withObserver.RMatrix)
        const diagNEU = math.diag(Qn).toArray()
        const HDOP = Math.sqrt(diagNEU[0] + diagNEU[1])
        const PDOPneu = Math.sqrt(diagNEU[0] + diagNEU[1] + diagNEU[2])
        const VDOP = Math.sqrt(diagNEU[2])


        return {HDOP, TDOP, VDOP, GDOP, PDOP}
    }

    static SatellitesCoordinates(alm, {week, seconds}) {
        if(!alm)
            return null

        const mi = new Decimal(3.986004415 * Math.pow(10, 14))
        const we = new Decimal(7.2921151467 * Math.pow(10, -5))
        const time = week * 604800 + seconds
        const toa = (alm.gpsWeek - 2048) * 604800 + alm.toa
        const dt = time - toa //tk

        const satellitesCoordinates = []

        for(let s of alm.satellites) {

            const n = new Decimal(Decimal.sqrt(mi.div(Math.pow(s.semimajorAxis, 3))))
            const Mk = (s.meanAnomaly + n * dt) % (2 * Math.PI) //poprawiana anomalia średnia
            const mk = new Decimal(Mk)
            let E = new Decimal(Mk)
            const eccentricity = new Decimal(s.eccentricity)
            let E2 = new Decimal(E.plus(eccentricity.mul(Decimal.sin(E))))
            const diff = new Decimal(Math.pow(10, -15))

            while((E2 - E) > diff) {
                E = E2
                E2 = new Decimal(mk.plus(eccentricity.mul(Decimal.sin(E))))
            }


            const vk = Decimal.atan2(Decimal.sqrt(1 - Decimal.pow(eccentricity, 2)).mul(Decimal.sin(E2)),
                Decimal.cos(E2).minus(eccentricity))

            const width = vk.plus(s.argumentOfPeriapsis)
            const rk = new Decimal(s.semimajorAxis * (1 - eccentricity.mul(Decimal.cos(E2))))
            const xk = rk.mul(Decimal.cos(width))
            const yk = rk.mul(Decimal.sin(width))
            const omegak = new Decimal(s.rightAscension + (s.rightAscensionDot - we) * dt - we * alm.toa)

            const Xk = xk.mul(Decimal.cos(omegak)).minus(yk.mul(Decimal.cos(s.inclination)).mul(Decimal.sin(omegak)))
            const Yk = xk.mul(Decimal.sin(omegak)).add(yk.mul(Decimal.cos(s.inclination)).mul(Decimal.cos(omegak)))
            const Zk = yk.mul(Decimal.sin(s.inclination))
            satellitesCoordinates.push({satellitePRN: s.prn, x: Xk.toNumber(), y: Yk.toNumber(), z: Zk.toNumber()})
        }

        return satellitesCoordinates;
    }
}


export default SatellitesService;