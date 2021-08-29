let textbox = document.querySelector("#text");
let title = document.querySelector("#title");
let prevs = document.querySelector("#docprevs");
let idElem = document.querySelector("#id");
let uid = (Math.floor(Math.random() * 9999) + 1).toPrecision(4).replace(".", "");
let SEC = "";

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
let request = window.indexedDB.open("typerite", 4);

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
        title: encrypt(title_, SEC),
        text: encrypt(text_, SEC)
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

function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
        currChar = data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        } else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        } else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}

function enc(plainText, SECRET) {
    var b64 = CryptoJS.AES.encrypt(plainText, SECRET).toString();
    var e64 = CryptoJS.enc.Base64.parse(b64);
    var eHex = e64.toString(CryptoJS.enc.Hex);
    return eHex;
}

function dec(cipherText, SECRET) {
    var reb64 = CryptoJS.enc.Hex.parse(cipherText);
    var bytes = reb64.toString(CryptoJS.enc.Base64);
    var decrypt = CryptoJS.AES.decrypt(bytes, SECRET);
    var plain = decrypt.toString(CryptoJS.enc.Utf8);
    return plain;
}

function checksum(sd) {
    return CryptoJS.MD5(sd).toString();
}

function setUID() {
    readAll()
    setTimeout(() => {
        while (true) {
            if (objs.find(x => {
                    return x["id"] != uid
                }) == undefined) {
                uid = (Math.floor(Math.random() * 9999) + 1).toPrecision(4).replace(".", "");
            } else {
                break;
            }
        }

        idElem.innerText = "#" + uid;
    }, 100);
}

// window.onload = () => {
// }

window.addEventListener("message", (event) => {
    try {
        event.data.startsWith("");
    } catch (error) {
        return;
    }
    if (event.data.startsWith("pcode")) {
        SEC = event.data.split("pcode")[1];
        add("0000", "Example Note!", "<b>This</b> is an <i>example</i> note! Press Ctrl+I to italicized highlited text, Ctrl+B to make highlighted text bold and Ctrl+U to underline highlighted text");
        setUID();
    } else {
        // console.log(event.data)
        rite = objs.find(x => {
            return x.id == event.data
        });
        textbox.innerHTML = decrypt(rite["text"], SEC);
        title.value = decrypt(rite["title"], SEC);
        idElem.innerText = "#" + rite["id"];
    }
});

textbox.onkeydown = () => {
    if (textbox.textContent != "Enter some text...") {
        add(uid, title.value, textbox.innerHTML);
    }
}

function encrypt(text, secret) {
    return enc(lzw_encode(btoa(text)), secret) + "|" + checksum(lzw_encode(btoa(text)));
}

function decrypt(text, SECRET) {
    split = text.split("|");
    chsum = split[1];
    encoded = split[0];
    if (checksum(dec(encoded, SECRET)) != chsum) {
        throw new TypeError("Incorrect Password Attempt")
    } else if (checksum(dec(encoded, SECRET)) === chsum) {
        try {
            return atob(lzw_decode(dec(encoded, SECRET)))
        } catch (error) {
            throw new TypeError("Incorrect Password Attempt")
        }
    } else {
        throw new TypeError("Incorrect Password Attempt")
    }
}