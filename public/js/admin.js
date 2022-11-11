const usersList = document.getElementById("userList");
const documentList = document.getElementById("documentList");
const ViewModal = document.querySelector(".switchViewModal")
const viewModes = document.querySelectorAll(".viewsMode");
const searchBar = document.getElementById("searchUserList");
const exitModal = document.querySelector(".exitModal");
const modal = document.querySelector(".detailsModal-wrapper")
const accessButtons = document.querySelectorAll(".accessButtons .modalButton")
const nameUser = document.querySelector(".name-user");
const departmentUser = document.querySelector(".department-user");
const tableTitle = document.querySelector(".userList-header");
var selected_userID;

async function getUsers(){
    const response = await fetch('/api/users',{method:"POST",headers:{'access':'admin'}})
    let users = await response.json()
    users = JSON.stringify(users);
    users = JSON.parse(users);
    return users;
}
async function getDocs(){
    const response = await fetch('/api/docs',{method:"POST",headers:{'access':'admin'}})
    let docs = await response.json()
    docs = JSON.stringify(docs);
    docs = JSON.parse(docs);
    return docs;
}
async function getDocsOfUser(){
    const response = await fetch("/api/getDocsOfUser",{
        method:"POST",
        headers:{
            'Content-Type':'application/json',
            'access':"admin"
        },
        body:JSON.stringify({
            "userId":`${selected_userID}`
        })
    })

    let data = await response.json()
    data = JSON.stringify(data)
    data = JSON.parse(data)
    return data
}

async function main(){
    let users = await getUsers();
    let documents = await getDocs();
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
            //TODO may remove:
            // removes all modal data when modal is exited
            document.querySelectorAll('.tableUserData').forEach(f=>{
                document.querySelector(".modalTable.tableUser").removeChild(f)
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
        newUserName.innerHTML = `${item.firstname} ${item.lastname}`;
        let newDept = document.createElement("td")
        newDept.classList.add("userDept");
        newDept.innerHTML = item.department;
        let newNumDocs = document.createElement("td")
        newNumDocs.classList.add("numDocs");
        newNumDocs.innerHTML = 100;

        newData.appendChild(newUserName);
        newData.appendChild(newDept);
        newData.appendChild(newNumDocs);
        usersList.appendChild(newData)

        newData.addEventListener("click",async()=>{
            modal.classList.remove("inactive")
            document.querySelector("body").style.overflowY = "hidden"
            scrollTo(0,0)
            nameUser.textContent = `${item.firstname} ${item.lastname}`
            departmentUser.textContent = item.department
            selected_userID = item._id
            const docsOfUser = await getDocsOfUser()
            docsOfUser.forEach(e=>{
                let userDoc = document.createElement("tr");
                userDoc.classList.add("tableUserData");
                let userDocName = document.createElement("td")
                userDocName.innerHTML = e['document']
                let userDocAccess = document.createElement("td")
                userDocAccess.innerHTML = e['access']
                //todo may remove
                let userDept = document.createElement("td")
                userDept.innerHTML = item['department']
                //end

                userDoc.appendChild(userDocName)
                userDoc.appendChild(userDocAccess)
                userDoc.appendChild(userDept) //todo may remove

                document.querySelector(".modalTable.tableUser").appendChild(userDoc)

                userDoc.addEventListener("click",()=>{
                    const activeData = document.querySelector(".clicked-data")
                    if(activeData!=undefined){
                        activeData.classList.remove("clicked-data")
                    }
                    userDoc.classList.add("clicked-data")


                    accessButtons.forEach(button=>{
                        button.disabled = false;
                    })

                })

            })
        })

    }
    function generateDocsTable(item){
        let newData = document.createElement("tr");
        newData.classList.add('docData');
        let newTitle = document.createElement("td");
        newTitle.classList.add("docTitle");
        newTitle.innerHTML = item.name
        let newDocType = document.createElement("td");
        newDocType.classList.add("docType");
        newDocType.innerHTML = item.category;
        let newNumApp = document.createElement("td");
        newNumApp.classList.add("numApp");
        newNumApp.innerHTML = Math.floor(Math.random()*10);
        let newNumUsers = document.createElement("td");
        newNumUsers.classList.add("numUser");
        newNumUsers.innerHTML = Math.floor(Math.random()*10);


        newData.appendChild(newTitle);
        newData.appendChild(newDocType)
        newData.appendChild(newNumApp)
        newData.appendChild(newNumUsers);

        documentList.appendChild(newData);


        newData.addEventListener("click",()=>{
            modal.classList.remove("inactive")
            document.querySelector("body").style.overflowY = "hidden"
            scrollTo(0,0)
            nameUser.textContent = item.name
            departmentUser.textContent = `User associated with ${item.name}`

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
                if(`${item.firstname.toUpperCase()} ${item.lastname.toUpperCase()}`.includes(searchBar.value.toUpperCase())){
                    matchedObject.push(item)
                }
            })

            matchedObject.forEach(generateUsersTable)
        }

        else{
            documents.forEach(item=>{
                if(item.name.toUpperCase().includes(searchBar.value.toUpperCase())){
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

        //todo may remove
        document.querySelectorAll('.data').forEach(e=>{
            document.querySelector(".modalTable.tableUser").removeChild(e)
        })
//end of may remove
    })

    let doc4user = document.querySelector("#doc4user");
    let accessUser = document.querySelector("#accessUser");
    let addDoc = document.getElementsByClassName("addDoc")[0];

    addDoc.addEventListener("click",async ()=>{
        console.log(doc4user.value)
        console.log(accessUser.value)
        await fetch('/api/insert-docs',{
            method:"PUT",
            body:JSON.stringify({
                "document":`${doc4user.value}`,
                "access":`${accessUser.value}`,
                "userId":`${selected_userID}`
            }),
            headers:{
                'Content-Type':'application/json'
            }
        })

        window.location.reload()
    })

    let revAccess = document.querySelector(".modal-revokeButton");
    revAccess.addEventListener('click',async()=>{
        let selectedDocName = document.querySelector('.clicked-data').firstChild.firstChild.data
        const response = await fetch('/api/delDocOfUser',{
            method:"POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                "document":`${selectedDocName}`,
                "userId":`${selected_userID}`,
            })
        })
        let resp = response.text()
        if(resp){
            alert("Access Revoked Successfully");
            location.reload()
        }
        else{
            alert("Access Revoked Failed");
            location.reload()
        }
    })


    let changeAccess = document.querySelector('.modal-changeButton');
    changeAccess.addEventListener('click',()=>{
        document.querySelector('.clicked-data').cells[1].innerHTML = `<select id='newAccess' onchange="onChangeAccess()"><option selected hidden disabled>New Access</option><option value='viewer'>Viewer</option><option value='editor'>Editor</option><option value='approver'>Approver</option></select>`
    })

}
main()
async function onChangeAccess(){
    let selectedDocName = document.querySelector('.clicked-data').firstChild.firstChild.data
    let newAccess = document.getElementById('newAccess').value

    const response = await fetch('/api/changeAccess',{
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            "document":`${selectedDocName}`,
            "userId":`${selected_userID}`,
            "newAccess":`${newAccess}`,
        })
    })
    let resp = response.text()
    if(resp){
        alert("Access Changed Successfully");
        location.reload()
    }
    else{
        alert("Access Changed Failed");
        location.reload()
    }
}

// }
// main()
