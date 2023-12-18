function setHidden(element_ids) {
    element_ids.forEach(element_id => {
        document.getElementById(element_id).style.visibility = 'hidden';
    });
}
function setVisible(element_ids) {
    element_ids.forEach(element_id => {
        document.getElementById(element_id).style.visibility = 'visible';
    });
}
function setCollapse(element_ids) {
    element_ids.forEach(element_id => {
        document.getElementById(element_id).style.visibility = 'collapse ';
    });
}

function set_invisible(element_ids) {
    element_ids.forEach(element_id => {
        document.getElementById(element_id).style.display = 'none';
    });
}
function set_visible(element_ids) {
    element_ids.forEach(element_id => {
        document.getElementById(element_id).style.display = 'table-cell';
    });
}

function setText(element_ids, text) {
    element_ids.forEach(element_id => {
        let element = document.getElementById(element_id);
        if (element) {
            element.innerHTML = text;
        }
    });
}

function setClass(element_ids, text) {
    element_ids.forEach(element_id => {
        let element = document.getElementById(element_id);
        if (element) {
            element.classList.add(text);
        }
    });
}
function removeClass(element_ids, text) {
    element_ids.forEach(element_id => {
        let element = document.getElementById(element_id);
        if (element) {
            element.classList.remove(text);
        }
    });
}