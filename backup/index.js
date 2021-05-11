const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const accountsRef = admin.firestore().collection('accounts');
const cors = require('cors')({origin:true});

exports.addAccount = functions.https.onRequest((request,response) =>
{ 
    cors(request,response,() =>
    {
        if (request.body.userID)
        {
            accountsRef.add(request.body).then(()=>
            {
                response.send("Saved in database");
            });
        }
        else
        {
            firebase.auth().createUserWithEmailAndPassword(request.body.email, request.body.password).then((userCredential) => 
            {
                var user = userCredential.user;
            }).catch((error) => 
            {
                var errorCode = error.code;
                var errorMessage = error.message;
            });
        }
    });
});

exports.registerUserDetails = functions.https.onRequest((request,response) =>
{
    cors (request,response,() =>
    {
        if (request.body.username && request.body.userPublicKeyString && request.body.userID)
        {
            accountsRef.where('username','==',request.headers.username).get().then((snapshot) =>
            {
                if (snapshot.empty)
                {
                    accountsRef.add(request.body).then(() =>
                    {
                        response.send("Register details saved in database");
                    });
                }
                else 
                {
                    response.send("username already taken");
                }
            });
        }
        else
        {
            response.send("Error missing details");
        }
    });
});

exports.checkUsername = functions.https.onRequest((request,response) =>
{
    cors (request,response,() =>
    {
        accountsRef.where('username','==',request.headers.username).get().then((snapshot) =>
        {
            if (snapshot.empty)
            {
                response.send("Valid");
            }
            else 
            {
                response.send("Invalid");
            }
        });
    });

});


/*
exports.removeFriend = functions.https.onRequest((request,response) =>
{
    cors(request,response,() =>
    {
        const pendingListRef = admin.firestore().collection('pendingList');
        const friendsListRef = admin.firestore().collection('friendsList');

    });
});

exports.acceptFriend = functions.https.onRequest((request,response) =>
{
    cors(request,response,() =>
    {
        const pendingListRef = admin.firestore().collection('pendingList');
        const friendsListRef = admin.firestore().collection('friendsList');
        pendingListRef.where('username','==',request.body.username).get().then((snapshot) =>
        {
            if (snapshot.empty)
            {
                console.log("error no pending requests");
            }
            else
            {
                friendsListRef.add(request.body.username).then(() =>
                {
                    pendingListRef.delete(request.body)
                    response.send("Friend added");
                });
            }
        });
    });
}); */

exports.sendRequest = functions.https.onRequest((request, response) =>
{
    cors(request,response,()=>
    {
        const accountsRef = admin.firestore().collection('accounts');
        const pendingListRef = admin.firestore().collection('pendingList');
        accountsRef.where('username', '==', request.body.username).get().then((snapshot) =>
        {
            if (snapshot.empty)
            {
                response.send("No username found");
            }
            else
            {
                pendingListRef.where('username', '==', snapshot.username).get().then((snapshot) =>
                {
                    if (snapshot.empty)
                    {
                        pendingListRef.add(request.body.username).then(() => 
                        {
                            response.send("Request sent");
                        });
                    }       
                    else
                    {
                        response.send("Friend already added");
                    }
                });
            }
        });        
    });
});

/*
exports.getPublicKey = functions.https.onRequest((request, response) =>
{
    response.send()
});
*/

exports.homePage = functions.https.onRequest((request, response) => {
cors(request, response, () => {
 console.log('Check if request is authorized with Firebase ID token');
 if ((!request.headers.authorization || !request.headers.authorization.startsWith('Bearer '))) {
 console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
 'Make sure you authorize your request by providing the following HTTP header:',
 'Authorization: Bearer <Firebase ID Token>');
 response.status(403).send('Unauthorized');
 return;
 }
 let idToken;
 if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
 console.log('Found "Authorization" header');
 // Read the ID Token from the Authorization header.
 idToken = request.headers.authorization.split('Bearer ')[1];
 } else {
 // No cookie
 response.status(403).send('Unauthorized');
 return;
 }
 try {
 const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
 console.log('ID Token correctly decoded', token);
 
 response.send("Welcome to the secure section " + token);
 });
 } catch (error) {
 console.error('Error while verifying Firebase ID token:', error);
 response.status(403).send('Unauthorized');
 return;
 }
 });
});