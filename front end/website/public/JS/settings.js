var token = getCookie('accessToken');
var email = getCookie("userEmail");
document.getElementById("emailDisplay").innerHTML = email;
console.log(email);

function getDisplayName()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/getDisplayName');
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4 && xhr.status == 200)
        {
            document.getElementById("username").innerHTML = xhr.responseText;
        }
        else if(xhr.readyState == 4) console.log("Invalid token");
    }
    xhr.send(null);
}

function getCookie (cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++)
    {
        var c = ca[i];
        while (c.charAt(0) == ' ')
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0)
        {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function setDisplayName(dname){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/setDisplayName');
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4 && xhr.status == 200)
        {
            alert(xhr.responseText);
        }
        
    }
    xhr.send(JSON.stringify({authorization:"Bearer " + token, displayName: dname}));

}

window.addEventListener("load", function()
{
    var inputBox = document.getElementById('exampleInputEmail1');
    inputBox.addEventListener("keydown",function(e)
    {
        if (e.keyCode === 13 && inputBox.value != "") 
        {
            setDisplayName(document.getElementById('exampleInputEmail1').value);
        }
    }); 
});

function setBio(bioSet){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/setBio');
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4 && xhr.status == 200)
        {
            alert(xhr.responseText);
            alert("bio changed");
        }
    }
    xhr.send(JSON.stringify({authorization: "Bearer " + token, bio: bioSet}));
}

window.addEventListener("load", function()
{
    var inputBox = document.getElementById('bioPlace');
    inputBox.addEventListener("keydown", function(e)
    {
        if(e.keyCode === 13 && inputBox.value != "" && (document.getElementById('bioPlace').value).length <= 30)
        {
            setBio(document.getElementById('bioPlace').value);
        }
    })
})


function getBio(){

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/getBio');
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    var bio;
    
    console.log("function is being called...");

    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4 && xhr.status == 200)
        {
            bio = xhr.responseText;
            document.getElementById("bioPlace").placeholder = bio;
        }
        else if(xhr.readyState == 4) console.log("Invalid token");
        
    }
    xhr.send(null);
}


function removeFriendRequest() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/removeFriendRequest');
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function () {

        if(xhr.readyState === 4 && xhr.status === 200){
                alert("Friend Request removed");
                getFriends();
            } else {
                console.log("Error!");
            }
        }
    xhr.send(JSON.stringify({"requestEmail": requestEmail, "authorization": token}));
}


function acceptFriendRequest()
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://us-central1-cryptalk-72a10.cloudfunctions.net/acceptFriendRequest");
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200){
            alert("Request Accepted!!!");
        } else {
            console.log("Error!");
        }
    }
    xhr.send(JSON.stringify({"requestEmail": requestEmail, "authorization": token}));
}


function sendFriendRequest(bioSet){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/sendFriendRequest');
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function()
    {
        if(xhr.readyState == 4 && xhr.status == 200)
        {
            alert(xhr.responseText);
            alert("Freind Request Sent!");
        }
    }
    xhr.send(JSON.stringify({authorization: "Bearer " + token, bio: bioSet}));
}

window.addEventListener("load", function()
{
    var inputBox = document.getElementById('bioPlace');
    inputBox.addEventListener("keydown", function(e)
    {
        if(e.keyCode === 13 && inputBox.value != "" && (document.getElementById('bioPlace').value).length <= 30)
        {
            setBio(document.getElementById('bioPlace').value);
        }
    })
})