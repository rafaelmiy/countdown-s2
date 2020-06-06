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
    
    var $clock = $('#countdown'),
        eventTime = moment(dating, 'YYYYMMDDHHmmss').unix(),
        currentTime = moment().unix(),
        diffTime = eventTime - currentTime,
        duration = moment.duration(diffTime * 1000, 'milliseconds'),
        interval = 1000;

    var j=0;
    // if time to countdown
    if(diffTime > 0) {

        setInterval(function(){

            duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
            var d = moment.duration(duration).days(),
                h = moment.duration(duration).hours(),
                m = moment.duration(duration).minutes(),
                s = moment.duration(duration).seconds();

            d = $.trim(d).length === 1 ? '0' + d : d;
            h = $.trim(h).length === 1 ? '0' + h : h;
            m = $.trim(m).length === 1 ? '0' + m : m;
            s = $.trim(s).length === 1 ? '0' + s : s;

            d = d.toString();
            h = h.toString();
            m = m.toString();
            s = s.toString();

            d1 = d.substring(0, 1);
            d2 = d.substring(1, 2);
            h1 = h.substring(0, 1);
            h2 = h.substring(1, 2);
            m1 = m.substring(0, 1);
            m2 = m.substring(1, 2);
            s1 = s.substring(0, 1);
            s2 = s.substring(1, 2);
            // console.log(d2);

            $('#d1').text(d1);
            $('#d2').text(d2);
            $('#h1').text(h1);
            $('#h2').text(h2);
            $('#m1').text(m1);
            $('#m2').text(m2);
            $('#s1').text(s1);
            $('#s2').text(s2);

            // FIXA O TAMANHO DO BOX DE MENSAGENS
            var topSize = window.screen.height-($('#clock').outerHeight()+$('#action-area').outerHeight())-$('#header').outerHeight()-parseInt($('#interactions').css("padding-top"))-parseInt($('#messages').css("padding-top"));
            $('#messages').css('max-height',topSize-70);

            j++;
            if(j>0){
                $('#content').removeClass('hide');
                $('#loading').addClass('hide');
            }
        }, interval);
        // var clockSize = $('#clock').outerHeight()+$('#action-area').outerHeight();
        
    }
    
    var firebaseMessages = firebase.database().ref('messages');
    firebaseMessages.on('value',function(messages){
        var messages = messages.val();
        if(messages == null){
            $('#messages').html('<center><p style="color:#f10935;font-weight:600;">Não existem mensagens aqui 🥺</p></center>')
        }
        else{
            $('#messages').html('');
        }

        for(var i in messages){
            var message = messages[i];

            var type = message.type;
            var date = message.date;
            var uid = message.uid;
            var like = message.like;
            var msg = message.message;
            var id = i;

            like = message.like == true ? " like" : "";
            
            var feelingPT = "";

            var since = moment(date, 'YYYYMMDDHHmmss').fromNow();

            if(type == "feeling"){
                if(msg == "kiss"){
                    feelingPT = "beijo 💋";
                }
                else if(msg == "heart"){
                    feelingPT = "carinho ❤️";
                }
                // console.log(feelingPT);
                if(uid == firebase.auth().currentUser.uid){
                    var status = "sent";
                    var statusPT = "enviou";
                    $('#messages').prepend('<span class="'+status+'"><p><b>'+since+'&nbsp;</b>Você '+statusPT+' um '+feelingPT+'</p></span>')
                }
                else{
                    var status = "received";
                    var statusPT = "recebeu";
                    $('#messages').prepend('<span class="'+status+'"><p>Você '+statusPT+' um '+feelingPT+'&nbsp;<b>'+since+'</b></p></span>')
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

        $(".received").dblclick(function(){
            var id = $(this).data("id");
            var like = $(this).hasClass("like") == true ? false : true;
            
            firebase.database().ref('messages/' + id).update({
                like: like
            });

        });

    });

    // var data = $('#page').html(); //get input (content)
    // TODO: ARRUMAR O CONVERSOR DE QUALQUER TEXTO PARA LINK
    // linkify(data); //run function on content


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

//EVITA O ZOOM
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});


// TODO: AGRUPAR MUITOS BEIJOS SEGUIDOS OU MUITOS CARINHOS SEGUIDOS
