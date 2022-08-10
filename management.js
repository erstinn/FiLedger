let circles = document.querySelectorAll(".logos");
let svgs = document.querySelectorAll(".logos svg");

for(let i=0;i<circles.length;i++){
    circles[i].addEventListener('mouseenter',(e)=>{
        circles[i].style.backgroundColor = "#111827";
        svgs[i].style.fill = "#fff";
    });
    circles[i].addEventListener('mouseleave',(e)=>{
        circles[i].style.backgroundColor = "#fff";
        svgs[i].style.fill = "#111827";

    });
}