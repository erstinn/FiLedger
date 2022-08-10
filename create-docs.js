let headerButtons = document.querySelectorAll(".buttons-header");
let nav = document.querySelectorAll(".navs");
 for(let i=0;i<nav.length;i++){
    headerButtons[i].addEventListener('click',()=>{
        nav[i].classList.toggle("off")
    });
 }