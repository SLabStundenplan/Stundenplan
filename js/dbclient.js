let token = localStorage.getItem("token");
let user = undefined;
let url = "https://stundenplan-agzpj.ondigitalocean.app";

setUser();


async function deleteEvent(eventId){
    let query = `DELETE ${eventId};`;
    await executeSql(query);
    refresh();
}

async function deleteAllEvents(){
    let query = `DELETE event;`;
    await executeSql(query);
}

async function insertEvents(events) {
    let query = events.map(ev => {
        try {
            return `CREATE event SET title = '${formatTextForDB(ev.title)}', location = '${formatTextForDB(ev.location)}', start = '${ev.start.toISOString()}', end = '${ev.end.toISOString()}', description = '${formatTextForDB(ev.description)}', user_id = '${user.id}', notes = '';\n`;
        } catch (error) { return ""; }
    }).join('');
    await executeSql(query);
}

async function updateNotes() {
    if (selected_event) {
        let event_id = selected_event.id;
        let notes = selected_event.notes;
        if (notes){
            let query = `
    UPDATE ${event_id} SET notes = '${formatTextForDB(JSON.stringify(notes))}' RETURN NONE;`;
        await executeSql(query);
        } else {
            let query = `
    UPDATE ${event_id} SET notes = '' RETURN NONE;`;
        await executeSql(query);
        }
        
    }


}

async function setUser() {
    let query = `
    SELECT id, name FROM user`;
    let users = await executeSql(query);
    if (users) {
        user = users[0];
        setCollapse(['button-signin','button-signup']);
        setVisible(['button-signout']);
    }
}

async function getEvents(start, end) {
    let query = `
    SELECT *, time::group(start, "day") as day
    FROM event 
    WHERE time::group(start, "day") >= time::group("${start.toISOString()}", "day") 
    AND time::group(start, "day") <= time::group("${end.toISOString()}", "day")
    ORDER BY start`;
    let events = await executeSql(query);
    if (events) {
        events.forEach(event => {
            event.start = new Date(event.start);
            event.end = new Date(event.end);
            event.day = new Date(event.day);
            if(event.notes && event.notes.length > 0){
                let notes = event.notes.replaceAll("\n", "\\n").replaceAll("\r", "\\r");
                //console.log(event);
                //console.log(notes);
                event.notes = JSON.parse(notes);
            }
        });
    }
    return events;
}

async function executeSql(query) {
    if (token) {
        let response = await fetch(`${url}/sql`, {
            method: "POST",
            body: query,
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Accept": "application/json",
                "NS": "test",
                "DB": "test",
                "Authorization": `Bearer ${token}`
            }
        });
        switch (response.status) {
            case 200:
                let json = await response.json();
                return json[0].result;
            default:
                return undefined;
        }
    }
}

async function signin() {
    let response = await fetch(`${url}/signin`, {
        method: "POST",
        body: JSON.stringify({
            NS: "test",
            DB: "test",
            SC: "user",
            email: document.getElementById('signin-email').value,
            password: document.getElementById('signin-password').value
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Accept": "application/json"
        }
    });
    switch (response.status) {
        case 200:
            let json = await response.json();
            token = json.token;
            localStorage.setItem("token", token);
            document.getElementById('signin-dialog').close(); document.getElementById('signin-error').innerHTML = '';
            await setUser();
            await refresh();
            


            break;
        case 400:
            document.getElementById('signin-error').innerHTML = 'falsche Email oder falsches Password';
            break;
        default:
            document.getElementById('signin-error').innerHTML = 'etwas ist schief gegangen';
            break;
    }
}
async function signup() {
    let response = await fetch(`${url}/signup`, {
        method: "POST",
        body: JSON.stringify({
            NS: "test",
            DB: "test",
            SC: "user",
            name: document.getElementById('signup-name').value,
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Accept": "application/json"
        }
    });
    switch (response.status) {
        case 200:
            let json = await response.json();
            token = json.token;
            localStorage.setItem("token", token);
            document.getElementById('signin-dialog').close(); document.getElementById('signin-error').innerHTML = '';
            await setUser();
            await refresh();
            break;
        case 400:
            document.getElementById('signup-error').innerHTML = 'ungültige Email';
            break;
        default:
            document.getElementById('signup-error').innerHTML = 'etwas ist schief gegangen';
            break;
    }
}

function formatTextForDB(text) {
    return text.replace("'", "");
}