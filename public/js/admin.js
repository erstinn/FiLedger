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
var selected_docID;

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
//gets users associated with a doc
async function getUsersOfDoc(){
    const response = await fetch("/api/getUsersOfDoc",{
        method:"POST",
        headers:{
            'Content-Type':'application/json',
            'access':"admin"
        },
        body:JSON.stringify({
            "documentId":`${selected_docID}`
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

            //TODO may remove:
            // removes all modal data when modal is exited
            document.querySelectorAll('.tableUserData').forEach(f=>{
                document.querySelector(".modalTable.tableUser").removeChild(f)
            })
            document.querySelectorAll('.tableDocData').forEach(f=>{
                document.querySelector(".modalTable.tableDoc").removeChild(f)
            })//clears table when modal is exited
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
        document.querySelector(".modal-deleteButton").innerHTML= 'Delete Account'
        document.querySelectorAll(".accessButtons .modalButton").forEach(e=>{
            e.style.visibility = "visible";
        })//hides buttons that are not needed
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
        document.querySelector(".modal-deleteButton").innerHTML= 'Delete Document'
        document.querySelectorAll(".accessButtons .modalButton").forEach(e=>{
            e.style.visibility = "hidden";
        })
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
                userDocName.classList.add(e['documentId'])
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


        newData.addEventListener("click",async()=>{
            modal.classList.remove("inactive")
            document.querySelector("body").style.overflowY = "hidden"
            scrollTo(0,0)
            nameUser.textContent = item.name
            departmentUser.textContent = `User associated with ${item.name}`
            selected_docID = item._id //displays users associate to docs in DOM
            const usersOfDoc = await getUsersOfDoc()
            console.log(usersOfDoc)
            usersOfDoc.forEach(e=>{
                const docUser = document.createElement("tr");
                docUser.classList.add("tableDocData")
                const userOfDoc = document.createElement("td")
                userOfDoc.innerHTML = e.username;
                const accessOfUser = document.createElement("td")
                accessOfUser.innerHTML = e.access;

                docUser.appendChild(userOfDoc)
                docUser.appendChild(accessOfUser)
                document.querySelector(".modalTable.tableDoc").appendChild(docUser)


            })

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
        //added docId to documents in users to make sure selected data is unique
        let doc4userName = doc4user.value.split("++")[0];
        let doc4userId = doc4user.value.split("++")[1];
        await fetch('/api/insert-docs',{
            method:"PUT",
            body:JSON.stringify({
                "document":`${doc4userName}`,
                "access":`${accessUser.value}`,
                "userId":`${selected_userID}`,
                "documentId":`${doc4userId}`
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
        let oldAccess = document.querySelector(".clicked-data").cells[1].firstChild.data;
        let documentId = document.querySelector(".clicked-data").cells[0].classList[0];
        console.log(documentId)
        const response = await fetch('/api/delDocOfUser',{
            method:"POST",
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                "document":`${selectedDocName}`,
                "userId":`${selected_userID}`,
                "documentId":`${documentId}`,
                "access":`${oldAccess}`
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
        let documentId = document.querySelector(".clicked-data").cells[0].classList[0];
        let oldAccess = document.querySelector(".clicked-data").cells[1].firstChild.data;
        document.querySelector('.clicked-data').cells[1].innerHTML = `<select id='newAccess' onchange="onChangeAccess('${documentId}','${oldAccess}')"><option selected hidden disabled>New Access</option><option value='viewer'>Viewer</option><option value='editor'>Editor</option><option value='approver'>Approver</option></select>`
    })

    //deletes users and documents
    let deleteButton = document.querySelector(".modal-deleteButton");
    deleteButton.addEventListener("click",async()=>{
        if(currentActive==1){
            const response = await fetch('/api/deleteDoc',{
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    "document":`${selected_docID}`
                })
            })
            let resp = response.text()
            if(resp){
                alert("Deleted Successfully");
                location.reload()
            }
            else{
                alert("Deletion Failed");
                location.reload()
            }
        }
        else if(currentActive==0){
            const response = await fetch('/api/deleteUser',{
                method:"POST",
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    "userId":`${selected_userID}`
                })
            })
            let resp = response.text()
            if(resp){
                alert("Deleted Successfully");
                location.reload()
            }
            else{
                alert("Deletion Failed");
                location.reload()
            }
        }
    })

}
main()
async function onChangeAccess(documentId,oldAccess){
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
            "documentId":`${documentId}`,
            "oldAccess":`${oldAccess}`
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
