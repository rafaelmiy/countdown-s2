moment.locale('pt');

if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == true) {
    $('#warning').addClass('hide');
}
  

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

var u = $.urlParam('u');
var p = $.urlParam('p');

var firebaseConfig = {
    apiKey: "AIzaSyDvZAbjI6gS84HMyYxT_T0FXBNABzmUkfQ",
    authDomain: "countdown-s2.firebaseapp.com",
    databaseURL: "https://countdown-s2.firebaseio.com",
    projectId: "countdown-s2",
    storageBucket: "countdown-s2.appspot.com",
    messagingSenderId: "396589448036",
    appId: "1:396589448036:web:4ca6b28a453ffb6dcb5871"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var email = u+"@email.com";
var password = p;

firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
});
var firebaseDating = firebase.database().ref('dating');

var duration;

// FICA ESCUTANDO A DATA
firebaseDating.on('value',function(date){
    var dating = date.val();
    // var dating = date.dating;
    // console.log(dating);
    dating = moment(dating, 'YYYYMMDDHHmm').unix();

    // clear Flipdown
    $('#flipdown').empty();
    // Set up FlipDown
    var flipdown = new FlipDown(dating)

        // Start the countdown
        .start()

        // Do something when the countdown ends
        .ifEnded(() => {
            // console.log('The countdown has ended!');
            // $('#flipdown').addClass('hide');
            // $('#text').text("Quando vai ser o próximo encontro?");
        });


    var finished = 1;
    var hide = 0;
    // Verifica se regressiva está zerada
    for(var i = 0; i < $('.flipdown .rotor-group').length; i++){
        var a = i+1;
        for(var j = 0; j < $('.flipdown .rotor-group:nth-child('+a+') .rotor div:last-child').length; j++){
            hide = 0;
            if($('.flipdown .rotor-group:nth-child('+a+') .rotor div:last-child')[j].innerHTML > 0){
                finished = 0;
                hide = 0;
                break;
            }else{
                hide = 1;
            }
        }
        if(finished == 0){
            break;
        }else if(hide == 1){
            $('.flipdown .rotor-group:nth-child('+a+'):first-child').addClass('hide');
        }
    }
    if(finished == 1){
        $('#flipdown').addClass('hide');
        $('#text').text("Aproveitem cada segundinho juntos");
        // $('#text').text("Quando vai ser o próximo encontro?");
    }else{
        $('#flipdown').removeClass('hide');
        $('#text').text("para nos encontrar.");
    }

    var interval = 1000;
    setInterval(function(){
        // FIXA O TAMANHO DO BOX DE MENSAGENS
        var topSize = window.screen.height-($('#clock').outerHeight()+$('#action-area').outerHeight())-$('#header').outerHeight()-parseInt($('#interactions').css("padding-top"))-parseInt($('#messages').css("padding-top"));
        $('#messages').css('max-height',topSize-70);
        
    }, interval);

    


    // var data = $('#page').html(); //get input (content)
    // TODO: ARRUMAR O CONVERSOR DE QUALQUER TEXTO PARA LINK
    // linkify(data); //run function on content

});

var firebaseAddress = firebase.database().ref('address');

// FICA ESCUTANDO O ENDEREÇO
firebaseAddress.on('value',function(a){
    var address = a.val();

    // ATUALIZA O ENDEREÇO COM A INFORMAÇÃO DO BANCO
    $('#address').attr('href',address);
})


function checkLastSameAction(message, type){
    firebase.database().ref('messages').orderByKey().limitToLast(1).once('value', function(l) {
        var last = l.val();
        var lastObjectID = Object.keys(last);
        var lastObject = last[lastObjectID];
        
        var lastObjectType = lastObject.type;
        var lastObjectMessage = lastObject.message;
        var lastObjectUID = lastObject.uid;
        if(lastObject.count > 0){
            var lastObjectCount = lastObject.count;
        } else{
            var lastObjectCount = 1;
        }
        
        if(lastObjectType == type && lastObjectMessage == message && lastObjectUID == firebase.auth().currentUser.uid){
            firebase.database().ref('messages/' + lastObjectID).update({
                count: lastObjectCount+1
            });
        }else{
            sendMessage(type, message);
        }
    });
}


var firstLoad = 0;

