const uploadPlus = document.querySelector(".upload-plus")
const uploadModal = document.querySelector(".upload-modal-cont")

uploadPlus.addEventListener("click",(e)=>{
    uploadModal.classList.add("active-modal")

    console.log(e.target)
})
window.addEventListener("load",()=>{
    uploadModal.style.top = window.scrollY + uploadPlus.getBoundingClientRect().top-uploadModal.offsetHeight/3 + "px"// Y
    uploadModal.style.left = window.scrollX + uploadPlus.getBoundingClientRect().left-uploadModal.offsetWidth + "px"// X
})
window.addEventListener("click",(e)=>{
    if(e.target.classList[0]!="upload-plus"){
        uploadModal.classList.remove("active-modal")

    }
})