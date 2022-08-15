const info = document.querySelectorAll(".info");
const sortButt = document.querySelectorAll(".sortButt");
let state = 0;//0 = down 1 = up
for(let i=0;i<info.length;i++){
    info[i].addEventListener("click",(e)=>{
        if(state==0){
            sortButt[i].innerHTML = "&#9653;";
            state = 1;
        }else if(state==1){
            sortButt[i].innerHTML = "&#9663;";
            state = 0;
        }
    })
}