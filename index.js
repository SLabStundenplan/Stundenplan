let selected_date = new Date();
let events = JSON.parse(localStorage.getItem("events"));

window.onload = refresh;

function changeDay(i) {
    selected_date.setDate(selected_date.getDate() + i);
    refresh();
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
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
            const monday = getMonday(selected_date);

            let eventsToday = events[getDayKey(monday)];
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