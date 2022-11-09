const accept = document.querySelectorAll(".accept");
const reject = document.querySelectorAll(".reject")

accept.forEach(e=>{
    e.addEventListener('click',async()=>{
        const response = await fetch('/api/acceptDocs',
        {
            method:"POST",
            headers:{'Content-Type':'application/json','access':'admin'},
            body:JSON.stringify({
                "docId":`${e.classList[1]}`
            })
        })
        let resp = await response.text()
        if(resp){
            alert("Document was moved to the Accepted Page")
            location.reload()
        }
    })
})
reject.forEach(e=>{
    e.addEventListener('click',async()=>{
        const response = await fetch('/api/rejectDocs', //TODO this connects to api.js
        {
            method:"POST",
            headers:{'Content-Type':'application/json','access':'admin'},
            body:JSON.stringify({
                "docId":`${e.classList[1]}`
            })
        })
        let resp = await response.text()
        if(resp){
            alert("Document was moved to the Rejected Page")
            location.reload()
        }
    })
})
var title;
function setTitle(name){
    title = name
}

var tooltip = document.createElement("span")
tooltip.classList.add("tooltip")
tooltip.style.position = "absolute"
tooltip.style.padding = "5px"
tooltip.style.color = "#aaa"
const docname = document.querySelectorAll('.docname')
document.body.appendChild(tooltip)
var timeout;
docname.forEach(e=>{
    e.addEventListener("mouseenter",()=>{
        timeout = setTimeout(()=>{
            tooltip.style.top = window.scrollY + e.getBoundingClientRect().top + (e.offsetHeight/2) + "px";
            tooltip.style.left = window.scrollX + e.getBoundingClientRect().right - (e.offsetWidth/2) + "px";
            tooltip.innerHTML = title;
            tooltip.style.backgroundColor = "#fff"

            setTimeout(()=>{
                tooltip.innerHTML = "";
                tooltip.style.backgroundColor = "transparent"
            },8000)
        },500)
    })
})

docname.forEach(e=>{
    e.addEventListener("mouseleave",()=>{
        clearTimeout(timeout)
        tooltip.innerHTML = "";
        tooltip.style.backgroundColor = "transparent"
    })
})

const query = new URLSearchParams(window.location.search)
const opt = document.querySelectorAll(".opt")
if(query.get("sort")=="title"){
    opt[0].selected = true
}
else if(query.get("sort")=="date"){
    opt[1].selected = true
}
else if(query.get("sort")=="size"){
    opt[2].selected = true
}
else if(query.get("sort")=="type"){
    opt[3].selected = true
}
else if(query.get("sort")=="author"){
    opt[4].selected = true
}