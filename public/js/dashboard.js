const addFile = document.querySelector(".addFile");
const uploadFileCont = document.querySelector(".uploadFile-cont");
const createCard = document.getElementById("create-card"); 
const uploadFileMainCont = document.querySelector(".uploadFile");
const statuses = ["Pending","Accepted","Rejected"]
addFile.addEventListener("click",()=>{
    const newFileUp = document.createElement("input");
    newFileUp.type = "file";
    newFileUp.classList.add("fileUpload");

    uploadFileCont.appendChild(newFileUp);
});

createCard.addEventListener('click',()=>{
    uploadFileMainCont.classList.toggle("inactive");
})

const folderModal = document.querySelector(".folderModal");
const folderFile = document.querySelectorAll(".folder-file")
const modalStatus = document.querySelector(".fileStatus-modal")
document.querySelector(".exitModal").addEventListener("click",()=>{
    folderModal.classList.add("inactive");
    document.querySelector("body").style.overflow = "auto"

});

for(let i=0;i<folderFile.length-1;i++){
    folderFile[i].addEventListener("click",()=>{
        modalStatus.textContent = `${statuses[i]} Documents`;
        folderModal.classList.remove("inactive");
        document.querySelector("body").style.overflow = "hidden"
    })
}


const kebab = document.querySelectorAll(".kebab")
const contextMenu = document.querySelector(".tableContextMenu")

kebab.forEach(item=>{
    item.addEventListener("click",(e)=>{
        contextMenu.classList.remove("active-context-menu");
        setTimeout(()=>{
        contextMenu.classList.add("active-context-menu");
        let x = window.scrollX + item.getBoundingClientRect().left // Y
        let y = window.scrollY + item.getBoundingClientRect().top // Y

        contextMenu.style.top = y + "px";
        contextMenu.style.left = x+35 + "px";
        },30)
        
    })
})

window.addEventListener("click",(e)=>{
        if( e.target.classList[0]!="kebabButt"){
            contextMenu.classList.remove("active-context-menu");
        }
})


