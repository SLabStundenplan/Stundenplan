function mapHeader(text) {
    switch (text) {
        case "Titel":
            return "title";
        case "Ort":
            return "location";
        case "Start":
            return "start";
        case "Ende":
            return "end";
        case "Beschreibung":
            return "description";
        default:
            return text;
    }
}

function openCsv(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            var events = parseCsv(e.target.result);
            insertEvents(events);
            //refresh();
        };
        reader.readAsText(selectedFile);
    }
}

function parseCsv(csv) {
    const lines = csv.split(/\r\n|\n/);
    const headers = lines[0].split(';').map(header => header.trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(';');

        for (let j = 0; j < headers.length; j++) {
            let header = mapHeader(headers[j]);
            obj[header] = currentLine[j]?.replace(/^"|"$/g, '').trim();
            if (headers[j] == "Start" || headers[j] == "Ende") {
                obj[header] = new Date(obj[header]);
            }
        }

        result.push(obj);
    }

    return result;
}