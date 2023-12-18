let token = undefined;
let user = undefined;
let url = "https://stundenplan-agzpj.ondigitalocean.app";


function insertEvents(events) {
    let query = events.map(ev => {
        try {
            return `CREATE event SET title = '${formatTextForDB(ev.title)}', location = '${formatTextForDB(ev.location)}', start = '${ev.start.toISOString()}', end = '${ev.end.toISOString()}', description = '${formatTextForDB(ev.description)}', user_id = '${user.id}';\n`;
        } catch (error) { return ""; }
    }).join('');
    executeSql(query);
    console.log("ready");
}

function setUser() {
    let query = `
    SELECT id, name FROM user`;
    executeSql(query, users => {
       user = users[0];
       console.log(user);
    });
}

function getEvents(start, end, callback) {
    let query = `
    SELECT *, time::group(start, "day") as day
    FROM event 
    WHERE time::group(start, "day") >= time::group("${start.toISOString()}", "day") 
    AND time::group(start, "day") <= time::group("${end.toISOString()}", "day")
    ORDER BY start`;
    executeSql(query, events => {
        events.forEach(event => {
            event.start = new Date(event.start);
            event.end = new Date(event.end);
            event.day = new Date(event.day);
        });
        callback(events);
    });
}

function executeSql(query, callback) {
    if(token){
    fetch(`${url}/sql`, {
        method: "POST",
        body: query,
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Accept": "application/json",
            "NS": "test",
            "DB": "test",
            "Authorization": `Bearer ${token}`
        }
    }).then((response) => {
        switch (response.status) {
            case 200:
                if (callback) {
                    response.json().then((json) => {
                        callback(json[0].result);
                    });
                }
                break;
            default:
                console.log("fail");
                break;
        }
    });}
}

function signin() {
    fetch(`${url}/signin`, {
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
    }).then((response) => {
        switch (response.status) {
            case 200:
                response.json().then((json) => {
                    token = json.token;
                    document.getElementById('signin-dialog').close(); document.getElementById('signin-error').innerHTML = '';
                    setUser();
                });
                break;
            case 400:
                document.getElementById('signin-error').innerHTML = 'falsche Email oder falsches Password';
                break;
            default:
                document.getElementById('signin-error').innerHTML = 'etwas ist schief gegangen';
                break;
        }
    });
}
function signup() {
    fetch(`${url}/signup`, {
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
    }).then((response) => {
        switch (response.status) {
            case 200:
                response.json().then((json) => {
                    token = json.token;
                    document.getElementById('signup-dialog').close(); document.getElementById('signup-error').innerHTML = '';
                    setUser();
                });
                break;
            case 400:
                document.getElementById('signup-error').innerHTML = 'ungültige Email';
                break;
            default:
                document.getElementById('signup-error').innerHTML = 'etwas ist schief gegangen';
                break;
        }
    });
}

function formatTextForDB(text) {
    return text.replace("'", "");
}