var stat = {
    accepted:{
        status:"Accepted",
        color:"#2ECC71"
    },
    pending:{
        status:"Pending",
        color:"#EBB840"
    },
    progress:{
        status:"In Progress",
        color:"#FF914D"
    },
    rejected:{
        status:"Rejected",
        color:"#F44336"
    }
}
var bgColors = document.getElementsByClassName("status-box");
var statText = document.getElementsByClassName("status");
var menuColors = document.getElementsByClassName("down");
var index;
var changeStatButton = document.getElementsByClassName("dropdown");
var popup = document.getElementsByClassName("popup");
var circle = document.getElementsByClassName("circle");
document.getElementById("close").addEventListener("click",()=>{
    popup[0].style.display = "none";
    document.getElementsByClassName("container")[0].style.opacity = "1"
});
for(let i=0;i<changeStatButton.length;i++){
    changeStatButton[i].addEventListener("click",()=>{
        index = i;
        popup[0].style.display = "block";
        document.getElementsByClassName("container")[0].style.opacity = "0.7"
    });
}

function loadCards(){
    bgColors[0].style.backgroundColor = stat.accepted.color;
    bgColors[1].style.backgroundColor = stat.pending.color;
    bgColors[2].style.backgroundColor = stat.progress.color;
    bgColors[3].style.backgroundColor = stat.rejected.color;
    bgColors[4].style.backgroundColor = stat.accepted.color;

    menuColors[0].style.fill = stat.accepted.color;
    menuColors[1].style.fill = stat.pending.color;
    menuColors[2].style.fill = stat.progress.color;
    menuColors[3].style.fill = stat.rejected.color;
    menuColors[4].style.fill = stat.accepted.color;

    statText[0].textContent = stat.accepted.status;
    statText[1].textContent = stat.pending.status;
    statText[2].textContent = stat.progress.status;
    statText[3].textContent = stat.rejected.status;
    statText[4].textContent = stat.accepted.status;

    circle[0].style.backgroundImage = "url('../images/accept.png')";
    circle[1].style.backgroundImage = "url('../images/pending.png')";
    circle[2].style.backgroundImage = "url('../images/progress.png')";
    circle[3].style.backgroundImage = "url('../images/reject.png')";
    circle[4].style.backgroundImage = "url('../images/accept.png')";
}
loadCards();


document.getElementById("accept").addEventListener('click',()=>{
    bgColors[index].style.backgroundColor = stat.accepted.color;
    menuColors[index].style.fill = stat.accepted.color;
    statText[index].textContent = stat.accepted.status;
    circle[index].style.backgroundImage = "url('../images/accept.png')";

    popup[0].style.display = "none";
    document.getElementsByClassName("container")[0].style.opacity = "1"

});

document.getElementById("pend").addEventListener('click',()=>{
    bgColors[index].style.backgroundColor = stat.pending.color;
    menuColors[index].style.fill = stat.pending.color;
    statText[index].textContent = stat.pending.status;
    circle[index].style.backgroundImage = "url('../images/pending.png')";

    popup[0].style.display = "none";
    document.getElementsByClassName("container")[0].style.opacity = "1"

});

document.getElementById("prog").addEventListener('click',()=>{
    bgColors[index].style.backgroundColor = stat.progress.color;
    menuColors[index].style.fill = stat.progress.color;
    statText[index].textContent = stat.progress.status;
    circle[index].style.backgroundImage = "url('../images/progress.png')";

    popup[0].style.display = "none";
    document.getElementsByClassName("container")[0].style.opacity = "1"

});

document.getElementById("reject").addEventListener('click',()=>{
    bgColors[index].style.backgroundColor = stat.rejected.color;
    menuColors[index].style.fill = stat.rejected.color;
    statText[index].textContent = stat.rejected.status;
    circle[index].style.backgroundImage = "url('../images/reject.png')";

    popup[0].style.display = "none";
    document.getElementsByClassName("container")[0].style.opacity = "1"

});






