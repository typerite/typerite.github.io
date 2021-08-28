let textbox = document.querySelector("#text");
let title = document.querySelector("#title");

let fontSize = 16

var isCtrl = false;
document.onkeyup=function(e){
    if(e.keyCode == 17) isCtrl=false;
}

document.onkeydown=function(e){
    if(e.keyCode == 17) isCtrl=true;
    // console.log(e.keyCode)
    if(e.keyCode == 83 && isCtrl == true) {//Ctrl+S
        download(title.value+".txt", textbox.innerText);
        return false;
    }
    if(e.keyCode == 219 && isCtrl == true) {//Ctrl+[
        fontSize--;
        textbox.style.fontSize = fontSize+"px";
        return false;
    }
    if(e.keyCode == 221 && isCtrl == true) { //Ctrl+]
        fontSize++;
        textbox.style.fontSize = fontSize+"px";
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