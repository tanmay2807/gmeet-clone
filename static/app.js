const join = document.getElementsByClassName("join")[0];

document.getElementsByClassName("join-form")[0].style.display = "none";
document.getElementsByClassName("host-form")[0].style.display = "none";

join.addEventListener("click", (e)=>{
    join.parentElement.children[1].classList.toggle("display-no");
    join.parentElement.children[2].classList.toggle("display-no");
    
    if(document.getElementsByClassName("join-form")[0].style.display === "none"){
        document.getElementsByClassName("join-form")[0].style.display = "block";
    } 
    else {
        document.getElementsByClassName("join-form")[0].style.display = "none";
    } 
});

const host = document.getElementsByClassName("host")[0];

host.addEventListener("click", (e)=>{
    join.parentElement.children[0].classList.toggle("display-no");
    join.parentElement.children[2].classList.toggle("display-no");

    if(document.getElementsByClassName("host-form")[0].style.display === "none"){
        document.getElementsByClassName("host-form")[0].style.display = "block";
    } 
    else {
        document.getElementsByClassName("host-form")[0].style.display = "none";
    } 
});