let indicators = document.querySelectorAll(".indicator");
let paragraphs = document.querySelectorAll(".par");
for(let i=0;i<indicators.length;i++){
    indicators[i].addEventListener('click',()=>{
        if(i==0){
            indicators[0].classList.add("active-ind");
            indicators[1].classList.remove("active-ind");
            indicators[2].classList.remove("active-ind");

            paragraphs[0].classList.add("active");
            paragraphs[1].classList.remove("active");
            paragraphs[2].classList.remove("active");
        }
        else if(i==1){
            indicators[0].classList.remove("active-ind");
            indicators[1].classList.add("active-ind");
            indicators[2].classList.remove("active-ind");

            paragraphs[0].classList.remove("active");
            paragraphs[1].classList.add("active");
            paragraphs[2].classList.remove("active");
        }
        else if(i==2){
            indicators[0].classList.remove("active-ind");
            indicators[1].classList.remove("active-ind");
            indicators[2].classList.add("active-ind");

            paragraphs[0].classList.remove("active");
            paragraphs[1].classList.remove("active");
            paragraphs[2].classList.add("active");
        }
    });
};

setInterval(()=>{
    if(indicators[0].classList.contains("active-ind")){
        indicators[1].classList.add("active-ind");
        indicators[0].classList.remove("active-ind");

        paragraphs[0].classList.remove("active");
        paragraphs[1].classList.add("active");
        paragraphs[2].classList.remove("active");
    }
    else if(indicators[1].classList.contains("active-ind")){
        indicators[2].classList.add("active-ind");
        indicators[1].classList.remove("active-ind");

        paragraphs[0].classList.remove("active");
        paragraphs[1].classList.remove("active");
        paragraphs[2].classList.add("active");
    }
    else if(indicators[2].classList.contains("active-ind")){
        indicators[0].classList.add("active-ind");
        indicators[2].classList.remove("active-ind");

        paragraphs[0].classList.add("active");
        paragraphs[1].classList.remove("active");
        paragraphs[2].classList.remove("active");
    
    }
},3000);

