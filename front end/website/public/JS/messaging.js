var contactList = [];
var token = getCookie("accessToken");
var userID = getCookie("userID");
var userEmail = getCookie("userEmail");
var password = getCookie("password");
var userRSAkey = cryptico.generateRSAKey(password, 512);
var currentConverser, conversations;
var isInitialiazed = false;
var loaded = false;
var friends = [];

window.addEventListener("load", function()
{
    var inputBox = document.getElementById('inputSend');
    inputBox.addEventListener("keydown",function(e)
    {
        if (e.keyCode === 13 && inputBox.value != "" && currentConverser != null) 
        {
            send(document.getElementById('inputSend').value, currentConverser);
        }
    }); 
});


function layoutPage()
{
    getFriends();
    checkToken();
}


function send(message,receiver)
{
    let timestamp = new Date();
    let userPublicKeyString = cryptico.publicKeyString(userRSAkey);
    var senderMessage = cryptico.encrypt(message,userPublicKeyString);
    var receiverMessage = cryptico.encrypt(message,receiver.userPublicKeyString);
    document.getElementById('inputSend').value = "";
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/sendMessage');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            console.log("Message sent");
        }
    }
    console.log(message + " " + receiver.friendEmail);
    xhr.send(JSON.stringify(
        {
            authorization: "Bearer " + token,
            messageReceiver: receiverMessage.cipher,
            messageSender: senderMessage.cipher,
            timestamp: timestamp,
            receiverEmail: receiver.friendEmail,
        }
    ));
} 

function getFriends()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://us-central1-cryptalk-72a10.cloudfunctions.net/getFriends");
    xhr.setRequestHeader('authorization', "Bearer " + token);
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            let friends = JSON.parse(xhr.responseText);
            getMessages(friends);
        }
    }
    xhr.send(null);
}

function getMessages(friendsList)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/getMessages');
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            let messages = JSON.parse(xhr.responseText);
            sortContent(messages,friendsList);
        }
        else if (xhr.readyState === 4) console.log("Invalid token");
    }
    xhr.setRequestHeader("Authorization","Bearer " + token);
    xhr.send(null);
}

function setCurrentConverser(display, email, publicKey, userBio)
{
    document.getElementById('displayName').innerHTML = display;
    document.getElementById('bio').innerHTML = userBio;
    currentConverser = {friendEmail: email, userPublicKeyString: publicKey};
    isInitialiazed = true;
}

function sortContent(messages,friendsList)
{
    if (messages.length > 0)
    {
        for (var i = 0; i < messages.length; i++)
        {
            messages[i].timestamp = new Date(messages[i].timestamp);
        }
    
        let tmp;
    
        for (var i = 0; i < messages.length; i++)
        {
            for (var j = i + 1; j < messages.length; j++)
            {
                if (messages[i].timestamp > messages[j].timestamp)   
                {  
                  tmp = messages[i];  
                  messages[i] = messages[j];  
                  messages[j] = tmp;  
                }  
            }
        }
    
        for (var i = 0; i < messages.length; i++)
        {
            let decryptedMessage = cryptico.decrypt(messages[i].message, userRSAkey);
            messages[i].message = decryptedMessage.plaintext;
        }
    }   


    if (!loaded)
    {
        document.getElementById('sideBarContent').innerHTML = "";
        friendsList.sort(function(a, b) { // sorts alphabetically
            var textA = a.displayName.toUpperCase();
            var textB = b.displayName.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        for (var i = 0; i < friendsList.length; i++)
        {
            if (i == 0) setCurrentConverser (friendsList[0].displayName, friendsList[0].friendEmail, friendsList[0].userPublicKeyString,friendsList[0].bio)
            let sHTML = "";
            sHTML += "<div "+ "onclick = 'setCurrentConverser(" + '"' + friendsList[i].displayName + '","'+ friendsList[i].friendEmail  +'","'+ friendsList[i].userPublicKeyString  + '","' + friendsList[i].bio  + '"' + ")' class='card w-85 bg-dark' style='margin: 3px;'>";
            sHTML += "<div class='card-body friendCard'>";
            sHTML += "<img src='images/avatar.png' class='icon' alt=''>  <p class='card-text' style='color: white;'>" + friendsList[i].friendEmail + "</p>";
            sHTML += "</div>";
            sHTML += "</div>";
            document.getElementById('sideBarContent').innerHTML += sHTML;
        }   
    }
    loaded = true;
    document.getElementById('loader').className = 'hide';
    if (isInitialiazed) 
    {
        displayCurrentConverser(messages, currentConverser.friendEmail);
    }
    getMessages(friendsList);
}

function displayCurrentConverser(conversations, converser)
{
    document.getElementById('messageList').innerHTML = "";
    console.log(conversations);
    for (var i = 0; i < conversations.length; i++)
    {
        if ("senderEmail" in conversations[i] && conversations[i].senderEmail == converser)
        {
            let sHTML = "";
            sHTML += "<div class='bubbleWrapper'>";
            sHTML += "<div class='inlineContainer'>";
            sHTML += "<img class='inlineIcon' src='https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-simple-512.png'>";
            sHTML += "<div class='otherBubble other'>";
            sHTML += conversations[i].message;
            sHTML += "</div>";
            let time = conversations[i].timestamp
            sHTML += "</div><span class='other'>" + time;
            sHTML += "</span>";
            sHTML += "</div>";
            document.getElementById('messageList').innerHTML += sHTML;
        }
        else if (conversations[i].receiverEmail == converser)
        {
            let sHTML = "";
            sHTML += "<div class='bubbleWrapper'>";
            sHTML += "<div class='inlineContainer own'>";
            sHTML += "<img class='inlineIcon' src='https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-simple-512.png'>";
            sHTML += "<div class='ownBubble own'>";
            sHTML += conversations[i].message;
            sHTML += "</div>";
            let time = conversations[i].timestamp
            sHTML += "</div><span class='own'>" + time;
            sHTML += "</span>";
            sHTML += "</div>";
            document.getElementById('messageList').innerHTML += sHTML;
        }
    }
}
