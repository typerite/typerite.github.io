let prevs = document.querySelector("#docprevs");


function drop() {
    document.querySelector(".left__toolbar1").classList.toggle("show");
}

function drop1() {
    document.querySelector(".left__toolbar2").classList.toggle("show");
}

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

function loadRite(id) {
    document.querySelector("#frame").contentWindow.postMessage(id)
}

window.onload = () => {
    readAll()
    setTimeout(() => {
        // alert(objs[0]["title"])
        objs.forEach((i, j) => {
            c = document.createElement("div");
            c.onclick = () => {loadRite(i["id"])};
            c.className = "left__list__doc";
            c.innerHTML = `<div class="left__list__doc__title">
            ` + i["title"] + `
        </div>
        <div class="left__list__doc__text">
        ` + i["text"].match(/.{1,25}(\s|$)/g)[0].replace(/^\s+|\s+$/g, '') + `...
        </div>`;
            prevs.appendChild(c);
        });
    }, 100);
}