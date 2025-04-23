moment.locale('pt');

if ( !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == true) {
    // $('#warning').addClass('hide');
    $('#action-area, #interactions').hide();
}
  

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}


function getLocalTime(){
    var currentdate = new Date(); 
    var datetime =  currentdate.getFullYear() + ""
                    + ("0" + (currentdate.getMonth() + 1)).slice(-2) + ""
                    + ("0" + currentdate.getDate()).slice(-2) + ""
                    + ("0" + currentdate.getHours()).slice(-2) + ""
                    + ("0" + currentdate.getMinutes()).slice(-2) + ""
                    + ("0" + currentdate.getSeconds()).slice(-2);
    // console.log(datetime);
    return datetime;
}

var u = $.urlParam('u');
var p = $.urlParam('p');

if (document.URL.startsWith("file://")){
    // SE FOR LOCAL MUDA PARA O BANCO DE DADOS DE HOMOLOG
    var databaseURL = "https://countdown-s2-homolog.firebaseio.com";
}else{
    // SE FOR PRODUÇÃO COLOCA O BANCO DE DADOS DE PRODUÇÃO
    var databaseURL = "https://countdown-s2.firebaseio.com";
}

var firebaseConfig = {
    apiKey: "AIzaSyDvZAbjI6gS84HMyYxT_T0FXBNABzmUkfQ",
    authDomain: "countdown-s2.firebaseapp.com",
    databaseURL: databaseURL,
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
    
    console.log('Erro código: '+errorCode);
    console.log('Erro: '+errorMessage);
});
var firebaseDating = firebase.database().ref('dating');

var duration;

// FICA ESCUTANDO A DATA
var firebaseDate = firebase.database().ref('dates').orderByKey().limitToLast(1);

firebaseDate.on('value',function(dates){
    var dates = dates.val();
    var lastDate = Object.keys(dates);
    lastDateID = lastDate[0];
    lastDate = dates[lastDateID].date;

    dating = moment(lastDate, 'YYYYMMDDHHmm').unix();
    /*
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
            // resizeMessageBox();
        }
    }
    if(finished == 1){
        $('#flipdown').addClass('hide');
        $('#text').text("Aproveitem cada segundinho juntos");
        // resizeMessageBox();
        // $('#text').text("Quando vai ser o próximo encontro?");
    }else{
        $('#flipdown').removeClass('hide');
        $('#text').text("para nos encontrar.");
        // resizeMessageBox();
    }
    */

    // var data = $('#page').html(); //get input (content)
    // TODO: ARRUMAR O CONVERSOR DE QUALQUER TEXTO PARA LINK
    // linkify(data); //run function on content

});


// function resizeMessageBox(){
//     // FIXA O TAMANHO DO BOX DE MENSAGENS
//     var topSize = window.screen.height-($('#clock').outerHeight()+$('#action-area').outerHeight())-$('#header').outerHeight()-parseInt($('#interactions').css("padding-top"))-parseInt($('#messages').css("padding-top"));
//     $('#messages').css('max-height',topSize-45);
// }


// document.getElementsByTagName("body")[0].onresize = function() {resizeMessageBox()};


var firebaseAddress = firebase.database().ref('address');

// FICA ESCUTANDO O ENDEREÇO
firebaseAddress.on('value',function(a){
    var address = a.val();

    // ATUALIZA O ENDEREÇO COM A INFORMAÇÃO DO BANCO
    $('#address').attr('href',address);
})


function checkLastSameAction(message, type){
    var lastObjectID = $('#messages span').data('id');
    var lastObjectType = $('#messages span').data('type');
    var lastObjectMessage = $('#messages span').data('message');
    var lastObjectCount = $('#messages span').data('count');
    var lastObjectUID = $('#messages span').data('uid');
    var lastObjectDate = $('#messages span').data('date');

    var now = moment().format('YYYYMMDDHHmmss');

    var start = moment(lastObjectDate, 'YYYYMMDDHHmmss');
    var end = moment(now, 'YYYYMMDDHHmmss');

    // Calcula quanto tempo faz desde a última interação de alguém
    var lastActionMinutes = end.diff(start, 'minutes');

    if(lastObjectType == type && 
        lastObjectMessage == message && 
        lastObjectUID == firebase.auth().currentUser.uid &&
        lastActionMinutes <= 2){
        firebase.database().ref('messages/' + lastObjectID).update({
            count: lastObjectCount+1
        });
    }else{
        sendMessage(type, message);
    }
    updateLastViewed();
}


