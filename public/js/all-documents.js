function viewDoc(id){
    window.location =  `/view-documents/${id}`
}


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