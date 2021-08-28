function drop() {
    document.querySelector(".left__toolbar1").classList.toggle("show");
}

function drop1() {
    document.querySelector(".left__toolbar2").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (e) {
    if (!e.target.matches('#drop')) {
        var myDropdown = document.getElementById(".left__toolbar2");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
        var myDropdown = document.getElementById(".left__toolbar1");
        if (myDropdown.classList.contains('show')) {
            myDropdown.classList.remove('show');
        }
    }
}