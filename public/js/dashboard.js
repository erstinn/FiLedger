const tooltip = document.querySelector(".tooltip");
const addButton = document.querySelector(".addDocs")

window.addEventListener("load",()=>{
    tooltip.style.top = window.scrollY + (addButton.getBoundingClientRect().top-tooltip.offsetHeight)+"px";
    tooltip.style.left = window.scrollX + (addButton.getBoundingClientRect().right-addButton.offsetWidth-5)+"px";
})
setTimeout(()=>{
    tooltip.classList.add("inactive");
},3000)

addButton.addEventListener("mouseover",()=>{
    tooltip.classList.remove("inactive");

    setTimeout(()=>{
        tooltip.classList.add("inactive");
    },3000)
})




