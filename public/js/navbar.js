let burger = document.getElementById("burger-button")
burger.addEventListener("click",()=>{
    document.getElementById("side-nav").classList.remove("inactive-sidenav");
});

window.addEventListener("click",(event)=>{
    if(event.target != burger){
        document.getElementById("side-nav").classList.add("inactive-sidenav");
    }
});


//dropdowns
const usernameDrpdwn = document.querySelector(".username-drpdwn");
const username = document.querySelector(".username");
const dropdownArrow = document.querySelector(".dropdownArrow");
window.addEventListener("load",()=>{
    let x = window.scrollX + username.getBoundingClientRect().left-(username.offsetWidth/4) + "px";
    let y = window.scrollY + username.getBoundingClientRect().bottom+12 + "px";

    usernameDrpdwn.style.top = y;
    usernameDrpdwn.style.left = x;
})

dropdownArrow.addEventListener("click",()=>{
    usernameDrpdwn.classList.toggle("active-dropdown");
})
window.addEventListener("click",(e)=>{
    if(dropdownArrow == e.target){
      
    }
    else{
        usernameDrpdwn.classList.remove("active-dropdown");
        isDrpDwnOpen=false;
    }
})