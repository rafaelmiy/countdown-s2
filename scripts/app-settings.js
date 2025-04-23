
// Script para pegar as configurações do usuário logado
firebase.database().ref('users').on('value',function(u){
    var userSettings = u.val()[firebase.auth().currentUser.uid];

    var userTema = userSettings.tema;
    var userFundo = userSettings.fundo;
    var userContador = userSettings.contador;

    $('#settings div .radio-option').removeClass("on");

    $('#settings .tema div:nth-child('+userTema+') .radio-option').addClass("on");
    $('#settings .fundo div:nth-child('+userFundo+') .radio-option').addClass("on");
    $('#settings .contador div:nth-child('+userContador+') .radio-option').addClass("on");

    // Condição para quando Tema estiver no automático
    if(userTema == 3){
        // Das 19h-5h é dark mode
        if(moment().format('HH') < 19 && moment().format('HH') > 5){
            $('body').attr('tema','1');
        }else{
            $('body').attr('tema','2');
        }
        $('body').attr('data-tema', userTema);
    }
    else{
        $('body').attr('tema',userTema);
        $('body').attr('data-tema', userTema);
    }
    $('body').attr('fundo',userFundo);
    $('body').attr('contador',userContador);
});

// Loop infinito para verificar o tema (quando no automático) no intervalo de 5 segundos
function checkThemeHour(){
    if($('body[data-tema="3"]').length == 1){
        // Das 19h-5h é dark mode
        if(moment().format('HH') < 19 && moment().format('HH') > 5){
            $('body').attr('tema','1');
        }else{
            $('body').attr('tema','2');
        }
        // console.log("foi");
    }
    setTimeout(checkThemeHour, 5000);
}

checkThemeHour();

function setSettings(settings,value){
    var userId = firebase.auth().currentUser.uid;
    
    switch(settings){
        case "tema":
            firebase.database().ref('users/' + userId).update({
                tema: value
            });
            break; 

        case "fundo":
            firebase.database().ref('users/' + userId).update({
                fundo: value
            });
            break;

        case "contador":
            firebase.database().ref('users/' + userId).update({
                contador: value
            });
            break;
    }
    
}

// function create(){
//     firebase.database().ref('travels/teste').update({
//         test: "aaa"
//     });
// }