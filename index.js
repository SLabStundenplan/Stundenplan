let selected_date = new Date();
let events = JSON.parse(localStorage.getItem("events"));

window.onload = refresh;

function changeDay(i) {
    selected_date.setDate(selected_date.getDate() + i);
    refresh();
}

function changeMonth(i) {
    selected_date.setMonth(selected_date.getMonth() + i);
    refresh();
}


function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
function addDay(d, t) {
    d = new Date(d);
    var diff = d.getDate() + t;
    return new Date(d.setDate(diff));
}

function getRows(date) {
    const monday = getMonday(date);

    let eventsWeek = [
        events[getDayKey(monday)],
        events[getDayKey(addDay(monday, 1))],
        events[getDayKey(addDay(monday, 2))],
        events[getDayKey(addDay(monday, 3))],
        events[getDayKey(addDay(monday, 4))]
    ];
    let rows = [];
    for (let i = 0; true; i++) {
        let cells = [];
        eventsWeek.forEach(events_list => {
            if (events_list && events_list.length > 0) {
                cells.push(events_list[i]);
            } else {
                cells.push(undefined);
            }
        });
        if (cells.every(item => item === undefined)) {
            break;
        } else {
            rows.push(cells);
        }
    }
    console.log(rows);
    return rows;
}

function refresh() {

    var daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    var dayName = daysOfWeek[selected_date.getDay()];

    var dayHeader = document.getElementById("DayHeader");
    if (dayHeader) {
        dayHeader.innerHTML = dayName;
    }



    document.getElementById("labelSelectedDate").innerHTML = `${pad(selected_date.getDate(), 2)}.${pad(selected_date.getMonth() + 1, 2)}.${pad(selected_date.getFullYear(), 2)}`;
    let eventContainer = document.getElementById("eventContainer");
    eventContainer.innerHTML = "";


    if (events) {
        let dayView = false;
        if (dayView) {
            let eventsToday = events[getDayKey(selected_date)];
            if (eventsToday) {
                eventsToday.forEach(event => {
                    const tr = document.createElement("tr");
                    const td = document.createElement("td");
                    let index = event.Titel.indexOf("(");// STA (2021)
                    if (index == -1) {
                        index = event.Titel.length;
                    }

                    let index2 = event.Titel.indexOf(","); // Makerspace, Makerspace, 
                    if (index2 != -1 && index2 < index) {
                        index = index2;
                    }
                    const textnode = document.createTextNode(`${event.Titel.substring(0, index)}`);
                    td.appendChild(textnode);
                    tr.appendChild(document.createElement("td"));
                    tr.appendChild(td);
                    eventContainer.appendChild(tr);
                });
            }
        } else { // weekView
            getRows(selected_date).forEach(events_list => {
                const tr = document.createElement("tr");
                tr.appendChild(document.createElement("td"));

                events_list.forEach(event => {
                    if (event) {
                        const td = document.createElement("td");
                        let index = event.Titel.indexOf("(");// STA (2021)
                        if (index == -1) {
                            index = event.Titel.length;
                        }

                        let index2 = event.Titel.indexOf(","); // Makerspace, Makerspace, 
                        if (index2 != -1 && index2 < index) {
                            index = index2;
                        }
                        const textnode = document.createTextNode(`${event.Titel.substring(0, index)}`);
                        td.appendChild(textnode);
                        tr.appendChild(td);
                    } else {
                        tr.appendChild(document.createElement("td"));
                    }

                });

                eventContainer.appendChild(tr);
            });
        }
    }
}

function getDayKey(date) {
    return `${date.getFullYear()}.${pad(date.getMonth() + 1, 2)}.${pad(date.getDate(), 2)}`;
}

function openCsv(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            events = groupBy(parseCsv(e.target.result), (x) => getDayKey(x.Start));
            localStorage.setItem("events", JSON.stringify(events));
            refresh();
        };
        reader.readAsText(selectedFile);
    }
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num.substring(num.length - size);
}

function groupBy(xs, fn) {
    return xs.reduce(function (rv, x) {
        (rv[fn(x)] = rv[fn(x)] || []).push(x);
        return rv;
    }, {});
};

function parseCsv(csv) {
    const lines = csv.split(/\r\n|\n/);
    const headers = lines[0].split(';').map(header => header.trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(';');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j]?.replace(/^"|"$/g, '').trim();
            if (headers[j] == "Start" || headers[j] == "Ende") {
                obj[headers[j]] = new Date(obj[headers[j]]);
            }
        }

        result.push(obj);
    }

    return result;
}
