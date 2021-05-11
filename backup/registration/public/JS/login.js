
function login()
{
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        console.log(user);
        document.cookie = "username=" + username;
        document.cookie = "password=" + password;
        document.cookie = "uid=" + user.uid;
        document.cookie = "accessToken=" + user.za;
        window.location.href = "/homePage.html";
        // ...
    })
    .catch((error) => 
    {
        var errorCode = error.code;
        var errorMessage = error.message;
    });
}