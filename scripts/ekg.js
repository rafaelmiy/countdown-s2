

function levelUpEKG(nextLevel, actualUser){
    // console.log(nextLevel);
    // console.log(actualUser);

    if(nextLevel == null) return;

    if(nextLevel == 12){
        sendMessage("feeling", "heart-beat");
    }

    firebase.database().ref('heart-status/').update({
        lastUserLevel: nextLevel,
        lastUser: actualUser,
        lastAction: getLocalTime()
    });
}

// moment(actualDate, 'YYYYMMDDHHmmss').fromNow()
