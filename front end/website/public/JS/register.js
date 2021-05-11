
function registerEmailAndPassword()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var displayName = document.getElementById('displayName').value;
    var bio = document.getElementById('bio').value;

    if (displayName.length == 0)
    {
        alert("Cannot have an empty display name");
        return;
    }
    else if (!/^[a-zA-Z]+$/.test(displayName))
    {
        alert("Display name must only have letters from the alphabet");
        return;
    }
    else if (bio.length == 0) 
    {
        alert("Cannot have an empty bio");
        return;
    }
    else if (bio.length > 50)
    {
        alert("Bio must be less than 50 characters");
        return;
    }

        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => 
        {
            firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                document.cookie = "accessToken=" + user.za;
                document.cookie = "userID=" + user.uid;
                document.cookie = "userEmail=" + email;
                document.cookie = "displayName=" + displayName;
                document.cookie = "password=" + SHA256(password);
                registerDetails(user.uid,"Bearer " + user.za);
                // ...
            })
            .catch((error) => 
            {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                alert(errorMessage);
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            alert(errorMessage);
            // ..
        });
    
}



function registerDetails(uid,za)
{
    var password = document.getElementById('password').value;
    password = SHA256(password); // password hashed
    var userRSAkey = cryptico.generateRSAKey(password, 512); // keypair generated
    var userPublicKeyString = cryptico.publicKeyString(userRSAkey); // public key generated
    var displayName = document.getElementById('displayName').value;
    var email = document.getElementById('email').value;  
    var bio = document.getElementById('bio').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/registerUserDetails');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(
        { 
            userID:uid,
            displayName:displayName,
            userPublicKeyString:userPublicKeyString,
            authorization:za,
            email:email,
            bio: bio
        }
    ));
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4 && xhr.status === 200) window.location.href = "/Messaging.html";
        else console.log(xhr.responseText);
    }
}