// CARREGA AS MENSAGENS DO BANCO DE DADOS
var firebaseMessages = firebase.database().ref('messages').limitToLast(100);
firebaseMessages.on('value',function(messages){
    var messages = messages.val();
    
    if(messages == null){
        document.getElementById('messages').innerHTML = '<center><p style="color:#f10935;font-weight:600;">Não existem mensagens aqui 🥺</p></center>';
    }
    else{
        document.getElementById('messages').innerHTML = '';
    }
    
    var messagesIDs = Object.keys(messages);
    // console.log(messagesIDs);
    var lastMessagePosition = messagesIDs.length-1;
    var lastMessageCountReceived = moment().format("YYYYMMDDHHmmss") - messages[messagesIDs[lastMessagePosition]].date;
    if(lastMessageCountReceived <= 5){
        playSound('pop');
    }

    for(var i=0; i<messagesIDs.length; i++){
        var message = messages[messagesIDs[i]];
        // console.log(i);
        var type = message.type;
        var date = message.date;
        var uid = message.uid;
        var like = message.like;
        var msg = message.message;
        var id = messagesIDs[i];

        var lastMessageStyle;
        var nextMessage = messages[messagesIDs[i+1]];
        if(type == "message" && i < messagesIDs.length-1){
            if(uid != nextMessage.uid || type != nextMessage.type){
                lastMessageStyle = " last-message";
            }
            else{
                lastMessageStyle = "";
            }
        }
        else if(i == messagesIDs.length-1){
            lastMessageStyle = " last-message";
        }
        else{
            lastMessageStyle = "";
        }

        like = message.like == true ? " like" : "";
        var feelingPT = "";

        var since = moment(date, 'YYYYMMDDHHmmss').fromNow();

        var heartSVG = `<svg width="19" height="19" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 26.6875L13.1875 25.0375C6.75 19.2 2.5 15.35 2.5 10.625C2.5 6.775 5.525 3.75 9.375 3.75C11.55 3.75 13.6375 4.7625 15 6.3625C16.3625 4.7625 18.45 3.75 20.625 3.75C24.475 3.75 27.5 6.775 27.5 10.625C27.5 15.35 23.25 19.2 16.8125 25.05L15 26.6875Z" fill="#f10935"/></svg>`;
        var kissSVG = `<svg width="19" height="19" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.20392 14.1311C4.94785 15.7529 3.58586 20.7112 4.12522 21.3584C4.66457 22.0057 5.51055 22.362 7.57709 20.927C11.4604 18.2302 11.0265 16.4766 12.3234 15.5334C13.51 14.6704 14.2651 15.4255 15.8832 14.4547C17.5012 13.4838 16.6383 12.9445 18.0406 11.9737C19.4429 11.0028 19.8744 11.4343 23.1105 10.3556C25.6994 9.49262 25.4837 8.41391 25.268 7.55094C25.0522 6.68797 21.7082 5.60926 19.8744 5.0699C17.4673 4.36194 15.6674 3.45184 13.9415 4.42268C12.5094 5.2282 13.2943 6.36436 11.9998 7.44307C10.7054 8.52178 9.73451 7.22732 8.00857 8.09029C6.28264 8.95326 5.52754 12.0815 5.20392 14.1311Z" fill="#f10935"/><path d="M20.5216 23.0844C26.2388 19.4168 26.886 10.7871 26.3467 10.3556C25.8073 9.9241 23.4126 10.6145 22.0318 11.2186C20.3059 11.9737 19.0114 15.2098 17.3934 16.2885C15.7753 17.3672 13.2943 16.9357 10.5975 19.201C8.44006 21.0132 6.71412 22.7608 6.92986 23.5159C7.14561 24.271 14.8044 26.752 20.5216 23.0844Z" fill="#f10935"/></svg>`;
        var biteSVG = `<svg width="19" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M8.06654 21.2769C8.25914 20.3029 7.52449 19.2173 6.89575 18.5018C5.13711 16.3897 3.40684 15.4475 2.19361 16.148L2.11272 16.1947C0.899486 16.8951 0.850335 18.8647 1.75345 21.3629C2.05866 22.2651 2.58485 23.3633 3.5713 23.7643C4.2559 24.0162 5.12394 23.8385 6.17541 23.2315C7.35446 22.6586 7.94231 21.9956 8.06654 21.2769Z" fill="#f10935"/><path d="M13.5116 21.3685C14.8057 20.6213 15.5553 19.865 15.7012 18.8102C15.9622 17.5811 15.3301 16.1127 14.0134 14.3925C11.5668 11.2756 9.01187 9.83893 7.47511 10.7262C7.47511 10.7262 7.47511 10.7262 7.39422 10.7729C5.85746 11.6601 5.82417 14.5911 7.25347 18.1875C8.00399 20.2346 9.04049 21.4695 10.2354 21.858C11.2686 22.34 12.3451 22.1498 13.5116 21.3685Z" fill="#f10935"/><path d="M23.0274 14.6883C23.2884 13.4592 22.6563 11.9908 21.3396 10.2706C18.7654 7.11951 16.2572 5.76372 14.7204 6.65097C14.7204 6.65097 14.7204 6.65097 14.6395 6.69767C13.1028 7.58492 13.0695 10.5159 14.4988 14.1123C15.2493 16.1594 16.2858 17.3943 17.4807 17.7828C18.4205 18.103 19.5778 17.8662 20.7911 17.1657C22.051 16.5461 22.7539 15.7089 23.0274 14.6883Z" fill="#f10935"/><path d="M27.9211 9.81388C28.1137 8.83994 27.379 7.75428 26.7503 7.03885C24.9917 4.92675 23.1805 4.03123 22.0482 4.685C20.8349 5.38546 20.6582 7.32083 21.608 9.89991C21.9132 10.8021 22.4394 11.9003 23.4259 12.3014C24.1105 12.5532 24.9785 12.3755 26.03 11.7685C27.209 11.1956 27.7969 10.5327 27.9211 9.81388Z" fill="#f10935"/><path d="M9.5489 27.4309C10.407 27.3793 8.62219 21.675 7.9787 20.2492L2.80763 23.2347C3.27458 24.0435 7.79672 27.536 9.5489 27.4309Z" fill="#f10935"/><path d="M28.0782 16.733C27.6045 17.4504 23.5568 13.0525 22.6437 11.7823L27.8148 8.7968C28.2818 9.60562 29.0453 15.2682 28.0782 16.733Z" fill="#f10935"/></g><defs><clipPath id="clip0"><rect width="30" height="30" fill="white"/></clipPath></defs></svg>`;

        var sendingIcon = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.49625 0.75C2.42625 0.75 0.75 2.43 0.75 4.5C0.75 6.57 2.42625 8.25 4.49625 8.25C6.57 8.25 8.25 6.57 8.25 4.5C8.25 2.43 6.57 0.75 4.49625 0.75ZM4.5 7.5C2.8425 7.5 1.5 6.1575 1.5 4.5C1.5 2.8425 2.8425 1.5 4.5 1.5C6.1575 1.5 7.5 2.8425 7.5 4.5C7.5 6.1575 6.1575 7.5 4.5 7.5Z" fill="white"/><path d="M4.6875 2.625H4.125V4.875L6.09375 6.05625L6.375 5.595L4.6875 4.59375V2.625Z" fill="white"/></svg>`;
        var checkSent = `<svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.78365 0.505954C9.64561 0.526129 9.51838 0.593088 9.42254 0.695866C7.34287 2.81296 5.44825 4.90416 3.41285 6.99667L1.50613 5.59187C1.37789 5.48762 1.21423 5.43925 1.05103 5.45766C0.887669 5.47608 0.738411 5.5597 0.635771 5.68997C0.533146 5.82025 0.485651 5.98662 0.503787 6.15237C0.521922 6.31832 0.604253 6.46993 0.732494 6.57418L3.07761 8.33921C3.19735 8.43544 3.34777 8.48324 3.5002 8.47359C3.65247 8.46393 3.79598 8.3974 3.90293 8.28689C6.1166 6.03353 8.11118 3.80762 10.2995 1.57999C10.4252 1.45616 10.4932 1.28393 10.487 1.10631C10.4807 0.928534 10.4007 0.761722 10.2665 0.647383C10.1325 0.532909 9.95706 0.481537 9.78365 0.505954Z" fill="white"/></svg>`;
        var checkRead = `<svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.0339 0.505954C12.8958 0.526129 12.7686 0.593088 12.6728 0.695866C11.5597 1.82893 10.4997 2.95458 9.44273 4.07699C8.52478 5.05175 7.60914 6.02407 6.66309 6.99667L6.18041 6.64106C5.88924 6.94862 5.59604 7.25676 5.2998 7.56547L6.32785 8.33921C6.44759 8.43544 6.59801 8.48324 6.75044 8.47359C6.90271 8.46393 7.04622 8.3974 7.15316 8.28689C8.26337 7.15678 9.31854 6.0335 10.3706 4.91352C11.4163 3.80036 12.4589 2.69039 13.5497 1.57999C13.6754 1.45616 13.7435 1.28393 13.7373 1.10631C13.7309 0.928534 13.6509 0.761722 13.5168 0.647383C13.3828 0.532909 13.2073 0.481537 13.0339 0.505954Z" fill="white"/><path d="M9.78365 0.505954C9.64561 0.526129 9.51838 0.593088 9.42254 0.695866C7.34287 2.81296 5.44825 4.90416 3.41285 6.99667L1.50613 5.59187C1.37789 5.48762 1.21423 5.43925 1.05103 5.45766C0.887669 5.47608 0.738411 5.5597 0.635771 5.68997C0.533146 5.82025 0.485651 5.98662 0.503787 6.15237C0.521922 6.31832 0.604253 6.46993 0.732494 6.57418L3.07761 8.33921C3.19735 8.43544 3.34777 8.48324 3.5002 8.47359C3.65247 8.46393 3.79598 8.3974 3.90293 8.28689C6.1166 6.03353 8.11118 3.80762 10.2995 1.57999C10.4252 1.45616 10.4932 1.28393 10.487 1.10631C10.4807 0.928534 10.4007 0.761722 10.2665 0.647383C10.1325 0.532909 9.95706 0.481537 9.78365 0.505954Z" fill="white"/></svg>`;

        if(type == "feeling"){
            if(msg == "kiss"){
                feelingPT = ` Beijo ${kissSVG}`;
                feelingsPT = ` Beijos ${kissSVG}`;
            }
            else if(msg == "heart"){
                feelingPT = ` Carinho ${heartSVG}`;
                feelingsPT = ` Carinhos ${heartSVG}`;
            }
            else if(msg == "bite"){
                feelingPT = `a mordida ${biteSVG}`;
                feelingsPT = ` mordidas ${biteSVG}`;
            }
            else if(msg == "heart-beat"){
                feelingPT = ` Coração! ${heartSVG}`;
            }
            // console.log(feelingPT);

            if(message.count > 0){
                var msgCount = message.count;
            } else var msgCount = 1;

            // VERIFICA SE O ID DA MENSAGEM É IGUAL AO DO USUÁRIO LOGADO
            if(uid == firebase.auth().currentUser.uid){
                var status = "sent";
                var statusPT = "enviou";

                // QUANDO É MAIS DE UMA AÇÃO IGUAL, É SOMADO
                if(msgCount>1){
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}" data-date="${date}"><p><b>${since} &nbsp;</b>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}</p></span>`);
                    // $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since} <span class="status-icon" id="status" class="status">${checkSent}</span>&nbsp;</b>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}</p></span>`);
                }
                // QUANDO É SÓ UMA ACÃO
                else{
                    if(msg == "heart-beat"){
                        $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}" data-date="${date}"><p><b>${since} &nbsp;</b>Você reacendeu o${feelingPT}</p></span>`);
                    }
                    else{
                        $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}" data-date="${date}"><p><b>${since} &nbsp;</b>Você ${statusPT} um${feelingPT}</p></span>`);
                    }
                    // $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since} <span class="status-icon" id="status" class="status">${checkSent}</span>&nbsp;</b>Você ${statusPT} um${feelingPT}</p></span>`);
                }
            }
            else{
                var status = "received";
                var statusPT = "recebeu";

                // QUANDO É MAIS DE UMA AÇÃO IGUAL, É SOMADO
                if(msgCount>1){
                    $('#messages').prepend(`<span class="${status}}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}" data-date="${date}"><p>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}&nbsp;<b>${since}</b></p></span>`);
                }
                // QUANDO É SÓ UMA ACÃO
                else{
                    if(msg == "heart-beat"){
                        $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}" data-date="${date}"><p>B reacendeu o${feelingPT}&nbsp;<b>${since}</b></p></span>`);
                    }
                    else{
                        $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}" data-date="${date}"><p>Você ${statusPT} um${feelingPT}&nbsp;<b>${since}</b></p></span>`);
                    }
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
            // IMPRIME A MENSAGEM NA LISTA DE MENSAGENS
            $('#messages').prepend(`<span data-id="${id}" data-uid="${uid}" class="message ${status}${like}${lastMessageStyle}" data-date="${date}"><p><span>${msg}</span><b>${since} </b></p></span>`);
            // $('#messages').prepend(`<span data-id="${id}" data-uid="${uid}" class="message ${status} ${like}"><p>${msg}<b>${since} <span class="status-icon" class="status">${checkSent}</span></b></p></span>`);
        }
    }

    $('#content').removeClass('hide');
    $('#loading').addClass('hide');
    
    doubleClickLike();
    longPressAction();

    // resizeMessageBox();
    checkOnlineStatus();
});

// function teste() {
//     // $(".message").removeClass("last-message"); // Limpa a classe antes de reaplicar

//     let lastClass = "";
//     let lastElement = null;
//     let firstOfNewGroup = null;

//     $(".message").each(function () {
//         let currentClass = $(this).hasClass("sent") ? "sent" : "received";

//         // Se o elemento anterior não tem "message", já aplica "last-message" neste
//         if (!$(this).prev().hasClass("message")) {
//             $(this).addClass("last-message");
//         }

//         // Se a classe mudou (de "sent" para "received" ou vice-versa)
//         if (lastElement && currentClass !== lastClass) {
//             $(lastElement).addClass("last-message"); // Aplica "last-message" no último do grupo anterior
//             firstOfNewGroup = this; // Marca este como o primeiro do novo grupo
//         }

//         lastClass = currentClass;
//         lastElement = this;
//     });

//     // Aplica "last-message" ao último elemento processado
//     if (lastElement) {
//         $(lastElement).addClass("last-message");
//     }
// }

// Função para detectar duplo clique em alguma mensagem recebida e atualiza com <3 no banco
function doubleClickLike() {
    let lastTap = 0;

    $(".received").on("dblclick", function (e) {
        e.preventDefault();
        likeMessage($(this));
    });

    $(".received").on("touchend", function (e) {
        e.preventDefault();

        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTap;

        if (tapLength < 500 && tapLength > 0) { // Duplo toque detectado
            likeMessage($(this));
        }

        lastTap = currentTime;
    });

    function likeMessage(element) {
        if (window.getSelection) {
            window.getSelection().removeAllRanges(); // Remove seleção de texto
        } else if (document.selection) {
            document.selection.empty();
        }

        var id = element.data("id");
        var like = element.hasClass("like") ? false : true;

        firebase.database().ref('messages/' + id).update({
            like: like
        });
    }
}

// Função para detectar um clique longo e destacar a mensagem
function longPressAction() {
    let holdTimer;

    $(".message.sent").on("mousedown touchstart", function (e) {
        e.preventDefault();
        let message = $(this);
        var messageID = $(this).attr('data-id');
        var sinceMessage = moment().format('YYYYMMDDHHmmss')-$(this).attr('data-date');

        holdTimer = setTimeout(() => {
            // console.log("Clique longo detectado!");

            // Adiciona overlay na tela se ainda não existir
            if (!$(".message-overlay").length) {
                $("body").append('<div class="message-overlay"></div>');
            }
            $(".message-overlay").fadeIn();

            // Destaca a mensagem
            $(".message").removeClass("highlighted"); // Remove destaque de outras mensagens
            message.addClass("highlighted");

            
            // Remove qualquer menu flutuante existente antes de criar um novo
            $(".floating-message-menu").remove();

            var deleteMessage = "";
            // Se a mensagem tiver sido enviada há no máximo 10 minutos, habilita opção de deletar
            if(sinceMessage <= 1000){
                deleteMessage = `
                    <div onclick="deleteMessage('${messageID}')" style="border-top: 1px solid #ffffff85">
                        <span class="action">Excluir mensagem</span>
                        <span class="material-icons md-22">delete</span>
                    </div>
                `;
            }

            // Cria a div flutuante
            $("body").prepend(`
                <div class="floating-message-menu">
                    <div onclick="copyMessage('${messageID}')">
                        <span class="action">Copiar</span>
                        <span class="material-icons md-22">content_copy</span>
                    </div>
                    ${deleteMessage}
                </div>
                
            `);

            // Posição da div flutuante
            let messageOffset = message.offset();
            $(".floating-message-menu").css({
                top: messageOffset.top + message.outerHeight() + 5, // Posição logo abaixo da mensagem
                // left: messageOffset.left,
                right: "24px",
                display: "inline-block"
            });

            // Clicar fora remove o destaque e o menu flutuante
            $(".message-overlay").on("click", function () {
                $(this).fadeOut(() => $(this).remove()); // Remove overlay
                message.removeClass("highlighted"); // Remove destaque
                $(".floating-message-menu").remove(); // Remove menu flutuante
            });

        }, 600); // Tempo para ativar o efeito (0.6s)
    });

    $(".message.sent").on("mouseup mouseleave touchend touchcancel", function () {
        clearTimeout(holdTimer); // Cancela o efeito se soltar antes do tempo
    });
}

