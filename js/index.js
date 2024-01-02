let selected_date = new Date();
let selected_view = "week";
let selected_event = undefined;
let events = JSON.parse(localStorage.getItem("events"));
if (events) {
    Object.keys(events).forEach(key => {
        events[key].forEach(event => {
            if (event.Start) {
                event.Start = new Date(event.Start);
            }
            if (event.Ende) {
                event.Ende = new Date(event.Ende);
            }
        });

    });
}

window.onload = refresh;

function createNewEvent() {
    console.log("create Event");
}

function change(i) {
    switch (selected_view) {
        case "day":
            selected_date.setDate(selected_date.getDate() + i);
            break;
        case "week":
            selected_date.setDate(selected_date.getDate() + i*7);
            break;
        case "month":
            selected_date.setMonth(selected_date.getMonth() + i);
            break;
    }
    refresh();
}

function getRows(date, groups) {
    let monday = getMonday(date);

    let eventsWeek = [];
    for (let i = 0; i < 5; i++) {
        eventsWeek.push(groups[getDayKey(addDay(monday, i))]);
    }
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
    return rows;
}

function addRow(container, texts, colspan, data) {
    const tr = document.createElement("tr");
    for (let i = 0; i < texts.length; i++) {
        const td = document.createElement("td");
        td.setAttribute('colspan', colspan);
        td.innerHTML = texts[i];
        if (data && data[i]) {
            td.id = data[i].id;
            td.addEventListener('click', async (e) => {
                await updateNotes();
                selected_event = data[i];
                refreshEvent();
            });
            if (data[i].notes) {
                td.classList.add("noteAdded");
            } else {
                td.classList.add("noteRemoved");
            }
        }
        tr.appendChild(td);
    }
    container.appendChild(tr);
}


function refreshEvent() {
    var dayHeader = document.getElementById("headerNotes");
    if (dayHeader) {
        dayHeader.innerHTML = `Notizen für ${formatTitle(selected_event.title)} ${pad(selected_event.start.getDate(), 2)}.${pad(selected_event.start.getMonth() + 1, 2)}.${pad(selected_event.start.getFullYear(), 2)} ${pad(selected_event.start.getHours(), 2)}.${pad(selected_event.start.getMinutes(), 2)} - ${pad(selected_event.end.getHours(), 2)}.${pad(selected_event.end.getMinutes(), 2)}`;
    }
    quill.setContents(selected_event.notes);
}
function noteInput(event) {

    if (selected_event) {
        var length = quill.getLength();
        selected_event.notes = length > 1 ? quill.getContents() : undefined;
        let element = document.getElementById(selected_event.id);
        if (element){
            if (selected_event.notes) {
                element.classList.add("noteAdded");
                element.classList.remove("noteRemoved");
            } else {
                element.classList.remove("noteAdded");
                element.classList.add("noteRemoved");
            }
        }
        
    }
}

async function refresh() {
    await updateNotes();    

    var daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    var months = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ];

    var dayHeader = document.getElementById("headerMonday");
    if (dayHeader) {
        dayHeader.innerHTML = daysOfWeek[selected_view == "day" ? selected_date.getDay() : 1];
    }

    var title = "";
    switch (selected_view) {
        case "day":
            title = `${pad(selected_date.getDate(), 2)}.${pad(selected_date.getMonth() + 1, 2)}.${pad(selected_date.getFullYear(), 2)}`;
            break;
        case "week":
            title = `${getCalendarWeek(selected_date)}.KW`;
            break;
        case "month":
            title = `${months[selected_date.getMonth()]}`;
            break;
        default:
            break;
    }

    let labelSelectedDate = document.getElementById("labelSelectedDate");
    if (labelSelectedDate) {
        labelSelectedDate.innerHTML = title;
    }

    let eventContainer = document.getElementById("eventContainer");
    if (eventContainer === null) {
        return;
    }
    eventContainer.innerHTML = "";

    if (true) {
        let headers = ["headerTuesday",
            "headerWednesday",
            "headerThursday",
            "headerFriday"];
        switch (selected_view) {
            case "day":
                removeClass(["monthView", "weekView"], "selected");
                setClass(["dayView"], "selected");
                set_invisible(headers);
                let eventsToday = await getEvents(selected_date, selected_date);
                if (eventsToday){
                    if (eventsToday.length > 0) {
                        eventsToday.forEach(event => {
                            addRow(eventContainer, [formatEventDay(event)], 1, [event]);
                        });
                    } else {
                        addRow(eventContainer, [`keine Termine ...`], 1);
                    }
                } else {
                    addRow(eventContainer, [`please sign in / sign up`], 1);
                }
                break;
            case "week":
                removeClass(["dayView", "monthView"], "selected");
                setClass(["weekView"], "selected");
                set_visible(headers);

                let monday = getMonday(selected_date);
                addRow(eventContainer, [0, 1, 2, 3, 4,].map((i) => formatDate(addDay(monday, i))), 1);
                
                let week_events = await getEvents(monday, addDay(monday, 6));
                if (week_events){
                    let groups = groupBy(week_events, e => getDayKey(e.day));
                    let rows = getRows(selected_date, groups);
                    if (rows.length > 0) {
                        rows.forEach(events_list => {
                            addRow(eventContainer, events_list.map((event) => event ? formatEventWeek(event) : ""), 1, events_list);
                        });
                    } else {
                        addRow(eventContainer, [`keine Termine ...`], 5);
                    }
                } else {
                    addRow(eventContainer, [`please sign in / sign up`], 5);
                }
                break;
            case "month":
                removeClass(["dayView", "weekView"], "selected");
                setClass(["monthView"], "selected");
                set_visible(headers);
                let first_monday = getMonday(selected_date);
                let month_events = await getEvents(first_monday, addDay(first_monday, 5*7));
                if (month_events){
                    let groups = groupBy(month_events, e => getDayKey(e.day));

                    for (let i = 0; i < 5; i++) {
                        let day = addDay(selected_date, i * 7);
                        addRow(eventContainer, [`${getCalendarWeek(day)}.KW`], 5);
                        let monday = getMonday(day);
                        addRow(eventContainer, [0, 1, 2, 3, 4].map((i) => formatDate(addDay(monday, i))), 1);
    
                        let rows = getRows(day, groups);
                        if (rows.length > 0) {
                            rows.forEach(events_list => {
                                addRow(eventContainer, events_list.map((event) => event ? formatTitle(event.title) : ""), 1, events_list);
                            });
                        } else {
                            addRow(eventContainer, [`keine Termine ...`], 5);
                        }
                    }
                } else {
                    addRow(eventContainer, [`please sign in / sign up`], 5);
                }
                break;
            default:
                break;
        }
    }
}

function getDayKey(date) {
    return `${date.getFullYear()}.${pad(date.getMonth() + 1, 2)}.${pad(date.getDate(), 2)}`;
}

function groupBy(xs, fn) {
    return xs.reduce(function (rv, x) {
        (rv[fn(x)] = rv[fn(x)] || []).push(x);
        return rv;
    }, {});
};