var firebaseMessages = firebase.database().ref('messages').limitToLast(400);
firebaseMessages.on('value',function(messages){
    var messages = messages.val();

    if(firstLoad == 1){
        playSound('pop');
    }else firstLoad = 1;
    
    if(messages == null){
        $('#messages').html('<center><p style="color:#f10935;font-weight:600;">Não existem mensagens aqui 🥺</p></center>')
    }
    else{
        $('#messages').html('');
    }
    
    var messagesIDs = Object.keys(messages);
    // console.log(messagesIDs);

    for(var i=0; i<messagesIDs.length; i++){
        var message = messages[messagesIDs[i]];
        // console.log(i);
        var type = message.type;
        var date = message.date;
        var uid = message.uid;
        var like = message.like;
        var msg = message.message;
        var id = messagesIDs[i];

        like = message.like == true ? " like" : "";
        // console.log(like);
        var feelingPT = "";

        var since = moment(date, 'YYYYMMDDHHmmss').fromNow();

        if(type == "feeling"){
            if(msg == "kiss"){
                feelingPT = "beijo 💋";
                feelingsPT = "beijos 💋";
            }
            else if(msg == "heart"){
                feelingPT = "carinho ❤️";
                feelingsPT = "carinhos ❤️";
            }
            // console.log(feelingPT);
            if(uid == firebase.auth().currentUser.uid){
                var status = "sent";
                var statusPT = "enviou";
                if(message.count > 0){
                    var msgCount = message.count;
                } else var msgCount = 1;

                if(msgCount>1){
                    $('#messages').prepend('<span class="'+status+'"><p><b>'+since+'&nbsp;</b>Você '+statusPT+' <b class="qnt">'+msgCount+'</b> '+feelingsPT+'</p></span>');
                }
                else{
                    $('#messages').prepend('<span class="'+status+'"><p><b>'+since+'&nbsp;</b>Você '+statusPT+' um '+feelingPT+'</p></span>');
                }
            }
            else{
                var status = "received";
                var statusPT = "recebeu";

                for(var j=1, k=0, n=1; j>k && i+1<messagesIDs.length; j++){
                    var next = i+1;
                    if(messages[messagesIDs[next]].type == "feeling" && messages[messagesIDs[next]].message == msg && messages[messagesIDs[next]].uid != firebase.auth().currentUser.uid){
                        i++;
                        n++;
                    }
                    else j=k-1;
                }
                if(n>1){
                    $('#messages').prepend('<span class="'+status+'"><p>Você '+statusPT+' <b class="qnt">'+n+'</b> '+feelingsPT+'&nbsp;<b>'+since+'</b></p></span>');
                }
                else{
                    $('#messages').prepend('<span class="'+status+'"><p>Você '+statusPT+' um '+feelingPT+'&nbsp;<b>'+since+'</b></p></span>');
                }

                
            }
        }
        else if(type == "message"){
            if(uid == firebase.auth().currentUser.uid){
                var status = "sent";
            }
            else{
                var status = "received";
            }
            $('#messages').prepend('<span data-id="'+id+'" class="message '+status+''+like+'"><p>'+msg+'<b>'+since+'</b></p></span>');
        }
    }

    $('#content').removeClass('hide');
    $('#loading').addClass('hide');

    $(".received").dblclick(function(){
        var id = $(this).data("id");
        var like = $(this).hasClass("like") == true ? false : true;
        
        firebase.database().ref('messages/' + id).update({
            like: like
        });

    });
});

function sendMessage(type, message){
    var postsRef = firebase.database().ref().child('messages');
    var date = moment().format('YYYYMMDDHHmmss');

    postsRef.push().set({
        type: type,
        message: message,
        date: date,
        uid: firebase.auth().currentUser.uid
    });
    // $('#input').blur();
    $('#input').val('');
}


// FAZ QUALQUER LINK VIRAR LINK DENTRO DO ARQUIVO
function linkify(str) {
    var newStr = str.replace(/(<a href=")?((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)))(">(.*)<\/a>)?/gi, function () {
        return '<a href="' + arguments[2] + '" target="_blank">' + (arguments[7] || arguments[2]) + '</a>'
    });
    // $('.messages').html("");
    $('div').html(newStr); //fill output area
}

$(document).keypress(function(event) {
    // EVITA COLOCAR ESPAÇO COMO PRIMEIRO CARACTER
    if (event.keyCode == 32 & $('#input').val().length == 0){
        return false;
    }
    if(event.which == 13) {
        // alert('You pressed enter!');
        var message = $('#input').val();
        if($('#input').val().length >0){
            sendMessage("message", message);
        }
    }
});

// EVITA O ZOOM
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

function playSound(filename){
    var mp3Source = '<source src="sound/' + filename + '.mp3" type="audio/mpeg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + embedSource + '</audio>';
}
  