const tooltip = document.querySelector(".tooltip");
const addButton = document.querySelector(".addDocs")
const uploadModal = document.querySelector(".uploadModal");

window.addEventListener("load",()=>{
    uploadModal.style.top = window.scrollY + (addButton.getBoundingClientRect().top-5)+"px";
    uploadModal.style.left = window.scrollX + (addButton.getBoundingClientRect().right)+"px";
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

addButton.addEventListener("click",()=>{
    uploadModal.classList.remove("inactive");
})

window.addEventListener("click",(e)=>{
    if(e.target == addButton.children[0].children[0]){
        
    }
    else{
        uploadModal.classList.add("inactive");
    }
})



