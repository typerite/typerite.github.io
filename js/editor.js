let textbox = document.querySelector("#text");
let title = document.querySelector("#title");
let prevs = document.querySelector("#docprevs");
let idElem = document.querySelector("#id");
let uid = (Math.floor(Math.random() * 9999) + 1).toPrecision(4).replace(".", "");

let fontSize = 16;

var isCtrl = false;
document.onkeyup = function (e) {
    if (e.keyCode == 17) isCtrl = false;
}

document.onkeydown = function (e) {
    if (e.keyCode == 17) isCtrl = true;
    // console.log(e.keyCode)
    if (e.keyCode == 83 && isCtrl == true) { //Ctrl+S
        download(title.value + ".txt", textbox.innerText);
        return false;
    }
    if (e.keyCode == 219 && isCtrl == true) { //Ctrl+[
        fontSize--;
        textbox.style.fontSize = fontSize + "px";
        return false;
    }
    if (e.keyCode == 221 && isCtrl == true) { //Ctrl+]
        fontSize++;
        textbox.style.fontSize = fontSize + "px";
        return false;
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    // document.body.removeChild(element);
}

// INDEXEDDB STUFF!!

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB ||
    window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction ||
    window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange ||
    window.webkitIDBKeyRange || window.msIDBKeyRange

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

let db;
let request = window.indexedDB.open("typerite", 3);

request.onerror = function (event) {
    console.log("error: ");
};


request.onsuccess = function (event) {
    db = request.result;
    console.log("success: " + db);
};

request.onupgradeneeded = function (event) {
    var db = event.target.result;
    db.createObjectStore("typerite", {
        keyPath: "id"
    });
}

function add(id_, title_, text_) {
    var request = db.transaction(["typerite"], "readwrite").objectStore("typerite").put({
        id: id_,
        title: title_,
        text: text_
    });

    request.onsuccess = function (event) {
        // alert("Added to database");
    };

    request.onerror = function (event) {
        alert("Unable to add data");
    }
}

let objs = []

function readAll() {
    let objectStore = db.transaction("typerite").objectStore("typerite");
    objs = [];
    objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
            // alert("Title " + cursor.value.title);
            objs.push(cursor.value)
            cursor.continue();
        } else {
            // alert("No more entries!");
        }
    };
}

window.onload = () => {
    add("0000", "Example Note!", "<b>This</b> is an <i>example</i> note!")
    readAll()
    setTimeout(()=>{
        while(true){
            if(objs.find(x=>{return x["id"]!=uid})==undefined){
                uid = (Math.floor(Math.random() * 9999) + 1).toPrecision(4).replace(".", "");
            }
            else {
                break;
            }
        }

        idElem.innerText = "#"+uid;
    },100);
}

window.addEventListener("message", (event) => {
    // console.log(event.data)
    rite = objs.find(x=>{return x.id == event.data});
    textbox.innerHTML = rite["text"];
    title.value = rite["title"];
    idElem.innerText = "#"+rite["id"];
});

textbox.onkeydown = () => {
    if(textbox.textContent != "Enter some text..."){
        add(uid, title.value, textbox.innerHTML);
    }
}