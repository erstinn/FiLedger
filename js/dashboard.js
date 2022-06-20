let container = document.getElementById("content-box");
let createCard = document.getElementById("create-card");
let ID = 0;
// create card
createCard.addEventListener("click",()=>{
    const newCard = document.createElement("div");
    const newDropdwn = document.createElement("select")
    const newID = document.createElement("h2");
    const status = ['Accepted','Pending','In Progress','Rejected','For Approval'];
    
    newID.innerText = `${++ID}`
    newID.classList.add("card-ID")
    newDropdwn.classList.add("card-drpdwn");
    newCard.classList.add("card");
    newCard.appendChild(newDropdwn);
    newCard.appendChild(newID);
    status.map(e=>{
        const newOption = document.createElement('option');
        newOption.classList.add('card-status');
        newOption.value = e;
        newOption.innerHTML = e;
        console.log(e);
        newDropdwn.appendChild(newOption);
    })
    container.appendChild(newCard);

    
});

// create card