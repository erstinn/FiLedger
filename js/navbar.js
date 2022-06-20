let burger = document.getElementById("burger-button")
burger.addEventListener("click",()=>{
    document.getElementById("side-nav").classList.remove("inactive-sidenav");
});

window.addEventListener("click",(event)=>{
    if(event.target != burger){
        document.getElementById("side-nav").classList.add("inactive-sidenav");
    }
});