const uploadPlus = document.querySelector(".upload-plus")
const uploadModal = document.querySelector(".upload-modal-cont")

uploadPlus.addEventListener("click",(e)=>{
    uploadModal.style.top = window.scrollY + uploadPlus.getBoundingClientRect().top-uploadModal.offsetHeight  + "px"// Y
    uploadModal.style.left = window.scrollX + uploadPlus.getBoundingClientRect().left-(uploadModal.offsetWidth/2) + "px"// X
    uploadModal.classList.add("active-modal")

    console.log(e.target)
})
window.addEventListener("click",(e)=>{
    if(e.target.classList[0]!="upload-plus"){
        uploadModal.classList.remove("active-modal")

    }
})