// Timeout para mensagem de aviso fazê-la sumir
setTimeout(function () {
    $('.temp-alert').fadeOut(500, function () {
        $(this).remove(); // Remove o elemento do DOM após o fade
    });
}, 200); // 2000ms = 2 segundos

// Função para copiar o conteúdo da mensagem
function copyMessage(messageID) {
    var text = $('#messages span[data-id=' + messageID + '] span').text();

    navigator.clipboard.writeText(text).then(function () {
        showAlert('success', 'Mensagem copiada', 'check_circle');
    }).catch(function (err) {
        showAlert('error', 'Erro ao copiar', 'error');
    });

    $('.message-overlay').remove(); // Remove overlay
    $('.messages .message').removeClass("highlighted"); // Remove destaque
    $(".floating-message-menu").remove(); // Remove menu flutuante
}

function showAlert(type, message, icon) {
    const alert = $(`
        <div class="${type} temp-alert">
            <span>${message}</span>
            <span class="material-icons md-24">${icon}</span>
        </div>
    `);

    $('#alertArea').append(alert);

    setTimeout(() => {
        alert.addClass('exit');
        setTimeout(() => {
            alert.remove();
        }, 500); // Tempo da animação de saída
    }, 2000);
}

function deleteMessage(messageID) {
    confirmDialog("Tem certeza que deseja excluir esta mensagem?", function () {
        firebase.database().ref('messages/' + messageID).remove();
        showAlert('success', 'Mensagem excluída', 'check_circle');

        $('.message-overlay').remove(); // Remove overlay
        $('.messages .message').removeClass("highlighted"); // Remove destaque
        $(".floating-message-menu").remove(); // Remove menu flutuante
    });
}

// Função para confirmar ação
function confirmDialog(message, onConfirm) {
    const dialog = $(`
        <div class="confirm-overlay">
            <div class="confirm-box">
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="confirm-yes">Excluir</button>
                    <button class="confirm-no">Cancelar</button>
                </div>
            </div>
        </div>
    `);

    $('body').append(dialog);

    dialog.find('.confirm-yes').on('click', function () {
        dialog.fadeOut(() => dialog.remove());
        onConfirm();
    });

    dialog.find('.confirm-no').on('click', function () {
        dialog.fadeOut(() => dialog.remove());
    });
}



// FUNÇÃO QUE VERIFICA E ATIVA O INDICATIVO OFFLINE SE NECESSÁRIO
function checkOnlineStatus(){
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
        // console.log("connected");
        $('body').removeClass('offline');
    } else {
        // console.log("not connected");
        $('body').addClass('offline');
    }
    });
}

function checkTipDate(){
    setInterval(function() {
        if(moment().format('YYYYMMDD') == document.getElementById('dayTip').getAttribute('data-date-tip') && document.getElementById('dayTip').innerHTML != ""){
        // if('202009071300' == document.getElementById('dayTip').getAttribute('data-date-tip')){
            document.getElementById('dayTipArea').style.display = "block";
        }
        else{
            document.getElementById('dayTipArea').style.display = "none";
        }
        // resizeMessageBox();
    }, 5 * 1000);
}
// checkTipDate();

// var firebaseDate = firebase.database().ref('dates').orderByKey().limitToLast(1);
// firebaseDate.on('value',function(dates){
//     var dates = dates.val();
//     var lastDate = Object.keys(dates);
//     lastDateID = lastDate[0];
//     lastDate = dates[lastDate];

//     // QUANDO FOR EU
//     if(firebase.auth().currentUser.uid == "skSzuAFRskQmMjfdcV3p4RhU5RE2"){
//         // document.getElementById('tipsButton').style.display = 'block';
//         document.getElementById('config').style.display = 'block';
//     }
//     if(lastDate.ticket != undefined){
//         var checkinDate = moment(lastDate.ticket.checkin.date, 'YYYYMMDDHHmmss').format('YYYYMMDD');
//         var checkoutDate = moment(lastDate.ticket.checkout.date, 'YYYYMMDDHHmmss').format('YYYYMMDD');
//     }

//     var firebaseDateTips = firebase.database().ref('dates/'+lastDateID+'/tips');
//     firebaseDateTips.on('value',function(tips){
//         var tips = tips.val();
//         // console.log(tips);
//         var start = moment(checkinDate, 'YYYYMMDD');
//         var end = moment(checkoutDate, 'YYYYMMDD');
//         var daysTotalCount = daysCount(start, end);
//         // console.log(daysTotalCount);

//         // PEGA A DICA DO DIA E ATUALIZA QUADRO DE 'DICA DO DIA'
//         for(var t in tips){
//             var tip = tips[t];
//             // console.log(t);
//             var place = tip.place;
            
//             if(moment().format('YYYYMMDD') == t){
//                 var numTip = daysTotalCount-(daysCount(t, end)-1);
//                 document.getElementById('tipsCount').innerHTML = numTip+'/'+daysTotalCount;
//                 document.getElementById('dayTip').innerHTML = place;
//                 document.getElementById('dayTip').setAttribute('data-date-tip', t);
//                 if(place != ""){
//                     document.getElementById('dayTipArea').style.display = "block";
//                 }else{
//                     document.getElementById('dayTipArea').style.display = "none";
//                 }
//                 resizeMessageBox();
//                 // console.log(numTip);
//                 break;
//             }
//             else{
//                 document.getElementById('dayTipArea').style.display = "none";
//                 resizeMessageBox();
//             }
//         }

//         if(firebase.auth().currentUser.uid == "skSzuAFRskQmMjfdcV3p4RhU5RE2"){
//             var d = checkinDate;
//             var numTip;
//             $('#futureTips, #pastTips').html("");
//             while(d <= checkoutDate){
//                 var list;
//                 if(d > moment().format('YYYYMMDD')){
//                     list = 'future';
//                 } else{
//                     list = 'past';
//                 }

//                 var numTip = daysTotalCount-(daysCount(d, checkoutDate)-1);
//                 var dateFormat = moment(d, 'YYYYMMDD').format('DD MMM');
//                 if(tips[d] == undefined){
//                     // console.log('dia '+d+' não existe');
//                     $('#'+list+'Tips').append(`
//                     <div class="tip">
//                         <div class="date">
//                             <span>${dateFormat}</span>
//                             <span>(${numTip}/${daysTotalCount})</span>
//                         </div>
//                         <div class="input input-secondary" id="list-tip-item-${d}" onfocusout="updateTip(${lastDateID}, ${d})" data-text="Digite uma dica" contenteditable=""></div>
//                     </div>`);
//                 }
//                 else{
//                     // console.log('dia '+d+' existe');
//                     $('#'+list+'Tips').append(`
//                     <div class="tip">
//                         <div class="date">
//                             <span>${dateFormat}</span>
//                             <span>(${numTip}/${daysTotalCount})</span>
//                         </div>
//                         <div class="input input-secondary" id="list-tip-item-${d}" onfocusout="updateTip(${lastDateID}, ${d})" data-text="Digite uma dica" contenteditable="">${tips[d].place}</div>
//                     </div>`);
//                 }
//                 d = moment(d, "YYYYMMDD").add(1,'days').format("YYYYMMDD");
//                 // console.log(d);
//             }
//         }

//     });

// });

// Ao segurar o dedo em alguma mensagem
var holdTimer;

$(".message").on("mousedown touchstart", function (e) {
    e.preventDefault(); // Impede comportamentos padrão
    window.getSelection().removeAllRanges(); // Remove qualquer seleção de texto

    holdTimer = setTimeout(() => {
        console.log("Clique segurado por 1 segundo!");
        // Adicione aqui a ação desejada
    }, 1000); // 1 segundo
});

$(".message").on("mouseup mouseleave touchend touchcancel", function () {
    clearTimeout(holdTimer); // Cancela a ação se soltar antes de 1s
});

