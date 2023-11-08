function openCsv(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            var array = parseCsv(e.target.result);
            array = groupBy(array, (x) => `${x.Start.getFullYear()}.${pad(x.Start.getMonth() + 1, 2)}.${pad(x.Start.getDate(), 2)}`);
            console.log(`array: `, array);
        };
        reader.readAsText(selectedFile);
    }
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
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