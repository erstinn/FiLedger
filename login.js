//initialization and connection to DOM Elements
var down = document.getElementsByClassName("dropdown")[0];
var dropdwnChoice = document.getElementsByClassName("drpdwn-choices")[0];
var isDropOpen = false;
var choiceVal = document.getElementsByClassName("choice-val");
var drpdwnVal = document.getElementById("drpdwn-value")

//clicking dropdown element reveals all choices
down.addEventListener("click",()=>{
    if(isDropOpen){
        dropdwnChoice.style.height = "0";
        isDropOpen = false;
    }
    else{
        dropdwnChoice.style.height = "7em";
        isDropOpen = true;
    }
});

//clicking anywhere besides dropdown collapses dropdown
window.addEventListener("click",(event)=>{
    if(event.target != down){
        dropdwnChoice.style.height = "0";
        isDropOpen = false;
    }
});

//changes selected value
for(let i=0;i<choiceVal.length;i++){
    choiceVal[i].addEventListener("click",()=>{
        drpdwnVal.textContent = choiceVal[i].innerHTML;
    });
}