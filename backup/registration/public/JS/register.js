var usernameCheck;
function registerEmailAndPassword()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var username = document.getElementById('userName').value;

        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => 
        {
            firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                document.cookie = "accessToken=" + user.za;
                document.cookie = "userID=" + user.uid;
                document.cookie = "username=" + username;
                document.cookie = "password=" + password;
                registerDetails(user.uid);
                // ...
            })
            .catch((error) => 
            {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage);
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            // ..
        });
    
}

function checkUsername()
{
    var username = document.getElementById('userName').value;
    var xhr = new XMLHttpRequest();
    xhr.open('GET',"https://us-central1-cryptalk-72a10.cloudfunctions.net/checkUsername")
    xhr.setRequestHeader("username",username);
    xhr.send(null);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            if (xhr.responseText == "Valid") usernameCheck = true
            else
            {
                usernameCheck = false;
            } 

            alert(usernameCheck);
        }
    }
}

function registerDetails(uid)
{
    var password = document.getElementById('password').value;
    var username = document.getElementById('userName').value;
    var userRSAkey = cryptico.generateRSAKey(password, 512);
    var userPublicKeyString = cryptico.publicKeyString(userRSAkey);    

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/registerUserDetails');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(
        { 
            userID:uid,
            username:username,
            userPublicKeyString:userPublicKeyString
        }
    ));
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4 && xhr.status === 200) window.location.href = "/homePage.html";
    }
}