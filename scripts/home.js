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

    if(lastObjectType == type && lastObjectMessage == message && lastObjectUID == firebase.auth().currentUser.uid){
        firebase.database().ref('messages/' + lastObjectID).update({
            count: lastObjectCount+1
        });
    }else{
        sendMessage(type, message);
    }
    updateLastViewed();
}


var firstLoad = 1;

// CARREGA AS MENSAGENS DO BANCO DE DADOS
var firebaseMessages = firebase.database().ref('messages').limitToLast(80);
firebaseMessages.on('value',function(messages){
    var messages = messages.val();

    if(firstLoad == 1){
        firstLoad = 0;
    }else playSound('pop');
    
    if(messages == null){
        document.getElementById('messages').innerHTML = '<center><p style="color:#f10935;font-weight:600;">Não existem mensagens aqui 🥺</p></center>';
    }
    else{
        document.getElementById('messages').innerHTML = '';
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

        like = message.like == true ? "like" : "";
        // console.log(like);
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
                feelingPT = ` beijo ${kissSVG}`;
                feelingsPT = ` beijos ${kissSVG}`;
            }
            else if(msg == "heart"){
                feelingPT = ` carinho ${heartSVG}`;
                feelingsPT = ` carinhos ${heartSVG}`;
            }
            else if(msg == "bite"){
                feelingPT = `a mordida ${biteSVG}`;
                feelingsPT = ` mordidas ${biteSVG}`;
            }
            // console.log(feelingPT);

            if(message.count > 0){
                var msgCount = message.count;
            } else var msgCount = 1;

            // VERIFICA SE O ID É IGUAL AO DA AÇÃO
            if(uid == firebase.auth().currentUser.uid){
                var status = "sent";
                var statusPT = "enviou";

                // QUANDO É MAIS DE UMA AÇÃO IGUAL, É SOMADO
                if(msgCount>1){
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since} &nbsp;</b>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}</p></span>`);
                    // $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since} <span class="status-icon" id="status" class="status">${checkSent}</span>&nbsp;</b>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}</p></span>`);
                }
                // QUANDO É SÓ UMA ACÃO
                else{
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since} &nbsp;</b>Você ${statusPT} um${feelingPT}</p></span>`);
                    // $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since} <span class="status-icon" id="status" class="status">${checkSent}</span>&nbsp;</b>Você ${statusPT} um${feelingPT}</p></span>`);
                }
            }
            else{
                var status = "received";
                var statusPT = "recebeu";

                // QUANDO É MAIS DE UMA AÇÃO IGUAL, É SOMADO
                if(msgCount>1){
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}&nbsp;<b>${since}</b></p></span>`);
                }
                // QUANDO É SÓ UMA ACÃO
                else{
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p>Você ${statusPT} um${feelingPT}&nbsp;<b>${since}</b></p></span>`);
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
            $('#messages').prepend(`<span data-id="${id}" data-uid="${uid}" class="message ${status} ${like}"><p>${msg}<b>${since} </b></p></span>`);
            // $('#messages').prepend(`<span data-id="${id}" data-uid="${uid}" class="message ${status} ${like}"><p>${msg}<b>${since} <span class="status-icon" class="status">${checkSent}</span></b></p></span>`);
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

    // resizeMessageBox();
    checkOnlineStatus();
});

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


