function createHeart(){
    if($('#ekg-area[bonus-rainning=off]').length == 1){
        return
    }
    const heart = document.createElement('div');
    heart.classList.add('rainningheart');

    heart.style.left = Math.random() *100 + "vw";

    heart.style.animationDuration = Math.random() * 2+3+"s";

    heart.innerText = "❤︎";

    document.body.appendChild(heart);

    setTimeout(()=>{
        heart.remove();
    },1700);

}
