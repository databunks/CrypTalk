var token = getCookie('accessToken');

window.addEventListener("load", function()
{
    var inputBox = document.getElementById('search-input');
    inputBox.addEventListener("keydown",function(e)
    {
        if (e.keyCode === 13) 
        {
            sendFriendRequest(document.getElementById('search-input').value);
        }
    }); 
});

function getFriends() 
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/getFriends');

    
    xhr.onreadystatechange = function () 
    {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var sHTML = "";
                var data = JSON.parse(xhr.responseText);
                document.getElementById('friendsList').innerHTML = "";
                for(var i = 0; i < data.length; i++) 
                {
                    sHTML += "<div class='card w-85 bg-dark friendCard'>";
                    sHTML += "<div class='card-body friend'>";
                    sHTML += "<div class='usernameDiv container'>";
                    sHTML += "<h4 class='card-text'>" + data[i].friendEmail + "</h4>";
                    sHTML += "</div>";
                    sHTML += "<img src='images/avatar.png' class='avatar' alt='avi'>";
                    sHTML += "<button class='addButton bg-dark' type='sumbit'>";
                    sHTML += "<img onclick='removeFriend("+ '"' + data[i].friendEmail + '"'  +")' class='addImg' src='images/x.png'>";
                    sHTML += "</button>";
                    sHTML += "<button class='addButton bg-dark' type='sumbit'>";
                    sHTML += "<img onclick = 'redirect()' class='addImg' src='images/chat.png'>";
                    sHTML += "</button>";
                    sHTML += "</div>";
                    sHTML += "</div>";
                }
                document.getElementById('friendsList').innerHTML = sHTML;
                getPendingListSent();
            }
        }
    }
    xhr.setRequestHeader('authorization', 'Bearer ' + token);
    xhr.send(null);
}

function sendFriendRequest(email) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/sendFriendRequest');
    xhr.setRequestHeader("Content-type", "application/json");
    console.log(email);

    // Track the state changes of the request.
    xhr.onreadystatechange = function () 
    {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.

        if (xhr.readyState === DONE && xhr.status === OK)
        {
            alert(xhr.responseText);
        }
    }

    xhr.send(JSON.stringify({"requestEmail": email, "authorization": "Bearer " + token}));
}

function getPendingListSent() 
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/getPendingListSent');
    xhr.setRequestHeader("Authorization", "Bearer " + token);

    xhr.onreadystatechange = function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var dHTML = "";
                var data = JSON.parse(xhr.responseText);
                data = data.sort();
                document.getElementById('requests').innerHTML = "";
                for(var i = data.length - 1; i >= 0; i--) 
                {
                    dHTML += "<div class='card w-85 bg-dark requestCard'>";
                    dHTML += "<div class='card-body request'>";
                    dHTML += "<div class='usernameDiv container'>";
                    dHTML += "<h4 class='card-text'>" + data[i] + "</h4>";
                    dHTML += "</div>";
                    dHTML += "<img src='images/avatar.png' class='avatar' alt='avi'>";
                    dHTML += "<button class='addButton bg-dark' type='submit'>";
                    dHTML += "<img class='addImg' onclick = 'removeFriendRequest("+ '"'+ data[i]  + '"' + ")' src='images/x.png'>";
                    dHTML += "</button>";
                    dHTML += "</div>";
                    dHTML += "</div>";
                }
                document.getElementById('requests').innerHTML = dHTML;
                getPendingListReceived();
            }
        }
    }
    xhr.send(null);
}

function getPendingListReceived()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/getPendingListReceived');
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.onreadystatechange = function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var dHTML = "";
                var data = JSON.parse(xhr.responseText);
                data = data.sort();
                document.getElementById('pending').innerHTML = "";
                for(var i = data.length - 1; i >= 0; i--) 
                {
                    dHTML += "<div class='card w-85 bg-dark pendingCard'>";
                    dHTML += "<div class='card-body pending '>";
                    dHTML += "<div class='usernameDiv container'>";
                    dHTML += "<h4 class='card-text'>" + data[i] + "</h4>";
                    dHTML += "</div>";
                    dHTML += "<img src='images/avatar.png' class='avatar' alt='avi'>";
                    dHTML += "<button class='addButton bg-dark' type='submit'>";
                    dHTML += "<img onclick ='removeFriendRequest("+ '"' + data[i] + '"' +")' class='addImg' src='images/x.png'>";
                    dHTML += "</button>";
                    dHTML += "<button class='addButton bg-dark' type='submit'>";
                    dHTML += "<img onclick ='acceptFriendRequest("+ '"' + data[i] + '"' +")' class='addImg' src='images/add.png'>";
                    dHTML += "</button>";
                    dHTML += "</div>";
                    dHTML += "</div>";
                }
                document.getElementById('pending').innerHTML = dHTML;
                getFriends();
            }
        } 
    }
    xhr.send(null);
}

function removeFriend(email) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/removeFriend');
    xhr.setRequestHeader("Content-type", "application/json");

    // Track the state changes of the request.
    xhr.onreadystatechange = function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                console.log("Successful");
                alert (xhr.responseText);
                getFriends();
            }
        }
    }
    xhr.send(JSON.stringify({"friendEmail": email, "authorization": "Bearer " + token}));
}

function acceptFriendRequest(email) 
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://us-central1-cryptalk-72a10.cloudfunctions.net/acceptFriendRequest");
    xhr.setRequestHeader("Content-type", "application/json");

    // Track the state changes of the request.
    xhr.send(JSON.stringify({authorization: "Bearer " + token, requestEmail: email}));
    xhr.onreadystatechange = function () 
    {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                window.alert(xhr.responseText);
            } 
        }
    }
}

function removeFriendRequest(email) 
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/removeFriendRequest');
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function () {

        if(xhr.readyState === 4 && xhr.status === 200){
                alert(xhr.responseText);
            } else {
                console.log('Error!');
            }
        }
    xhr.send(JSON.stringify({"requestEmail": email, "authorization": "Bearer " +token}));
}

function redirect()
{
    window.location.href = "/Messaging.html";
}