// PREENCHE O MODAL DE CONTROLE DE ENCONTROS
var firebaseDate = firebase.database().ref('dates').orderByKey();
firebaseDate.on('value',function(dates){
    var dates = dates.val();
    // console.log(dates);

    if(firebase.auth().currentUser.uid == "skSzuAFRskQmMjfdcV3p4RhU5RE2"){
        $('#dates-area').removeClass('viewer');
        // $('#dates-area').addClass('editor');
    }


    $('#dates-area').empty();

    var togetherSum = 0;
    $('#togetherSum').html("");

    for(var d in dates){
        var date = dates[d];

        var checkin = moment(date.date, 'YYYYMMDDHHmm').format('DD/MMM/YY');

        var checkinInput = moment(date.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD'+'T'+'HH:mm');

        var ticket = (date.ticket === undefined) ? "" : date.ticket;
        var checkout = (ticket.checkout.date === undefined) ? "" : moment(ticket.checkout.date, 'YYYYMMDDHHmm').format('DD/MMM/YY');

        var checkoutInput = (ticket.checkout.date === undefined) ? "" : moment(ticket.checkout.date, 'YYYYMMDDHHmm').format('YYYY-MM-DD'+'T'+'HH:mm');

        var host = (ticket.host === undefined) ? "" : ticket.host;
        var hostShow = (ticket.host === undefined) ? "hide-toggle" : ticket.host;

        var street = (ticket.street === undefined) ? "" : ticket.street;
        var streetShow = (ticket.street === undefined) ? "hide-toggle" : ticket.street;

        var streetComplement = (ticket.streetComplement === undefined) ? "" : ticket.streetComplement;
        var streetComplementShow = (ticket.streetComplement === undefined) ? "hide-toggle" : ticket.streetComplement;

        var apto = (ticket.apto === undefined) ? "" : ticket.apto;
        var aptoShow = (ticket.apto === undefined) ? "hide-toggle" : ticket.apto;

        var start = moment(date.date, 'YYYYMMDD');
        var end = moment(ticket.checkout.date, 'YYYYMMDD');
        var together = end.diff(start, 'days')+1;

        // console.log(date);

        $('#dates-area').prepend(`
            <div class="date" id="date${d}">
                <span class="item" onclick="toggleAccordion('date${d}')">
                    <span class="meeting-num">${d}</span>
                    <p class="range">${checkin} - ${checkout} (${together} dias)</p>
                    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                    </svg>
                </span>
                <span class="details">
                    <label>Checkin</label>
                    <input type="datetime-local" class="checkin-input" value="${checkinInput}">
                    <label>Checkout</label>
                    <input type="datetime-local" class="checkout-input" value="${checkoutInput}">
                    <!-- <h5>Ticket</h5> -->
                    <span class="ticket">
                        <label class=${streetShow}>Endereço</label>
                        <input class="${streetShow} address-input" type="text" placeholder="Coloque o endereço" value="${street}">
                        <label class=${streetComplementShow}>Complemento</label>
                        <input class="${streetComplementShow} complement-input" type="text" placeholder="Coloque o complemento" value="${streetComplement}">
                        <label class="${aptoShow}">Apto</label>
                        <input class="${aptoShow} apto-input" type="text" placeholder="Coloque o apartamento" value="${apto}">
                        <label class="${hostShow}">Anfitrião</label>
                        <input class="${hostShow} host-input" type="text" placeholder="Coloque o anfitrião" value="${host}">
                        <div class="buttons-area">
                            <button class="button edit" onclick="toggleDateEdit(${d})">Editar</button>
                            <button class="button cancel" onclick="cancelDateEdit(${d})">Cancelar</button>
                            <button class="button save" onclick="updateDateDetails(${d})">Salvar</button>
                        </div>
                    </span>
                </span>
            </div>
        `);
        togetherSum += together;

    }
    $('#togetherSum').html("Já são <b>"+togetherSum+" dias</b> juntinhos");
    $('#text').append("<br><span>Já são <b>"+togetherSum+" dias</b> juntinhos</span>");

});

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
    firebase.database().ref('dates/'+dateID+'/ticket/checkout/').update({
        date: checkoutInput
    });
    firebase.database().ref('dates/'+dateID+'/ticket/').update({
        street: newDateAddress,
        streetComplement: newDateComplement,
        apto: newDateApto,
        host: newDateHost
    });
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
    return end.diff(start, 'days')+1;
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
    $('#input').val('');
    updateLastViewed();
}


// FAZ QUALQUER LINK VIRAR LINK DENTRO DO ARQUIVO
function linkify(str) {
    var newStr = str.replace(/(<a href=")?((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)))(">(.*)<\/a>)?/gi, function () {
        return '<a href="' + arguments[2] + '" target="_blank">' + (arguments[7] || arguments[2]) + '</a>'
    });
    // $('.messages').html("");
    $('div').html(newStr); //fill output area
}

$(document.getElementById("input")).keypress(function(event) {
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

function openModal(id){
    document.getElementById(id).style.display = "block";
}
function closeModal(i){
    document.getElementById(i).style.display = "none";
}

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
        if(moment().format('YYYYMMDD') > checkoutDate){
            document.getElementById('text').innerHTML = "Quando será o próximo? "+chevronSVG;
        }
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




// openModal('checkin-ticket');
// openModal('reminder-list');
// openModal('dates');
// openModal('new-date');
// createNewDate();

function toggleFuture(){
    $('.future-modal').toggleClass('hide');
}