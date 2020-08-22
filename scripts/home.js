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
            resizeMessageBox();
        }
    }
    if(finished == 1){
        $('#flipdown').addClass('hide');
        $('#text').text("Aproveitem cada segundinho juntos");
        resizeMessageBox();
        // $('#text').text("Quando vai ser o próximo encontro?");
    }else{
        $('#flipdown').removeClass('hide');
        $('#text').text("para nos encontrar.");
        resizeMessageBox();
    }

    // var data = $('#page').html(); //get input (content)
    // TODO: ARRUMAR O CONVERSOR DE QUALQUER TEXTO PARA LINK
    // linkify(data); //run function on content

});


function resizeMessageBox(){
    // FIXA O TAMANHO DO BOX DE MENSAGENS
    var topSize = window.screen.height-($('#clock').outerHeight()+$('#action-area').outerHeight())-$('#header').outerHeight()-parseInt($('#interactions').css("padding-top"))-parseInt($('#messages').css("padding-top"));
    $('#messages').css('max-height',topSize-45);
}


document.getElementsByTagName("body")[0].onresize = function() {resizeMessageBox()};


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
}


var firstLoad = 1;

var firebaseMessages = firebase.database().ref('messages').limitToLast(80);
firebaseMessages.on('value',function(messages){
    var messages = messages.val();

    if(firstLoad == 1){
        firstLoad = 0;
    }else playSound('pop');
    
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

        like = message.like == true ? "like" : "";
        // console.log(like);
        var feelingPT = "";

        var since = moment(date, 'YYYYMMDDHHmmss').fromNow();

        var heartSVG = `<svg width="19" height="19" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 26.6875L13.1875 25.0375C6.75 19.2 2.5 15.35 2.5 10.625C2.5 6.775 5.525 3.75 9.375 3.75C11.55 3.75 13.6375 4.7625 15 6.3625C16.3625 4.7625 18.45 3.75 20.625 3.75C24.475 3.75 27.5 6.775 27.5 10.625C27.5 15.35 23.25 19.2 16.8125 25.05L15 26.6875Z" fill="#f10935"/></svg>`;
        var kissSVG = `<svg width="19" height="19" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.20392 14.1311C4.94785 15.7529 3.58586 20.7112 4.12522 21.3584C4.66457 22.0057 5.51055 22.362 7.57709 20.927C11.4604 18.2302 11.0265 16.4766 12.3234 15.5334C13.51 14.6704 14.2651 15.4255 15.8832 14.4547C17.5012 13.4838 16.6383 12.9445 18.0406 11.9737C19.4429 11.0028 19.8744 11.4343 23.1105 10.3556C25.6994 9.49262 25.4837 8.41391 25.268 7.55094C25.0522 6.68797 21.7082 5.60926 19.8744 5.0699C17.4673 4.36194 15.6674 3.45184 13.9415 4.42268C12.5094 5.2282 13.2943 6.36436 11.9998 7.44307C10.7054 8.52178 9.73451 7.22732 8.00857 8.09029C6.28264 8.95326 5.52754 12.0815 5.20392 14.1311Z" fill="#f10935"/><path d="M20.5216 23.0844C26.2388 19.4168 26.886 10.7871 26.3467 10.3556C25.8073 9.9241 23.4126 10.6145 22.0318 11.2186C20.3059 11.9737 19.0114 15.2098 17.3934 16.2885C15.7753 17.3672 13.2943 16.9357 10.5975 19.201C8.44006 21.0132 6.71412 22.7608 6.92986 23.5159C7.14561 24.271 14.8044 26.752 20.5216 23.0844Z" fill="#f10935"/></svg>`;
        
        if(type == "feeling"){
            if(msg == "kiss"){
                feelingPT = `beijo ${kissSVG}`;
                feelingsPT = `beijos ${kissSVG}`;
            }
            else if(msg == "heart"){
                feelingPT = `carinho ${heartSVG}`;
                feelingsPT = `carinhos ${heartSVG}`;
            }
            // console.log(feelingPT);

            if(message.count > 0){
                var msgCount = message.count;
            } else var msgCount = 1;

            if(uid == firebase.auth().currentUser.uid){
                var status = "sent";
                var statusPT = "enviou";

                if(msgCount>1){
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since}&nbsp;</b>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}</p></span>`);
                }
                else{
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p><b>${since}&nbsp;</b>Você ${statusPT} um ${feelingPT}</p></span>`);
                }
            }
            else{
                var status = "received";
                var statusPT = "recebeu";

                if(msgCount>1){
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p>Você ${statusPT} <b class="qnt">${msgCount}</b> ${feelingsPT}&nbsp;<b>${since}</b></p></span>`);
                }
                else{
                    $('#messages').prepend(`<span class="${status}" data-id="${id}" data-uid="${uid}" data-type="${type}" data-message="${msg}" data-count="${msgCount}"><p>Você ${statusPT} um ${feelingPT}&nbsp;<b>${since}</b></p></span>`);
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
            $('#messages').prepend(`<span data-id="${id}" data-uid="${uid}" class="message ${status} ${like}"><p>${msg}<b>${since}</b></p></span>`);
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

    resizeMessageBox();
});

function sendMessage(type, message){
    var postsRef = firebase.database().ref().child('messages');
    var date = getLocalTime();

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

        // LISTA COMPARTILHADA
        var firebaseLastDateReminder = firebase.database().ref('dates/'+lastDateID+'/reminder-list/shared');
        firebaseLastDateReminder.on('value',function(list){
            var list = list.val();
            // console.log(list);

            $('#reminder-list #ourPendingItens').html("");
            $('#reminder-list #ourDoneItens').html("");

            if(list == null){
                $('#reminder-list #ourPendingItens').append('<span style="display:block;text-align:center;">Não existem itens 🥺</span>')
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
                            <div class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', 'shared')" value="${itemName}" contenteditable>${itemName}</div>
                        </span>`
                    );
                }
                else{
                    $('#reminder-list #ourDoneItens').append(
                        `<span class="item">
                            <svg onclick="pendentItem('${lastDateID}', '${itemID}', 'shared')" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 10.5C13.86 10.5 10.5 13.86 10.5 18C10.5 22.14 13.86 25.5 18 25.5C22.14 25.5 25.5 22.14 25.5 18C25.5 13.86 22.14 10.5 18 10.5ZM18 3C9.72 3 3 9.72 3 18C3 26.28 9.72 33 18 33C26.28 33 33 26.28 33 18C33 9.72 26.28 3 18 3ZM18 30C11.37 30 6 24.63 6 18C6 11.37 11.37 6 18 6C24.63 6 30 11.37 30 18C30 24.63 24.63 30 18 30Z" fill="white"/>
                            </svg>
                            <div class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', 'shared')" value="${itemName}" contenteditable>${itemName}</div>
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
                $('#reminder-list #myPendingItens').append('<span style="display:block;text-align:center;">Não existem itens 🥺</span>')
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
                            <div class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" value="${itemName}" contenteditable>${itemName}</div>
                        </span>`
                    );
                }
                else{
                    $('#reminder-list #myDoneItens').append(
                        `<span class="item">
                            <svg onclick="pendentItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 10.5C13.86 10.5 10.5 13.86 10.5 18C10.5 22.14 13.86 25.5 18 25.5C22.14 25.5 25.5 22.14 25.5 18C25.5 13.86 22.14 10.5 18 10.5ZM18 3C9.72 3 3 9.72 3 18C3 26.28 9.72 33 18 33C26.28 33 33 26.28 33 18C33 9.72 26.28 3 18 3ZM18 30C11.37 30 6 24.63 6 18C6 11.37 11.37 6 18 6C24.63 6 30 11.37 30 18C30 24.63 24.63 30 18 30Z" fill="white"/>
                            </svg>
                            <div class="input" id="list-item-${itemID}" onkeypress="return checkKeypress(event)" onfocusout="updateItem('${lastDateID}', '${itemID}', '${firebase.auth().currentUser.uid}')" value="${itemName}" contenteditable>${itemName}</div>
                        </span>`
                    );
                }
                // console.log(item);
            }
        });

        // POPULA O TICKET
        var firebaseDateTicket = firebase.database().ref('dates/'+lastDateID+'/ticket');
        firebaseDateTicket.on('value',function(ticket){
            var ticket = ticket.val();
            console.log(ticket);
            
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

            document.getElementById('more-info-area').innerHTML = "";
            for(var i in infos){
                var info = infos[i];
                var title = info.title;
                var content = info.content;

                $('#more-info-area').append('<div class="more-info"><span class="title">'+title+'</span><span class="content">'+content+'</span></div>');
            }

        });


    } else firstRead = false;

});

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


openModal('checkin-ticket');
// openModal('reminder-list');