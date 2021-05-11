
function login()
{
    var email = document.getElementById('emailLogin').value;
    var password = document.getElementById('passwordLogin').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        document.cookie = "password=" + SHA256(password);
        document.cookie = "userEmail=" + email;
        document.cookie = "userID=" + user.uid;
        document.cookie = "accessToken=" + user.za;
        window.location.href = "/Messaging.html";
        // ...
    })
    .catch((error) => 
    {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(password);
        console.log(email);
        alert(errorMessage);
        console.log(errorCode);
    });
}
