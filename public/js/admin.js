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

    try{
        let data = await response.json()
        data = JSON.stringify(data)
        data = JSON.parse(data)
        return data
    }catch(err){
        console.log(err)
    }
   
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
            document.querySelectorAll('.tableUser .data').forEach(e=>{
                document.querySelector(".modalTable.tableUser tbody").removeChild(e)
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
                userDoc.classList.add("data");
                let userDocName = document.createElement("td")
                userDocName.innerHTML = e['document'].substring(0,30)+"..."
                let userDocAccess = document.createElement("td")
                userDocAccess.innerHTML = e['access']

                userDoc.appendChild(userDocName)
                userDoc.appendChild(userDocAccess)

                document.querySelector(".modalTable.tableUser tbody").insertBefore(userDoc,document.querySelector(".modalTable.tableUser tbody").children[1])
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
        document.querySelectorAll('.tableUser .data').forEach(e=>{
            document.querySelector(".modalTable.tableUser tbody").removeChild(e)
        })
//end of may remove
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
                'Content-Type':'application/json',
                'access':'admin'
            }
        })

        window.location.reload()
    })
    

    const addRowDoc = document.querySelector(".addRowDoc")
    const show = document.querySelectorAll('.addRowDoc svg')[0]
    const hide = document.querySelectorAll('.addRowDoc svg')[1]
    const searchRes = document.querySelector(".search-results")

    addRowDoc.addEventListener('click',()=>{
        if(show.classList.contains("inactive")){
            show.classList.remove("inactive")
            hide.classList.add("inactive")

            doc4user.classList.add("inactive")
            accessUser.classList.add("inactive")
            searchRes.classList.add("inactive")
           
        }else{
            show.classList.add("inactive")
            hide.classList.remove("inactive")

            doc4user.classList.remove("inactive")
            accessUser.classList.remove("inactive")
            searchRes.classList.remove("inactive")

        }
    
    })

    documents.forEach(e=>{
        const docTitle = document.createElement("li");
        docTitle.classList.add("searchDocs")
        docTitle.innerHTML = e.name;
        document.querySelector(".search-results ul").appendChild(docTitle)
    })

    document.querySelectorAll(".searchDocs").forEach(e=>{
        e.addEventListener('click',()=>{
            doc4user.value = e.innerHTML
        })
    })

    
}
main()

// }
// main()
