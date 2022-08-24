const usersList = document.getElementById("userList");
const documentList = document.getElementById("documentList");
const buttonLogo = document.querySelector(".pageLogo");
const ViewModal = document.querySelector(".switchViewModal")
const viewModes = document.querySelectorAll(".viewsMode");
const searchBar = document.getElementById("searchUserList");

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

buttonLogo.addEventListener("click",()=>{
    ViewModal.classList.toggle("inactive");
});
viewModes[0].addEventListener("click",()=>{
    documentList.classList.add("inactive")
    usersList.classList.remove("inactive")
    currentActive = 0;
    searchBar.placeholder = "Search Username...";
    buttonLogo.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
                                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                            </svg>` 
})
viewModes[1].addEventListener("click",()=>{
    usersList.classList.add("inactive")
    documentList.classList.remove("inactive")
    currentActive = 1;
    searchBar.placeholder = "Search Document";
    buttonLogo.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-folder2-open" viewBox="0 0 16 16">
                                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14V3.5zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5V6zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7H1.633z"/>
                            </svg>` 
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





