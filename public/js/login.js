// //initialization and connection to DOM Elements
var down = document.getElementsByClassName("dropdown")[0];
var dropdwnChoice = document.getElementsByClassName("drpdwn-choices")[0];
var isDropOpen = false;
var choiceVal = document.getElementsByClassName("choice-val");
var drpdwnVal = document.getElementById("drpdwn-value")


document.querySelector(".back-button").addEventListener("mouseover",()=>{
    document.querySelector(".back-button").classList.add("shake")
    document.querySelector(".back-button").classList.remove("gelatine")
})


document.querySelector(".back-button").addEventListener("mouseout",()=>{
    document.querySelector(".back-button").classList.add("gelatine")
    document.querySelector(".back-button").classList.remove("shake")
})