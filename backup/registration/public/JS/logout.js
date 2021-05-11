function signOut()
        {
            firebase.auth().signOut().then(() => {
            console.log("Signed out");
            }).catch((error) => {
            // An error happened.
            });
        }