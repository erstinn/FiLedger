const usersList = document.getElementById("userList");
const documentList = document.getElementById("documentList");
const ViewModal = document.querySelector(".switchViewModal")
const viewModes = document.querySelectorAll(".viewsMode");
const searchBar = document.getElementById("searchUserList");
const exitModal = document.querySelector(".exitModal");
const modal = document.querySelector(".detailsModal-wrapper")
const modalData = document.querySelectorAll(".modalTable .data")
const accessButtons = document.querySelectorAll(".accessButtons .modalButton")
const nameUser = document.querySelector(".name-user");
const departmentUser = document.querySelector(".department-user");
const tableTitle = document.querySelector(".userList-header");

const users = [
    {
        name:"Mark",
        department:"CS",
        document:1
    },
    {
        name:"Dav",
        department:"CS",
        document:999
    },
    {
        name:"Thor",
        department:"MMA",
        document:0
    },
    {
        name:"Berbaderg",
        department:"MMA",
        document:1200
    },
    {
        name:"TamTam",
        department:"Engineering",
        document:10000
    },
]

const documents = [
    {
        title:"Document 1",
        numUser:5
    },
    {
        title:"Document 2",
        numUser:9
    },
    {
        title:"Document 3",
        numUser:10
    }
]


let currentActive = 0; //0= people 1=docs

// buttonLogo.addEventListener("click",()=>{
//     ViewModal.classList.toggle("inactive");
// });

window.addEventListener("click",(e)=>{
    if(e.target == modal){
        modal.classList.add("inactive");

        const activeData = document.querySelector(".clicked-data")
        modal.classList.add("inactive")
        document.querySelector("body").style.overflowY = "auto"
    
        if(activeData!=undefined){
            activeData.classList.remove("clicked-data")
        }
    
        accessButtons.forEach(button=>{
            button.disabled = true;
        })
    }
})

viewModes[0].addEventListener("click",()=>{
    documentList.classList.add("inactive")
    usersList.classList.remove("inactive")
    document.querySelector(".modalTable.tableDoc").classList.add("inactive")
    document.querySelector(".modalTable.tableUser").classList.remove("inactive")
    viewModes[0].classList.add("inactive")
    viewModes[1].classList.remove("inactive")
    tableTitle.textContent = "List of Users";

    currentActive = 0;
    searchBar.placeholder = "Search Username...";
})
viewModes[1].addEventListener("click",()=>{
    usersList.classList.add("inactive")
    documentList.classList.remove("inactive")
    document.querySelector(".modalTable.tableDoc").classList.remove("inactive")
    document.querySelector(".modalTable.tableUser").classList.add("inactive")
    viewModes[1].classList.add("inactive")
    viewModes[0].classList.remove("inactive")
    tableTitle.textContent = "List of Documents";
    currentActive = 1;
    searchBar.placeholder = "Search Document";
})


//GENERATE TABLES FUNCTIONS
function generateUsersTable(item){
    let newData = document.createElement("tr")
    newData.classList.add("userData");
    let newUserName = document.createElement("td")
    newUserName.classList.add("userName");
    newUserName.innerHTML = item.name;
    let newDept = document.createElement("td")
    newDept.classList.add("userDept");
    newDept.innerHTML = item.department;
    let newNumDocs = document.createElement("td")
    newNumDocs.classList.add("numDocs");
    newNumDocs.innerHTML = item.document;
    let newKebab = document.createElement("td")
    newKebab.classList.add("kebeb")
    newKebab.innerHTML =    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                                                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                                        </svg>`

    newData.appendChild(newUserName);
    newData.appendChild(newDept);
    newData.appendChild(newNumDocs);
    newData.appendChild(newKebab)
    usersList.appendChild(newData)

    newData.addEventListener("click",()=>{
        modal.classList.remove("inactive")
        document.querySelector("body").style.overflowY = "hidden"
        scrollTo(0,0)
        nameUser.textContent = item.name
        departmentUser.textContent = item.department
    })

}
function generateDocsTable(item){
    let newData = document.createElement("tr");
    newData.classList.add('docData');
    
    let newTitle = document.createElement("td");
    newTitle.classList.add("docTitle");
    newTitle.innerHTML = item.title

    let newNumUsers = document.createElement("td");
    newNumUsers.classList.add("numUser");
    newNumUsers.innerHTML = item.numUser;

    let newKebab = document.createElement("td")
    newKebab.classList.add("kebab");
    newKebab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>`

    newData.appendChild(newTitle);
    newData.appendChild(newNumUsers);
    newData.appendChild(newKebab);

    documentList.appendChild(newData);


    newData.addEventListener("click",()=>{
        modal.classList.remove("inactive")
        document.querySelector("body").style.overflowY = "hidden"
        scrollTo(0,0)
        nameUser.textContent = item.title
        departmentUser.textContent = `User associated with ${item.title}`

    })
}

users.forEach(generateUsersTable)
documents.forEach(generateDocsTable)


//SEARCH FUNCTION


searchBar.addEventListener("keyup",(e)=>{
    clearTable()
    let matchedObject = [];

    if(currentActive==0){
        users.forEach(item=>{
            if(item.name.toUpperCase().includes(searchBar.value.toUpperCase())){
                matchedObject.push(item)
            }
        })
    
        matchedObject.forEach(generateUsersTable)
    }

    else{
        documents.forEach(item=>{
            if(item.title.toUpperCase().includes(searchBar.value.toUpperCase())){
                matchedObject.push(item)
            }
        })
    
        matchedObject.forEach(generateDocsTable)
    }
})

function clearTable(){
    
    if(currentActive == 0){
        data = document.querySelectorAll(".userData");
        data.forEach(item=>{
            usersList.removeChild(item)
        })
    }else{
        data = document.querySelectorAll(".docData");
        data.forEach(item=>{
            documentList.removeChild(item)
        })
    }
    
    
}

exitModal.addEventListener("click",()=>{
    const activeData = document.querySelector(".clicked-data")
    modal.classList.add("inactive")
    document.querySelector("body").style.overflowY = "auto"

    if(activeData!=undefined){
        activeData.classList.remove("clicked-data")
    }

    accessButtons.forEach(button=>{
        button.disabled = true;
    })

})

modalData.forEach((item,index)=>{
    item.addEventListener("click",()=>{
        const activeData = document.querySelector(".clicked-data")
        if(activeData!=undefined){
            activeData.classList.remove("clicked-data")
        }
        item.classList.add("clicked-data")


        accessButtons.forEach(button=>{
            button.disabled = false;
        })

    })
})