// PREENCHE O MODAL DE CONTROLE DE ENCONTROS
var firebaseDate = firebase.database().ref('dates').orderByKey();
firebaseDate.on('value',function(dates){
    var dates = dates.val();
    // console.log(dates);

    if(firebase.auth().currentUser.uid == "skSzuAFRskQmMjfdcV3p4RhU5RE2"){
        $('#dates-area').removeClass('viewer');
        // $('#dates-area').addClass('editor');
    }


    $('#datesList').empty();

    var togetherDaysSum = 0;
    var togetherHoursSum = 0;
    var togetherMinutesSum = 0;
    var togetherSecondsSum = 0;

    // Variável para identificar quando existir o encontro que marca nossa morada juntos
    var forever = 0;

    $('#togetherSum').html("");
    $('#foreverDate').html("");

    var foreverCheckinDate = "";

    for(var d in dates){
        var date = dates[d];

        var checkin = moment(date.date, 'YYYYMMDDHHmm').format('DD/MMM/YY');

        var checkinInput = moment(date.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD'+'T'+'HH:mm');

        var ticket = (date.ticket === undefined) ? "" : date.ticket;
        if(date.forever == 1){
            var checkout = moment().format('YYYYMMDDHHmmss');
        }
        else{
            var checkout = (ticket.checkout.date === undefined) ? "" : moment(ticket.checkout.date, 'YYYYMMDDHHmm').format('DD/MMM/YY');
        }
        
        var checkoutInput = (ticket.checkout.date === undefined) ? "" : moment(ticket.checkout.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD'+'T'+'HH:mm');

        var host = (ticket.host === undefined) ? "" : ticket.host;
        var hostShow = (ticket.host === undefined) ? "hide-toggle" : ticket.host;

        var street = (ticket.street === undefined) ? "" : ticket.street;
        var streetShow = (ticket.street === undefined) ? "hide-toggle" : ticket.street;

        var streetComplement = (ticket.streetComplement === undefined) ? "" : ticket.streetComplement;
        var streetComplementShow = (ticket.streetComplement === undefined) ? "hide-toggle" : ticket.streetComplement;

        var apto = (ticket.apto === undefined) ? "" : ticket.apto;
        var aptoShow = (ticket.apto === undefined) ? "hide-toggle" : ticket.apto;

        var start = moment(date.date, 'YYYYMMDDmmss');
        var end = moment(ticket.checkout.date, 'YYYYMMDDmmss');

        var togetherDays = end.diff(start, 'days');
        var togetherSeconds = end.diff(start, 'seconds');

        var ref = "#datesList";
        var inputType = "datetime-local";
        var countDaysText = "dias";

        // Parâmetros para quando for um encontro forever
        if(date.forever == 1){
            forever = 1;
            ref = "#foreverDate";
            togetherDays = "∞";
            checkout = "Sempre";
            inputType = "text"
            checkoutInput = "∞";

            var end = moment(moment().format('YYYYMMDDHHmmss'), 'YYYYMMDDHHmmss');

            togetherSeconds = end.diff(start, 'seconds');
        };
        if(togetherDays <= 1){
            togetherDays = 1;
            countDaysText = "dia";
        }

        $(ref).prepend(`
            <div id="date${d}" class="date-area">
                <div class="date" onclick="toggleClass('date${d}', 'opened')">
                    <span class="num">${d}</span>
                    <span class="period">${checkin} - ${checkout}</span>
                    <span class="date-count">${togetherDays} ${countDaysText}</span>
                    <div class="arrow-down"></div>
                </div>
                <div class="date-content">
                    <div class="flex">
                        <div class="form">
                            <input type="datetime-local" class="checkin-input" autocomplete="off" placeholder=" " value="${checkinInput}">
                            <label>Checkin</label>
                        </div>
                        <div class="form">
                            <input type="${inputType}" class="checkout-input" autocomplete="off" placeholder=" " value="${checkoutInput}">
                            <label>Checkout</label>
                        </div>
                    </div>
                    <div class="form">
                        <input type="text" class="address-input" autocomplete="off" placeholder=" " value="${street}">
                        <label>Endereço</label>
                    </div>
                    <div class="form">
                        <input type="text" class="complement-input" autocomplete="off" placeholder=" " value="${streetComplement}">
                        <label>Complemento</label>
                    </div>
                    <div class="form">
                        <input type="text" class="apto-input" autocomplete="off" placeholder=" " value="${apto}">
                        <label>Apto</label>
                    </div>
                    <div class="form">
                        <input type="text" class="host-input" autocomplete="off" placeholder=" " value="${host}">
                        <label>Anfitrião</label>
                    </div>
                    <div class="form edit">
                        <button class="tertiary" onclick="toggleClass('date${d}', 'editor')">Editar encontro</button>
                    </div>
                    <div class="form flex save">
                        <button class="secondary" onclick="toggleClass('date${d}', 'editor')">Cancelar</button>
                        <button class="primary" onclick="updateDateDetails('${d}')">Salvar</button>
                    </div>
                </div>
            </div>
        `)
        if(togetherDays == "∞"){
            togetherDays = 0;
            // togetherHours = 0;
            // togetherMinutes = 0;
            togetherSecondsForeverDate = togetherSeconds;
            // togetherSeconds = 0;
        }
        togetherDaysSum += togetherDays;
        // togetherHoursSum += togetherHours;
        // togetherMinutesSum += togetherMinutes;
        togetherSecondsSum += togetherSeconds;

    }

    if(forever == 1){
        // Subtrai 1 dia da lista de encontros totais quando existe o encontro "para sempre"
        d -= 1;
    }

    // Atualiza o contador de encontros na lista de encontros
    $('#historyDatesCount').html(d);
    // Atualiza contador de dias da lista de encontros
    $('#historyDatesCountDays').html(togetherDaysSum); // Esse valor é arredondado, não leva em conta horas ou segundos a mais
    // moment(now, 'YYYYMMDDHHmmss')

    // togetherSecondsSum += togetherSecondsForeverDate;

    var days = Math.floor(togetherSecondsSum / (24 * 3600)); // Extrai a quantidade de dias
    var resto = togetherSecondsSum % (24 * 3600); // Resto após remover os dias

    var hours = Math.floor(resto / 3600); // Extrai a quantidade de horas (0-23)
    resto = resto % 3600; // Resto após remover as horas

    var minutes = Math.floor(resto / 60); // Extrai a quantidade de minutos (0-59)
    var seconds = resto % 60; // O que sobra são os segundos (0-59)

    // console.log(togetherSecondsSum+" Segundos");

    $('[data-days]').html(days); // Esse valor leva em conta até as horas ou segundos, então deve dar mais dias do que o valor de togetherDaysSum
    $('[data-hours]').html(hours);
    $('[data-minutes]').html(minutes);
    $('[data-seconds]').html(seconds);    

    if(forever == 1){
        
        startCounter(days, hours, minutes, seconds);
    }
});


// Função para selecionar a tab do modal Viagens
function travelTabSelector(id){
    $('.new-modal-area.travel .tab div').removeClass('opened');
    $('#'+id+'Tab').addClass('opened');
}

var firebaseUsers = firebase.database().ref('users/');
// Lógica para gerenciar a escolha da viagem de cada usuário
firebaseUsers.on('value',function(users){
    var users = users.val();

    var myPreferences = users[firebase.auth().currentUser.uid];
    var travelSelectedID = myPreferences.travel;
    var contador = myPreferences.contador;

    var now = moment().format('YYYYMMDDHHmm');

    // Pega a data das viagens e caso necessário atualiza preferência de viagem do usuário
    var firebaseTravels = firebase.database().ref('travels/');
    firebaseTravels.on('value',function(travels){
        var travels = travels.val();

        if(travelSelectedID != 0){
            $('.button.checklist').show();
            $('#nextTravelTab').removeClass('hide');
            // $('.button.travel .remaining-days').removeClass('hide');
            
            // Se a viagem atual não for do passado, continua com a seleção
            if(now >= travels[travelSelectedID].checkin && now <= travels[travelSelectedID].checkout || now < travels[travelSelectedID].checkin){
                
            }
            else{
                var newTravelSelector = 0;
                for(var t in travels){
                    // var travel = travels[t];

                    if(now >= travels[t].checkin && now <= travels[t].checkout || now < travels[t].checkin){
                        newTravelSelector = t;
                    }
                }
                firebase.database().ref('users/'+firebase.auth().currentUser.uid).update({
                    travel: Number(newTravelSelector)
                });
            }
        }
        else{
            $('.button.checklist').hide();
            $('#nextTravelTab').addClass('hide');
            travelTabSelector('ourTravels');
            // $('.button.travel .remaining-days').addClass('hide');
        }
        switch(contador){
            case 1:
                if(travelSelectedID != 0 || newTravelSelector != 0){
                    $('.button.travel .remaining-days').removeClass('hide');
                }
                $('.button.history .remaining-days').addClass('hide');
                break;
            case 2:
                $('.button.history .remaining-days').removeClass('hide');
                $('.button.travel .remaining-days').addClass('hide');
                break;
            case 3:
                if(travelSelectedID != 0 || newTravelSelector != 0){
                    $('.button.travel .remaining-days').removeClass('hide');
                    $('.button.history .remaining-days').addClass('hide');
                }
                else{
                    $('.button.travel .remaining-days').addClass('hide');
                    $('.button.history .remaining-days').removeClass('hide');
                }
                break;
            default:
        }
        
    });
});

// Lógica para pegar a preferência de escolha de viagem do usuário e popular a PRIMEIRA ABA
var firebaseUsers = firebase.database().ref('users/');
firebaseUsers.on('value',function(users){
    var users = users.val();
    var myPreferences = users[firebase.auth().currentUser.uid];

    var travelID = myPreferences.travel;

    if(travelID != 0){
        // Lógica para preencher o modal de Viagens, na aba de próximo destino (a primeira aba)
        var firebaseTravel = firebase.database().ref('travels/'+travelID);
        firebaseTravel.on('value',function(travel){
            var travel = travel.val();

            var title = travel.title;

            // var checkinInput = moment(newDateCheckin, 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');
            var place = travel.place;
            var checkin = moment(travel.checkin, 'YYYYMMDDHHmm').format('YYYYMMDDHHmm');
            var checkout = moment(travel.checkout, 'YYYYMMDDHHmm').format('YYYYMMDDHHmm');
            var address = travel.address;

            var daysTravelling = daysCount(checkin, checkout);
            var daysTravellingPT = "dias";

            if(daysTravelling <= 1){
                daysTravelling = 1;
                daysTravellingPT = "dia";
            }

            var today = moment().format('YYYYMMDDHHmmss');
            var memories = travel.memories;
            var interests = travel.interests;
            var aditionals = travel.aditionals;

            var countdownDaysPT;

            var countdownDays = daysCount(today, checkin);
            if(countdownDays == 1){
                countdownDaysPT = "dia";
            }else countdownDaysPT = "dias";

            // Condicional para quando estiver na viagem
            if(countdownDays <= 0){
                // Atualiza o botão superior
                $('#countdownTravel').html(`
                    <span>Em ${place}</span>
                `);
                // Atualiza o texto do modal Viagem
                $('.fast-access .button.travel .remaining-days').html(`
                    <span class="local">Desbravando</span>
                    <br>
                    <span class="days">${title}</span>
                `);
            }
            else{
                // Atualiza o botão superior
                $('#countdownTravel').html(`
                    <span>${place}</span> em <b>${countdownDays}</b> ${countdownDaysPT}
                `);
                // Atualiza o texto do modal Viagem
                $('.fast-access .button.travel .remaining-days').html(`
                    <span class="local">${title}</span>
                            <span>em</span>
                            <br>
                            <span class="days">${countdownDays}</span>
                            <span>${countdownDaysPT}</span>
                `);
            }

            checkin = moment(travel.checkin, 'YYYYMMDDHHmm').format('DD/MMM/YYYY');
            checkout = moment(travel.checkout, 'YYYYMMDDHHmm').format('DD/MMM/YYYY');
            $('#travelDate').text("");
            $('#travelDate').append(`
                ${checkin} - ${checkout} (${daysTravelling} ${daysTravellingPT})
            `);

            $('#travelAddress').text(address);

            $('#memoriesList').text("");
            $('#memoriesList').attr("travel-id",travelID);

            // Popula a lista de Lembranças
            if(memories == undefined){
                $('#memoriesList').append(`
                    <span class="no-register">Ainda não existem Lembranças 😕</span>
                `);
            }
            else{
                for(var m in memories){
                    var memory = memories[m];
                    
                    var text = memory.text;
                    $('#memoriesList').append(`
                        <span memory-id="${m}" class="textarea memory" contenteditable>"${text}"</span>
                    `);

                };
            }

            $('#interestsListToDo').text("");
            $('#interestsListDone').text("");
            $('#interestsList').attr("travel-id",travelID);

            // Popula a lista de Interesses
            if(interests == undefined){
                $('#interestsListToDo').append(`
                    <span class="no-register">Ainda não existem Interesses 😕</span>
                `);
            }
            else{
                for(var i in interests){
                    var interest = interests[i];

                    var text = interest.text;

                    var checkbox;
                    var destiny;

                    // Verifica qual o estado do checkbox no banco
                    if(interest.done == 0){
                        checkbox = `<span class="material-icons md-30" onclick="toggleInterest(${travelID}, '${i}',1)">check_box_outline_blank</span>`;
                        destiny = "interestsListToDo";

                    }else{
                        checkbox = `<span class="material-icons md-30" onclick="toggleInterest(${travelID}, '${i}',0)">check_box</span>`;
                        destiny = "interestsListDone";
                    }

                    $('#'+destiny).append(`
                        <span class="interest" interest-id="${i}">
                            ${checkbox}
                            <span class="textarea" contenteditable>${text}</span>
                        </span>
                    `);

                };
            }

            // Popula a lista adicionais
            $('#aditionalsArea').text("");
            var aditionalCount = 0;
            var aditionalIcon = ["looks_one","looks_two","looks_3","looks_4","looks_5","looks_6", "more_horiz"];

            for(var a in aditionals){
                var aditional = aditionals[a];

                var text = aditional.text;

                $('#aditionalsArea').append(`
                    <div class="aditional">
                        <span class="material-icons md-22">${aditionalIcon[aditionalCount]}</span>
                        <span>${text}</span>
                    </div>
                `);
                if(aditionalCount < 6){
                    aditionalCount++;
                }

            };
        });
    }
});


var firebaseUsers = firebase.database().ref('users/');

// Lógica para popular as próximas viagens no modal de Viagens na ABA NOSSAS VIAGENS
firebaseUsers.on('value',function(users){
    var users = users.val();
    var myPreferences = users[firebase.auth().currentUser.uid];

    var travelSelectedID = myPreferences.travel;
    
    $('#nextTravelTab').attr('travel-id',travelSelectedID);

    var firebaseTravels = firebase.database().ref('travels');
    firebaseTravels.on('value',function(travels){
        var travels = travels.val();
        
        $('#OurTravelsList .future-travels-list').text('');
        $('#OurTravelsList .past-travels-list').text('');
        for(var t in travels){
            var travel = travels[t];

            if(travelSelectedID == t){
                $('#nextTravelTab').text(travel.title);
            }
    
            var place = travel.place;
            var title = travel.title;
            var checkin = moment(travel.checkin, 'YYYYMMDDHHmm').format('YYYYMMDDHHmm');
            var checkinInput = moment(travel.checkin, 'YYYYMMDDHHmm').format('YYYY-MM-DD'+'T'+'HH:mm');
            var checkout = moment(travel.checkout, 'YYYYMMDDHHmm').format('YYYYMMDDHHmm');
            var checkoutInput = moment(travel.checkout, 'YYYYMMDDHHmm').format('YYYY-MM-DD'+'T'+'HH:mm');
            var address = travel.address;
    
            var memories = travel.memories;
            var interests = travel.interests;
            var aditionals = travel.aditionals;
            var checklist = travel.checklist;
    
            var today = moment().format('YYYYMMDDHHmmss');
            var daysLeft = daysCount(today, checkin);
    
            var daysTravelling = daysCount(checkin, checkout);
            var daysTravellingPT = "dias";
            var daysLeftPT = "dias";
    
            if(daysTravelling <= 1){
                daysTravelling = 1;
                daysTravellingPT = "dia";
            }
            if(daysLeft <= 1){
                daysLeftPT = "dia";
            }

            var radioButtonState;
            if(t == travelSelectedID){
                radioButtonState = '<span class="material-icons md-24" onclick="selectTravel('+t+')">radio_button_checked</span>';
            }
            else{
                radioButtonState = '<span class="material-icons md-24" onclick="selectTravel('+t+')">radio_button_unchecked</span>';
            }
            
            var countdownText;
            // Verifica se viagem está acontecendo
            if(daysLeft > 0){
                countdownText = '<span class="date-count">em '+daysLeft+' '+daysLeftPT+'</span>';
            }
            else{
                countdownText = '<span class="date-count">Agora</span>';
            }

            var now = moment().format('YYYYMMDDHHmm');
            var travelHTMLDestiny;
            // Condicional para saber se a viagem é futura ou passada
            if(now >= travels[t].checkin && now <= travels[t].checkout || now < travels[t].checkin){
                travelHTMLDestiny = 'future';
            }
            else{
                travelHTMLDestiny = 'past';
                radioButtonState = '';
                countdownText = moment(checkin, 'YYYYMMDDHHmm').format('MMM/YY');
            }

            var diary = `
                <span>Diário de Bordo</span>
                <div class="flex">
                    <span class="form button memories">
                        <span class="material-icons md-24">local_movies</span>
                        <span>Lembranças</span>
                        <span class="button__badge">2</span>
                    </span>
                    <span class="form button interests">
                        <span class="material-icons md-24">location_pin</span>
                        <span>Interesses</span>
                        <span class="button__badge">5</span>
                    </span>
                </div>
                <span class="form button checklist">
                    <span class="material-icons md-24">checklist</span>
                    <span>Lista de tarefas</span>
                    <span class="button__badge">4</span>
                </span>
            `;

            // Desativando função checklist enquanto não é desenvolvida
            diary = "";

            // Estutura do HTML da viagem referente
            $('#OurTravelsList .'+travelHTMLDestiny+'-travels-list').append(`
                <div class="future-travel">
                    ${radioButtonState}
                    <div id="travel${t}" class="date-area"> 
                        <div class="date" onclick="toggleClass('travel${t}', 'opened')">
                            <span class="period">${place} (${daysTravelling} ${daysTravellingPT})</span>
                            ${countdownText}
                            <div class="arrow-down"></div>
                        </div>
                        <div class="date-content">
                            <div class="flex">
                                <div class="form">
                                    <input class="checkin-input" type="datetime-local" autocomplete="off" placeholder=" " value="${checkinInput}">
                                    <label>Ida</label>
                                </div>
                                <div class="form">
                                    <input class="checkout-input" type="datetime-local" autocomplete="off" placeholder=" " value="${checkoutInput}">
                                    <label>Volta</label>
                                </div>
                            </div>
                            <div class="form">
                                <input class="title-input" type="text" autocomplete="off" placeholder=" " value="${title}">
                                <label>Título do card</label>
                            </div>
                            <div class="form">
                                <input class="place-input" type="text" autocomplete="off" placeholder=" " value="${place}">
                                <label>Local</label>
                            </div>
                            <div class="form">
                                <input class="address-input" type="text" autocomplete="off" placeholder=" "  value="${address}">
                                <label>Endereço</label>
                            </div>
                            <div class="aditional-list">
                                <div class="form">
                                    <input type="text" autocomplete="off" placeholder=" ">
                                    <label>Informação adicional</label>
                                </div>
                            </div>
                            <div class="form edit">
                                <button class="tertiary" onclick="toggleClass('travel${t}', 'editor')">Editar viagem</button>
                            </div>
                            <div class="form flex save">
                                <button class="secondary" onclick="toggleClass('travel${t}', 'editor')">Cancelar</button>
                                <button class="primary" onclick="updateTravelDetails('${t}')">Salvar</button>
                            </div>
                            <div class="travel-lists">
                                ${diary}
                                <span>Em breve um diário de bordo...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
                        
            // Verifica se existem Lembranças
            if(memories != undefined){
                $('.future-travel #travel'+t+' .memories .button__badge').text('');
                var memoriesCount = 0;
                for(var m in memories){
                    memoriesCount++;
                }
                $('.future-travel #travel'+t+' .memories .button__badge').text(memoriesCount);
            }
            else{
                $('.future-travel #travel'+t+' .memories .button__badge').hide();
            }

            // Verifica se existem Interesses
            if(interests != undefined){
                $('.future-travel #travel'+t+' .interests .button__badge').text('');
                var interestsCount = 0;
                for(var i in interests){
                    interestsCount++;
                }
                $('.future-travel #travel'+t+' .interests .button__badge').text(interestsCount);
            }
            else{
                $('.future-travel #travel'+t+' .interests .button__badge').hide();
            }

            // Verifica se existem itens na Checklist
            if(checklist != undefined){
                $('.future-travel #travel'+t+' .checklist .button__badge').text('');
                var checklistCount = 0;
                for(var i in interests){
                    checklistCount++;
                }
                $('.future-travel #travel'+t+' .checklist .button__badge').text(interestsCount);
            }
            else{
                $('.future-travel #travel'+t+' .checklist .button__badge').hide();
            }

            // Verifica se existem itens Adicionais
            if(aditionals != undefined){
                $('.future-travel #travel'+t+' .aditional-list').text('');
                
                var aditionalCount = 1;
                for(var a in aditionals){
                    var aditional = aditionals[a];

                    $('.future-travel #travel'+t+' .aditional-list').append(`
                        <div class="form">
                            <input aditional-id="${a}" type="text" autocomplete="off" placeholder=" " value="${aditional.text}">
                            <label>Informação adicional ${aditionalCount}</label>
                        </div>
                    `);
                    aditionalCount++;
                }
                $('.future-travel #travel'+t+' .aditional-list').append(`
                    <div class="form">
                        <input class="new-aditional" type="text" autocomplete="off" placeholder=" " value="">
                        <label>Informação adicional ${aditionalCount}</label>
                    </div>
                `);
            }
            
        }
    });
});

// Monitora quando é necessário incluir novo campo de Informação adicional vazio no modal Viagens
$(document).on("keyup", ".new-aditional", function(event) {
    let parentId = $(this).closest('.date-area').attr('id');
    let inputValue = $(this).val(); // Obtém o valor do input sem espaços extras

    // Pegando a lista de inputs dentro da mesma .aditional-list
    let aditionalList = $(this).closest('.aditional-list');
    let inputs = aditionalList.find('.new-aditional'); // Todos os inputs
    let lastInput = inputs.last(); // Último input
    let secondLastInput = inputs.eq(-2); // Penúltimo input

    // Se os dois últimos inputs estiverem vazios, remove o último
    if (inputs.length > 1 && lastInput.val() === "" && secondLastInput.val() === "") {
        lastInput.closest('.form').remove();
        inputs = aditionalList.find('.new-aditional'); // Atualiza a lista de inputs
    }

    // Atualiza a contagem de irmãos após possíveis remoções
    // Pegando a quantidade de irmãos no mesmo nível (dentro de .aditional-list)
    let siblingsCount = $(this).closest('.aditional-list').find('.form').length;
    siblingsCount += 1;

    // Se o último input não estiver vazio, adiciona um novo campo
    if (lastInput.val() !== "") {
        aditionalList.append(`
            <div class="form">
                <input class="new-aditional" type="text" autocomplete="off" placeholder=" ">
                <label>Informação adicional ${siblingsCount}</label>
            </div>
        `);
    }
});




// Lógica para atualização da seleção da viagem escolhida do usuário
function selectTravel(travelID){
    firebase.database().ref('users/'+firebase.auth().currentUser.uid).update({
        travel: travelID
    });
}


// Ativa o contador no cronômetro caso tenha o encontro "para sempre"
var firstUpdate = true;
function startCounter(days,hours,minutes,seconds) {
    setInterval(() => {
        seconds++;
        if(firstUpdate != true){
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            }
        
            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        
            if (hours >= 24) {
                hours = 0;
                days++;
            }
        }
        // Atualize os elementos na tela com os valores atualizados
        if($('[data-days]').html() != days || firstUpdate == true){
            $('[data-days]').html(days);
        }
        if($('[data-hours]').html() != hours || firstUpdate == true){
            $('[data-hours]').html(hours);
        }
        if($('[data-minutes]').html() != minutes || firstUpdate == true){
            $('[data-minutes]').html(minutes);
        }
        if($('[data-seconds]').html() != seconds || firstUpdate == true){
            $('[data-seconds]').html(seconds);
        }
        
        // console.log('contando');
        firstUpdate = false;

    }, 1000); // Executa a cada 1 segundo
}


function toggleDateEdit(id){
    $('#date'+id).toggleClass('editor');
}

function cancelDateEdit(id){

    $('#date'+id).toggleClass('editor');
}

// FUNÇÃO QUE SALVA A EDIÇÃO DE UM ENCONTRO
function updateDateDetails(dateID){
    var newDateCheckin = $('#date'+dateID+' .checkin-input').val();
    var newDateCheckout = $('#date'+dateID+' .checkout-input').val();
    var newDateAddress = $('#date'+dateID+' .address-input').val();
    var newDateComplement = $('#date'+dateID+' .complement-input').val();
    var newDateApto = $('#date'+dateID+' .apto-input').val();
    var newDateHost = $('#date'+dateID+' .host-input').val();
    
    // CONVERSÃO DAS DATAS PARA A DATA FORMATO YYYYMMDDHHmm DO BANCO
    var checkinInput = moment(newDateCheckin, 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');
    var checkoutInput = moment(newDateCheckout, 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');
    
    firebase.database().ref('dates/'+dateID).update({
        date: checkinInput
    });
    firebase.database().ref('dates/'+dateID+'/ticket/checkin/').update({
        date: checkinInput
    });
    if(newDateCheckout != "∞"){
        firebase.database().ref('dates/'+dateID+'/ticket/checkout/').update({
            date: checkoutInput
        });
    }
    firebase.database().ref('dates/'+dateID+'/ticket/').update({
        street: newDateAddress,
        streetComplement: newDateComplement,
        apto: newDateApto,
        host: newDateHost
    });
}

// FUNÇÃO QUE SALVA A EDIÇÃO DE UMA VIAGEM
function updateTravelDetails(travelID){
    var newTravelCheckin = $('#travel'+travelID+' .checkin-input').val();
    var newTravelCheckout = $('#travel'+travelID+' .checkout-input').val();
    var newTravelTitle = $('#travel'+travelID+' .title-input').val();
    var newTravelPlace = $('#travel'+travelID+' .place-input').val();
    var newTravelAddress = $('#travel'+travelID+' .address-input').val();

    var aditionalCount = $('#travel'+travelID+' .aditional-list input[aditional-id]').length;

    var newAditionals = $('#travel'+travelID+' .aditional-list input:not([aditional-id]):not(:placeholder-shown)');

    var aditionalIDs = $('#travel'+travelID+' .aditional-list input[aditional-id]');

    var aditionalArray = [];
    for(var x = 0; aditionalCount > x; x++){
        aditionalArray[x] = [];
        aditionalArray[x][0] = aditionalIDs.eq(x).attr('aditional-id');
        aditionalArray[x][1] = aditionalIDs.eq(x).val();
    }

    // CONVERSÃO DAS DATAS PARA A DATA FORMATO YYYYMMDDHHmm DO BANCO
    var checkinInput = moment(newTravelCheckin, 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');
    var checkoutInput = moment(newTravelCheckout, 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');

    firebase.database().ref('travels/'+travelID).update({
        checkin: checkinInput,
        checkout: checkoutInput,
        title: newTravelTitle,
        place: newTravelPlace,
        address: newTravelAddress
    });

    for (var a = 0; a < aditionalArray.length; a++) {
        var aditionalID = aditionalArray[a][0]; // Obtém o aditionalID do array
        var aditionalText = aditionalArray[a][1]; // Obtém o aditionalText do array
    
        if (aditionalText == "" || aditionalText == undefined) {
            firebase.database().ref('travels/' + travelID + '/aditionals/' + aditionalID).remove();
        } else {
            firebase.database().ref('travels/' + travelID + '/aditionals/' + aditionalID).update({
                text: aditionalText
            });
        }
    }
    
    
    if(newAditionals.length > 0){
        for(var a = 0; newAditionals.length > a; a++){
            var newAditionalText = newAditionals.eq(a).val();

            firebase.database().ref('travels/'+travelID+'/aditionals').push({
                text: newAditionalText
            });
        }
        
    };
    
    
}

// function createNewDate(checkin, checkout, address, complement, apto, host){
function createNewDate(){
    var firebaseLastDate = firebase.database().ref('dates').orderByKey().limitToLast(1);
    firebaseLastDate.once('value',function(dates){
        var dates = dates.val();
        var lastDate = Object.keys(dates);
        var lastDateID = lastDate[0];
        nextDateID = parseInt(lastDateID)+1;
        // console.log(nextDateID);

        var checkinDate = moment($('#checkin').val(), 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');
        var checkoutDate = moment($('#checkout').val(), 'YYYY-MM-DD'+'T'+'HH:mm').format('YYYYMMDDHHmm');

        var addressDate = $('#address').val();
        var complementDate = $('#complement').val();
        var aptoDate = $('#apto').val();
        var hostDate = $('#host').val();
        
        // ADICIONA NOVO ENCONTRO NA BASE COM O NOVO ID
        firebase.database().ref('dates/'+nextDateID).set({
            date: checkinDate
        }, (error) => {
            if (error) {
            //   console.log('Data could not be saved.' + error);
            }
        });
        firebase.database().ref('dates/'+nextDateID+'/ticket/').set({
            street: addressDate,
            apto: aptoDate,
            host: hostDate,
            streetComplement: complementDate
        }, (error) => {
            if (error) {
            //   console.log('Data could not be saved.' + error);
            }
        });
        
        firebase.database().ref('dates/'+nextDateID+'/ticket/checkin').set({
            date: checkinDate
        }, (error) => {
            if (error) {
            //   console.log('Data could not be saved.' + error);
            }
        });
        firebase.database().ref('dates/'+nextDateID+'/ticket/checkout').set({
            date: checkoutDate
        }, (error) => {
            if (error) {
            //   console.log('Data could not be saved.' + error);
            }
        });
        $('#checkin').val("");
        $('#checkout').val("");
        $('#address').val("");
        $('#complement').val("");
        $('#apto').val("");
        $('#host').val("");
        closeModal('new-date');

    });

}

function toggleAccordion(e) {
    var element = document.getElementById(e);
    element.classList.toggle("show");
}

function daysCount(startDay, endDay){
    var start = moment(startDay, 'YYYYMMDD');
    var end = moment(endDay, 'YYYYMMDD');
    return end.diff(start, 'days');
}

function updateTip(dateID, tipDate){
    var tipRef = firebase.database().ref('dates/'+dateID+'/tips/'+tipDate);

    tipRef.update({
        place: document.getElementById('list-tip-item-'+tipDate).innerHTML
    });
}

function sendMessage(type, message){
    var postsRef = firebase.database().ref().child('messages');
    var date = getLocalTime();

    postsRef.push().set({
        type: type,
        message: message,
        date: date,
        uid: firebase.auth().currentUser.uid
    })
    .then(() => {
        // Data saved successfully!
        // console.log("Enviado!");
      })
      .catch((error) => {
        // The write failed...
        // console.log("Deu ruim");
      });

    

    // $('#input').blur();
    $('#chatInput').text('');
    updateLastViewed();
}

// Configurando o input da página inicial para responsividade
function calcHeight(value) {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    // min-height + lines x line-height + padding + border
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    return newHeight;
}
$('.textarea').on('keyup', function(){
    if($(this).text().length == 0){
        $(this).text("");
    }
})
  


// FAZ QUALQUER LINK VIRAR LINK DENTRO DO ARQUIVO
function linkify(str) {
    var newStr = str.replace(/(<a href=")?((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)))(">(.*)<\/a>)?/gi, function () {
        return '<a href="' + arguments[2] + '" target="_blank">' + (arguments[7] || arguments[2]) + '</a>'
    });
    // $('.messages').html("");
    $('div').html(newStr); //fill output area
}

$(document.getElementById("chatInput")).keypress(function(event) {
    // EVITA COLOCAR ESPAÇO COMO PRIMEIRO CARACTER
    if (event.keyCode == 32 & $('#chatInput').text().length == 0){
        return false;
    }
    if(event.which == 13) {
        event.preventDefault();
        // alert('You pressed enter!');
        var message = $('#chatInput').text();
        if($('#chatInput').text().length >0){
            sendMessage("message", message);
        }
    }
});

$(document.getElementById("memoryInput")).keypress(function(event) {
    // EVITA COLOCAR ESPAÇO COMO PRIMEIRO CARACTER
    if (event.keyCode == 32 & $('#memoryInput').text().length == 0){
        return false;
    }
    if(event.which == 13) {
        event.preventDefault();
        // alert('You pressed enter!');
        var message = $('#memoryInput').text();
        if($('#memoryInput').text().length >0){
            newMemory();
        }
    }
});

$(document.getElementById("interestInput")).keypress(function(event) {
    // EVITA COLOCAR ESPAÇO COMO PRIMEIRO CARACTER
    if (event.keyCode == 32 && $('#interestInput').text().length == 0){
        return false;
    }
    if(event.which == 13) {
        event.preventDefault();
        // alert('You pressed enter!');
        var message = $('#interestInput').text();
        if($('#interestInput').text().length >0){
            newInterest();
        }
    }
});

let ignoreFocusout = false;

$(document).on("keypress", ".memories-list .memory", function(event) {
    if (event.which === 13) {
        event.preventDefault();
        
        var travelID = $(this).closest('[travel-id]').attr('travel-id');
        var memoryID = $(this).attr('memory-id');
        var text = $(this).text();

        ignoreFocusout = true;
        updateMemory(travelID, memoryID, text);
        
        $(':focus').blur(); // remove o foco para forçar o focusout, se quiser

        setTimeout(() => {
            ignoreFocusout = false; // limpa o flag
        }, 100); // espera curto para evitar conflitos
    }
});

$(document).on("focusout", ".memories-list .memory", function(event) {
    if (ignoreFocusout) return; // impede chamada duplicada

    var travelID = $(this).closest('[travel-id]').attr('travel-id');
    var memoryID = $(this).attr('memory-id');
    var text = $(this).text();

    updateMemory(travelID, memoryID, text);
});


$(document).on("focus", ".memories-list .memory", function(event) {
    var memoryID = $(this).attr('memory-id');
    removeQuotations(memoryID);
});


$(document).on("keypress", ".interests-list .interest", function(event) {
    if (event.which === 13) {
        event.preventDefault();
        
        var travelID = $(this).closest('[travel-id]').attr('travel-id');
        var interestID = $(this).attr('interest-id');
        var text = $(this).find('.textarea').text();

        ignoreFocusout = true;
        updateInterest(travelID, interestID, text);
        
        $(':focus').blur(); // remove o foco para forçar o focusout, se quiser

        setTimeout(() => {
            ignoreFocusout = false; // limpa o flag
        }, 100); // espera curto para evitar conflitos
    }
});

// Atualiza o Interesse no focusOut
$(document).on("focusout", ".interests-list .interest", function(event) {
    if (ignoreFocusout) return; // impede chamada duplicada
    
    var travelID = $(this).closest('[travel-id]').attr('travel-id');
    var interestID = $(this).attr('interest-id');
    var text = $(this).find('.textarea').text();

    updateInterest(travelID, interestID, text);
});


function toggleModal(id) {
    var modal = $("#" + id);
    var button = $(".fast-access .button." + id);

    if (modal.hasClass("opened") || button.hasClass("selected")) {
        // Adiciona a classe de fechamento
        modal.removeClass("opened").addClass("closing");
        button.removeClass("selected");

        // Aguarda o tempo da animação antes de remover a opacidade
        setTimeout(() => {
            modal.css("opacity", "0");
        }, 300); // Tempo igual ao da animação
    } else {
        // Fecha qualquer outro modal aberto antes de abrir um novo
        $(".fast-access .button").removeClass("selected");
        $(".new-modal-area").removeClass("opened closing").css("opacity", "0");

        // Abre o novo modal
        modal.css("opacity", "1").addClass("opened");
        button.addClass("selected");
    }
}



// function closeModal(i){
//     document.getElementById(i).style.display = "none";
//     $(".fast-access .button.selected").removeClass("selected");
// }

// function checkNextTip(){
//     // QUANDO FOR ELA
//     if(firebase.auth().currentUser.uid == "LwoAoQuKVOOii83IoZAuDdi1OI42"){
//     }
//     // QUANDO FOR EU
//     else if(firebase.auth().currentUser.uid == "skSzuAFRskQmMjfdcV3p4RhU5RE2"){
//         alert('Ele');
//     }
// }

// EVITA O ZOOM
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

function playSound(filename){
    var mp3Source = '<source src="sound/' + filename + '.mp3" type="audio/mpeg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3">';
    document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + mp3Source + embedSource + '</audio>';
}

var lastDateID;
var firstRead = true;

// Lógica da lista de checklist
var firebaseLastDate = firebase.database().ref('dates').orderByKey().limitToLast(1);
firebaseLastDate.on('value',function(dates){
    var dates = dates.val();
    var lastDate = Object.keys(dates);
    lastDateID = lastDate[0];
    lastDate = dates[lastDate];
    // console.log(lastDate);

    if(firstRead == true){
        
        if(lastDate.ticket != undefined){
            var checkinDate = moment(lastDate.ticket.checkin.date, 'YYYYMMDDHHmmss').format('YYYYMMDD');
            var checkoutDate = moment(lastDate.ticket.checkout.date, 'YYYYMMDDHHmmss').format('YYYYMMDD');
        }

        if(checkoutDate >= moment().format('YYYYMMDD') && checkinDate > moment().subtract(8,'days').format('YYYYMMDD') && lastDate.ticket != undefined){
            // POPULA O TICKET
            var firebaseDateTicket = firebase.database().ref('dates/'+lastDateID+'/ticket');
            firebaseDateTicket.on('value',function(ticket){
                var ticket = ticket.val();
                // console.log(ticket);
                
                var checkinDate = ticket.checkin.date;
                var checkinDay = moment(checkinDate, 'YYYYMMDDHHmmss').format('DD');
                var checkinMonth = moment(checkinDate, 'YYYYMMDDHHmmss').format('MMM');
                var checkinTime = moment(checkinDate, 'YYYYMMDDHHmmss').format('HH:mm');

                var checkoutDate = ticket.checkout.date;
                var checkoutDay = moment(checkoutDate, 'YYYYMMDDHHmmss').format('DD');
                var checkoutMonth = moment(checkoutDate, 'YYYYMMDDHHmmss').format('MMM');
                var checkoutTime = moment(checkoutDate, 'YYYYMMDDHHmmss').format('HH:mm');

                var hostName = ticket.host;
                var street = ticket.street;
                var apto = ticket.apto;
                var streetComplement = ticket.streetComplement;
                var wazeLink = ticket.wazeLink;
                var uberLink = ticket.uberLink;

                var infos = ticket.infos;

                document.getElementById('checkin-month').innerHTML = checkinMonth;
                document.getElementById('checkin-day').innerHTML = checkinDay;

                document.getElementById('checkout-month').innerHTML = checkoutMonth;
                document.getElementById('checkout-day').innerHTML = checkoutDay;

                document.getElementById('checkin-date').innerHTML = moment(checkinDate, 'YYYYMMDDHHmmss').format('ddd')+', '+checkinDay+' de '+checkinMonth;
                document.getElementById('checkin-time').innerHTML = checkinTime;

                document.getElementById('checkout-date').innerHTML = moment(checkoutDate, 'YYYYMMDDHHmmss').format('ddd')+', '+checkoutDay+' de '+checkoutMonth;
                document.getElementById('checkout-time').innerHTML = checkoutTime;

                document.getElementById('host-name').innerHTML = hostName;
                document.getElementById('apto-info').innerHTML = apto;

                document.getElementById('address-complement').innerHTML = street+', '+apto+' <br>'+streetComplement;
                document.getElementById('waze-button').href = wazeLink;
                document.getElementById('uber-button').href = uberLink;

                document.getElementById('more-info-area').innerHTML = "";
                for(var i in infos){
                    var info = infos[i];
                    var title = info.title;
                    var content = info.content;

                    $('#more-info-area').append('<div class="more-info"><span class="title">'+title+'</span><span class="content">'+content+'</span></div>');
                }

            });
        }
        else{
            if(document.getElementById('ticket-button') != null){
                document.getElementById('ticket-button').remove();
            }
            
        }
        if(checkinDate >= moment().format('YYYYMMDD') || checkoutDate >= moment().format('YYYYMMDD') || lastDate >= moment().format('YYYYMMDD')){

            // LISTA COMPARTILHADA
            var firebaseLastDateReminder = firebase.database().ref('dates/'+lastDateID+'/reminder-list/shared');
            firebaseLastDateReminder.on('value',function(list){
                var list = list.val();
                // console.log(list);

                $('#reminder-list #ourPendingItens').html("");
                $('#reminder-list #ourDoneItens').html("");

                if(list == null){
                    $('#reminder-list #ourPendingItens').append('<span style="display:block;text-align:center;" class="none">Não existem itens 🥺</span>')
                }

                for(var l in list){
                    var item = list[l];

                    var itemID = l;
                    var itemName = item.description;
                    var itemDone = item.done;
                    // console.log(itemID);

                    if(itemDone == false){
                        $('#reminder-list #ourPendingItens').append(
                            `<span class="item">
                                <svg onclick="completeItem('${lastDateID}', '${itemID}', 'shared')" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 3C9.72 3 3 9.72 3 18C3 26.28 9.72 33 18 33C26.28 33 33 26.28 33 18C33 9.72 26.28 3 18 3ZM18 30C11.37 30 6 24.63 6 18C6 11.37 11.37 6 18 6C24.63 6 30 11.37 30 18C30 24.63 24.63 30 18 30Z" fill="white"/>
                                </svg>
                                <span rows="1" class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', 'shared')" value="${itemName}" contenteditable>${itemName}</span>
                            </span>`
                        );
                    }
                    else{
                        $('#reminder-list #ourDoneItens').append(
                            `<span class="item">
                                <svg onclick="pendentItem('${lastDateID}', '${itemID}', 'shared')" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 10.5C13.86 10.5 10.5 13.86 10.5 18C10.5 22.14 13.86 25.5 18 25.5C22.14 25.5 25.5 22.14 25.5 18C25.5 13.86 22.14 10.5 18 10.5ZM18 3C9.72 3 3 9.72 3 18C3 26.28 9.72 33 18 33C26.28 33 33 26.28 33 18C33 9.72 26.28 3 18 3ZM18 30C11.37 30 6 24.63 6 18C6 11.37 11.37 6 18 6C24.63 6 30 11.37 30 18C30 24.63 24.63 30 18 30Z" fill="white"/>
                                </svg>
                                <span rows="1" class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', 'shared')" value="${itemName}" contenteditable>${itemName}</span>
                            </span>`
                        );
                    }
                    // console.log(item);
                }
                
            });


            // LISTA INDIVIDUAL
            var firebaseLastDateReminder = firebase.database().ref('dates/'+lastDateID+'/reminder-list/'+firebase.auth().currentUser.uid);
            firebaseLastDateReminder.on('value',function(list){
                var list = list.val();
                // console.log(list);

                $('#reminder-list #myPendingItens').html("");
                $('#reminder-list #myDoneItens').html("");

                if(list == null){
                    $('#reminder-list #myPendingItens').append('<span style="display:block;text-align:center;" class="none">Não existem itens 🥺</span>')
                }

                for(var l in list){
                    var item = list[l];

                    var itemID = l;
                    var itemName = item.description;
                    var itemDone = item.done;
                    // console.log(itemID);

                    if(itemDone == false){
                        $('#reminder-list #myPendingItens').append(
                            `<span class="item">
                                <svg onclick="completeItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 3C9.72 3 3 9.72 3 18C3 26.28 9.72 33 18 33C26.28 33 33 26.28 33 18C33 9.72 26.28 3 18 3ZM18 30C11.37 30 6 24.63 6 18C6 11.37 11.37 6 18 6C24.63 6 30 11.37 30 18C30 24.63 24.63 30 18 30Z" fill="white"/>
                                </svg>
                                <span rows="1" class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" value="${itemName}" contenteditable>${itemName}</span>
                            </span>`
                        );
                    }
                    else{
                        $('#reminder-list #myDoneItens').append(
                            `<span class="item">
                                <svg onclick="pendentItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 10.5C13.86 10.5 10.5 13.86 10.5 18C10.5 22.14 13.86 25.5 18 25.5C22.14 25.5 25.5 22.14 25.5 18C25.5 13.86 22.14 10.5 18 10.5ZM18 3C9.72 3 3 9.72 3 18C3 26.28 9.72 33 18 33C26.28 33 33 26.28 33 18C33 9.72 26.28 3 18 3ZM18 30C11.37 30 6 24.63 6 18C6 11.37 11.37 6 18 6C24.63 6 30 11.37 30 18C30 24.63 24.63 30 18 30Z" fill="white"/>
                                </svg>
                                <span rows="1" class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" value="${itemName}" contenteditable>${itemName}</span>
                            </span>`
                        );
                    }
                    // console.log(item);
                }
            });

        }
        else{
            if(document.getElementById('dateButtons') != null){
                document.getElementById('dateButtons').remove();
            }
        }
        var chevronSVG = `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_555_17493)"><path d="M15.8333 9.5L13.6008 11.7325L20.8525 19L13.6008 26.2675L15.8333 28.5L25.3333 19L15.8333 9.5Z" fill="white"/></g></svg>`;
        // if(moment().format('YYYYMMDD') > checkoutDate){
        //     document.getElementById('text').innerHTML = "Quando será o próximo? "+chevronSVG;
        // }
        // resizeMessageBox();
        
    } else firstRead = false;
    updateLastViewed();

});


// ATUALIZA A ÚLTIMA VISUALIZAÇÃO DE CADA UM PARA O OUTRO
function updateLastViewed(){
    var lastViewRef = firebase.database().ref('lastView');
    var user = firebase.auth().currentUser.uid;
    
    // QUANDO FOR PARA MIM (QUANDO FOR ELA)
    if(user == "LwoAoQuKVOOii83IoZAuDdi1OI42"){
        lastViewRef.update({
            // GRAVA O VALOR QUE ELA PRECISA SABER
            skSzuAFRskQmMjfdcV3p4RhU5RE2: getLocalTime()
        });
    }
    
    // QUANDO FOR PARA ELA (QUANDO FOR EU)
    else if(user == "skSzuAFRskQmMjfdcV3p4RhU5RE2"){
        lastViewRef.update({
            // GRAVA O VALOR QUE EU PRECISO SABER
            LwoAoQuKVOOii83IoZAuDdi1OI42: getLocalTime()
        });
    }
}

// ATUALIZA TELA TODA VEZ QUE STATUS ATUALIZA NO BD
firebase.database().ref('lastView').on('value',function(l){
    var date = l.val()[firebase.auth().currentUser.uid];

    var since = moment(date, 'YYYYMMDDHHmmss').fromNow();

    // console.log(since);
    // ATUALIZA O ENDEREÇO COM A INFORMAÇÃO DO BANCO
    $('#lastView').html(since);

    var timeUnit = since.split(" ").splice(-1)[0];
    var color;
    // console.log(timeUnit);
    switch(timeUnit){
        case "segundos":
        case "minuto":
        case "minutos":
        case "hora":
            color = '3dfa4f';
            break;

        case "horas":
        case "dia":
        case "dias":
            color = "f6fa3d";
            break;

        default:
            color = "ffffff6b";
            break;
    }
    $('#lastViewDot').attr('style','background:#'+color);
})

function addItem(dateID, actualList, reminderAddress){
    actualList = actualList.charAt(0).toUpperCase()+actualList.substr(1).toLowerCase();
    var lastDateRef = firebase.database().ref().child('dates/'+dateID+'/reminder-list/'+reminderAddress);
    var description = document.getElementById('add'+actualList+'Item').value;
    if(description == undefined){
        description = document.getElementById('add'+actualList+'Item').innerHTML;
    }

    var date = getLocalTime();

    lastDateRef.push().set({
        description: description,
        date: date,
        done: false,
        uid: firebase.auth().currentUser.uid
    }).then(function(){
        document.getElementById('add'+actualList+'Item').innerHTML = "";
    });
    // $('#input').blur();
}

function completeItem(dateID, itemID, reminderAddress){
    firebase.database().ref('dates/'+dateID+'/reminder-list/'+reminderAddress+'/'+itemID).update({
        done: true
    });
}

function pendentItem(dateID, itemID, reminderAddress){
    firebase.database().ref('dates/'+dateID+'/reminder-list/'+reminderAddress+'/'+itemID).update({
        done: false
    });
}

function updateItem(dateID, itemID, reminderAddress){
    var itemText = $('#list-item-'+itemID).html();
    var itemText = document.getElementById('list-item-'+itemID).innerHTML;
    // REMOVE ESPAÇO VAZIO
    itemText = itemText.trim();

    // DELETA CASO O ITEM ATUALIZE VAZIO
    if(itemText == ""){
        firebase.database().ref('dates/'+dateID+'/reminder-list/'+reminderAddress+'/'+itemID).remove();
    }
    else{
        firebase.database().ref('dates/'+dateID+'/reminder-list/'+reminderAddress+'/'+itemID).update({
            description: itemText
        });
    }
}


// firebase.database().ref('messages').orderByKey().limitToLast(1).once('value', function(l){})

$(document.getElementById("input")).keypress(function(event) {
    // EVITA COLOCAR ESPAÇO COMO PRIMEIRO CARACTER
    if (event.keyCode == 13 & $('#input').val().length == 0){
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

$(document.getElementById("addOurItem")).keypress(function(event) {
    if(event.which == 13 && document.getElementById("addOurItem").value != "") {
        // alert('You pressed enter!');
        addItem(lastDateID, 'our', 'shared');
    }
});

$(document.getElementById("addMyItem")).keypress(function(event) {
    if(event.which == 13 && document.getElementById("addMyItem").value != "") {
        // alert('You pressed enter!');
        addItem(lastDateID, 'my', firebase.auth().currentUser.uid);
    }
});

// TIRA O FOCO AO ESTAR EDITANDO UM ITEM DA LISTA E APERTAR O ENTER
function checkKeypress(e){
    if (e.keyCode == 13) {
        // console.log('enter apertado!');
        $('#addOurItem, #addMyItem').focus();
        $('#addOurItem, #addMyItem').blur();
        return false;
    }
}

function focusListTab(id){
    $('#tabList span').removeClass('active');
    $(`#${id}Tab`).addClass('active');
    // document.getElementsByClassName('principal-list').style.display = "none";
    $('.principal-list').css('display', 'none');
    document.getElementById(`${id}`).style.display = "block";
};

firebase.database().ref('heart-status/').on('value',function(h){
    var val = h.val();
    var level = val.level;
    var lastAction = val.lastAction;
    var lastUserLevel = val.lastUserLevel;
    
    if(level == undefined || lastAction == undefined || lastUserLevel == undefined){
        setNewParametersVersion();
    }

    var now = moment().format('YYYYMMDDHHmmss');

    var start = moment(lastAction, 'YYYYMMDDHHmmss');
    var end = moment(now, 'YYYYMMDDHHmmss');

    // Calcula quanto tempo faz desde a última interação de alguém
    var lastActionHours = end.diff(start, 'hours');

    // Parâmetro de tempo usado para regredir e atualizar o estado
    var timeVariation = 8; // 8 hours

    var nextLevel = 0;
    var correctLevel = 0;

    // Verifica se o status do usuário está condizendo com o status do coração
    // levando em consideração o parâmetro de timeVariation para atualizar para
    // o estado correto
    if(parseInt(lastActionHours / timeVariation) > 0 || level < 12){
        correctLevel = lastUserLevel - parseInt(lastActionHours / 8);
        if(correctLevel < 0){
            correctLevel = 0;
        }
        nextLevel = correctLevel+1;
    }
    else{
        correctLevel = level;
        nextLevel = null;
    }

    // Chove corações por 2 horas depois que ele for totalmente restaurado
    if(level == 12 && lastActionHours < 2){
        setInterval(createHeart, 60);
        $('#ekg-area').attr('bonus-rainning', 'on');
    }
    else{
        $('#ekg-area').attr('bonus-rainning', 'off');
    }

    var actualUser = firebase.auth().currentUser.uid;

    $('#ekg-area').attr('class','level-'+correctLevel);
    $('#ekg-area').attr('onclick','levelUpEKG('+nextLevel+', "'+actualUser+'")');

    if(level != correctLevel && correctLevel >= 0){
        firebase.database().ref('heart-status/').update({
            level: correctLevel
        });
    }
    
});

function toggleFeelingWindow(){
    $('#actionFeeling').toggleClass('on');
}

function toggleClass(id, Class){
    $('#'+id).toggleClass(Class);
}

function newMemory(){
    var text = $('#memoryInput').text();
    var travelID = $('.travel [travel-id]').attr('travel-id');

    firebase.database().ref('travels/'+travelID+'/memories/').push({
        text: text
    });

    // Limpa o campo de texto no front
    $('#memoryInput').text("");

}
function updateMemory(travelID, memoryID, text){
    if(text == ""){
        firebase.database().ref('travels/'+travelID+'/memories/'+memoryID).remove();
    }
    else{
        $("span[memory-id='"+memoryID+"']").prepend('"');
        $("span[memory-id='"+memoryID+"']").append('"');
        firebase.database().ref('travels/'+travelID+'/memories/'+memoryID).update({
            text: text
        });
    }

}
function removeQuotations(memoryID){
    var text = $("span[memory-id='"+memoryID+"']").text();

    text = text.replace(new RegExp('"', 'g'),'');
    $("span[memory-id='"+memoryID+"']").text(text);
}

function toggleInterest(travelID, interestID, state){
    firebase.database().ref('travels/'+travelID+'/interests/'+interestID).update({
        done: state
    });
}

function newInterest(){
    var text = $('#interestInput').text();
    var travelID = $('.travel [travel-id]').attr('travel-id');

    firebase.database().ref('travels/'+travelID+'/interests/').push({
        text: text,
        done: 0
    });

    // Limpa o campo de texto no front
    $('#interestInput').text("");

}
function updateInterest(travelID, interestID, text){
    if(text == ""){
        firebase.database().ref('travels/'+travelID+'/interests/'+interestID).remove();
    }
    else{
        firebase.database().ref('travels/'+travelID+'/interests/'+interestID).update({
            text: text
        });
    }

}

// var since = moment(date, 'YYYYMMDDHHmmss').fromNow();

// Heart Levels
//heart   status
// 0    -   0
//          1
//          2
// 1    -   3
//          4
//          5
// 2    -   6
//          7
//          8
// 3    -   9
//          10
//          11
// 4    -   12

// openModal('checkin-ticket');
// openModal('reminder-list');
// openModal('dates');
// openModal('new-date');
// createNewDate();

window.addEventListener("DOMContentLoaded", function () {
    const fastAccess = document.querySelector(".fast-access");

    if (!fastAccess) {
        console.warn(".fast-access não encontrada no DOM.");
        return;
    }

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            // console.log("Tamanho mudou:", entry.contentRect.width, "x", entry.contentRect.height);

            // Conta apenas os filhos visíveis dentro da fast-access
            const visibleItems = $('.fast-access').children(':visible').length;

            // Quando tiver 4 botões visíveis
            if (visibleItems === 4) {
                if (entry.contentRect.width <= 440) {
                    $('.fast-access .remaining-days .seconds').hide();
                } else {
                    $('.fast-access .remaining-days .seconds').show();
                }

                if (entry.contentRect.width <= 380) {
                    $('.fast-access .remaining-days .minutes').hide();
                } else {
                    $('.fast-access .remaining-days .minutes').show();
                }
            }

            // Quando tiver 3 botões visíveis
            if (visibleItems === 3) {
                if (entry.contentRect.width <= 382) {
                    $('.fast-access .remaining-days .seconds').hide();
                } else {
                    $('.fast-access .remaining-days .seconds').show();
                }
            }
        }
    });

    resizeObserver.observe(fastAccess);
});
