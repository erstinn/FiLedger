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
            location.reload();
        }
    })
})
reject.forEach(e=>{
    e.addEventListener('click',async()=>{
        const response = await fetch('/api/rejectDocs',
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
            location.reload();
        }
    })
})