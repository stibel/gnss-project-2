export class TimeService {

    static GPStime(date, hour, minute, second) {
        const dayZero = new Date('January 6, 1980 00:00:00')
        const difference = date - dayZero; //miliseconds
        const msInWeek = 1000 * 60 * 60 * 24 * 7;
        let week = Math.floor( difference / msInWeek);
        const diffMs = difference - week * msInWeek;
        week -= 2048; //substracting two full epochs
        const tow = diffMs / 1000 + hour * 3600 + minute * 60 + second;
        return {week, tow};
    }

    static towFromDate(date, hour, minute, second) {
        const dayZero = new Date('January 6, 1980 00:00:00')
        const difference = (new Date(date.getFullYear(), date.getMonth(), date.getDate()) - dayZero);
        const diffDays = difference / (1000 * 60 * 60 * 24);
        const dow = diffDays % 7;
        return dow * 86400 + hour * 3600 + minute * 60 + second;

    }
}