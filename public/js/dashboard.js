const tooltip = document.querySelector(".tooltip");
const addButton = document.querySelector(".addDocs")
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const tagsList = document.querySelector(".tag-list");
const tagInput = document.querySelector('.tag-input')
const tag = document.querySelectorAll(".tag")
const form = document.getElementById("uploadDoc")

const tagValue = document.getElementById("tagsValue")
tagValue.value = ""

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


addButton.addEventListener("click",()=>{
    modal.style.display = "block";
})
close.addEventListener("click",()=>{
    modal.style.display = "none";
})

tagInput.addEventListener("keyup",(e)=>{
    if(e.key==","){
        if(tagInput.value!=","){
            var newTag = document.createElement('li');
            newTag.classList.add("tag");
            newTag.innerHTML = tagInput.value.replace(",","");
            tagsList.appendChild(newTag)
            tagValue.value += tagInput.value
            tagInput.value = ""
        }
        


        newTag.addEventListener("dblclick",()=>{
            tagValue.value = tagValue.value.replace(newTag.innerHTML+",","")
            tagsList.removeChild(newTag);

        })
    }
})

const urlParams = new URLSearchParams(window.location.search);
window.addEventListener('load', function () {
    if(urlParams.has("fail")){
        if(urlParams.get('fail') == "false"){
            alert("Upload Successful!")
        }else{
            alert("Upload Unsuccessful :(")
        }
    }
})

const addFile = document.getElementById("addFile")
const uploadButton = document.querySelector(".button-container button")
uploadButton.disabled = true
addFile.addEventListener("change",(evt)=>{
    if(evt.target.files[0].size > 1073741824){
        alert("File too large")
        addFile.value = "";
    }else if(evt.target.files[0].size < 1073741824){
        uploadButton.disabled = false
    }
})