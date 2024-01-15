function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num.substring(num.length - size);
}

function formatTitle(title) {
    let index = title.indexOf("(");// STA (2021)
    if (index == -1) {
        index = title.length;
    }
    let index2 = title.indexOf(","); // Makerspace, Makerspace,  
    if (index2 != -1 && index2 < index) {
        index = index2;
    }
    return title.substring(0, index);
}

function formatDate(date) {
    return `${pad(date.getDate(), 2)}.${pad(date.getMonth() + 1, 2)}.${pad(date.getFullYear(), 2)}`;
}

function getType(event) {
    if (event.description) {
        let type = event.description;
        let index = type.indexOf("|");
        if (index != -1 && type.length > index + 2) {
            type = type.substring(index + 2, index + 3);
            switch (type) {
                case "V":
                    return "- Vorlesung";
                case "P":
                    return "- Praktikum";
                case "Ü":
                    return "- Übung";
                default:
                    break;
            }
        }
    }
    return "";
}

function createRemoveButton(event){
    return `<button class="remove-button" onclick=deleteEvent('${event.id}')>x</button>`;
}

function formatEventDay(event) {
    return `${formatTitle(event.title)} ${getType(event)} ${createRemoveButton(event)}<br> ${pad(event.start.getHours(), 2)}.${pad(event.start.getMinutes(), 2)} - ${pad(event.end.getHours(), 2)}.${pad(event.end.getMinutes(), 2)} <br> ${event.location}`;
}

function formatEventWeek(event) {
    return `${formatTitle(event.title)} ${getType(event)} ${createRemoveButton(event)}<br> ${pad(event.start.getHours(), 2)}.${pad(event.start.getMinutes(), 2)} - ${pad(event.end.getHours(), 2)}.${pad(event.end.getMinutes(), 2)}`;
}

function formatEventMonth(event) {
    return `${formatTitle(event.title)} ${getType(event)} ${createRemoveButton(event)}`;
}
