function signOut()
        {
            firebase.auth().signOut().then(() => {
            console.log("Signed out");
            window.location.href = "/index.html";
            }).catch((error) => {
            // An error happened.
            });
        }