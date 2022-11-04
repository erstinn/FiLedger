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
        newTitle.innerHTML = item.name
        let newDocType = document.createElement("td");
        newDocType.classList.add("docType");
        newDocType.innerHTML = item.category;
        let newNumUsers = document.createElement("td");
        newNumUsers.classList.add("numUser");
        newNumUsers.innerHTML = 100;


        newData.appendChild(newTitle);
        newData.appendChild(newDocType)
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
                if(item.firstname.toUpperCase().includes(searchBar.value.toUpperCase())){
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


    let doc4user = document.querySelector("#doc4user");
    let accessUser = document.querySelector("#accessUser");
    let addDoc = document.querySelector(".addDoc");

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


}
main()

// }
// main()
