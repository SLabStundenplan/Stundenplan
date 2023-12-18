function getMonday(d) {
    d = new Date(d);
    var day = d.getDay();
    var diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
function addDay(d, t) {
    d = new Date(d);
    var diff = d.getDate() + t;
    return new Date(d.setDate(diff));
}

function getCalendarWeek(date) {
    let currentDate = new Date(date);
    currentDate.setMonth(0, 1);
    let dayOfWeek = currentDate.getDay();
    let daysToAdd = (dayOfWeek <= 4) ? 4 - dayOfWeek : 11 - dayOfWeek;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
    let weekNumber = Math.ceil((date - currentDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return weekNumber;
}