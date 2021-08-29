let prevs = document.querySelector("#docprevs");
let SEC = "";

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

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getPass() {
    if (document.cookie.includes("passwd")) {
        SEC = getCookie("passwd");
        document.querySelector("#frame").contentWindow.postMessage("pcode" + SEC);
        return;
    }
    SEC = prompt("Please enter you password!");
    try {
        // console.log(SEC)
        if (objs.length <= 1) {
            document.querySelector("#frame").contentWindow.postMessage("pcode" + SEC);
            document.cookie = "passwd=" + SEC;
            return;
        }
        decrypt(objs[0]["text"], SEC);
    } catch (error) {
        // console.log(error)
        getPass();
    }
    document.querySelector("#frame").contentWindow.postMessage("pcode" + SEC);
    document.cookie = "passwd=" + SEC;
}

window.onload = () => {
    readAll()
    setTimeout(() => {
        getPass();
        // alert(objs[0]["title"])
        objs.forEach((i, j) => {
            c = document.createElement("div");
            c.onclick = () => {
                loadRite(i["id"])
            };
            c.className = "left__list__doc";
            c.innerHTML = `<div class="left__list__doc__title">
            ` + decrypt(i["title"], SEC).match(/.{1,25}(\s|$)/g)[0].replace(/^\s+|\s+$/g, '') + `...
        </div>
        <div class="left__list__doc__text">
        ` + decrypt(i["text"], SEC).match(/.{1,25}(\s|$)/g)[0].replace(/^\s+|\s+$/g, '') + `...
        </div>`;
            prevs.appendChild(c);
        });
    }, 100);
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