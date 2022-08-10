let results = document.getElementById("search-results");
let triggers = document.querySelectorAll(".search-comp");
let resultItems = document.querySelectorAll(".result");
let searchBar = document.getElementById("search");
triggers.forEach((e)=>{
    e.addEventListener("click",()=>{
        results.classList.toggle("hidden-results");
    });
});

window.addEventListener("click",e=>{
    if(e.target!=triggers[0]){
        results.classList.add("hidden-results");
    }    
});

resultItems.forEach(el=>{
    el.addEventListener('click',e=>{
        searchBar.value = el.textContent;
    });
});


