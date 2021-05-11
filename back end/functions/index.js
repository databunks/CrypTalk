const functions = require("firebase-functions");
const admin = require("firebase-admin");;
admin.initializeApp();
const accountsRef = admin.firestore().collection('accounts');
const firebase = require("firebase-admin/lib/firestore");
const displayNameRef = admin.firestore().collection('displayName');
const pendingListRef = admin.firestore().collection('pendingList');
const friendsListRef = admin.firestore().collection('friendsList');
const messageReceivedRef = admin.firestore().collection('messageReceivedList');
const bioRef = admin.firestore().collection('bio');
const messageSentRef = admin.firestore().collection('messageSentList');
const conversationListRef = admin.firestore().collection('conversationList');
const cors = require('cors')({origin:true});

exports.getPublicKey = functions.https.onRequest((request,response) =>
{
    cors(request, response, () => 
    {
        if (request.headers.email)
        {    
            accountsRef.where("email", '==', request.headers.email).get().then((snapshot) =>
            {
                if (snapshot.empty) response.send("Invalid email")
                else
                {
                    snapshot.forEach(doc =>
                    {
                        response.send(doc.data().userPublicKeyString);
                    });
                }
                return;
            });       
        }
        else response.send("Invalid details");
        return;
    });
    return;
});


exports.registerUserDetails = functions.https.onRequest((request,response) =>
{
    cors(request, response, () => {
        console.log('Check if request is authorized with Firebase ID token');
        if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
        response.status(403).send('Unauthorized');
        return;
        }
        let idToken;
        if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = request.body.authorization.split('Bearer ')[1];
        } else {
        // No cookie
        response.status(403).send('Unauthorized');
        return;
        }
        try {
        const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
        console.log('ID Token correctly decoded', token);
        if (request.body.displayName && request.body.userPublicKeyString && request.body.email && request.body.bio)
        {  
            accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
            {
                if (snapshot.empty)
                {
                    accountsRef.add({userID: token.uid, email:request.body.email, userPublicKeyString: request.body.userPublicKeyString}).then(() =>
                    {     
                        displayNameRef.add({userID: token.uid, displayName: request.body.displayName}).then(() =>
                        {
                            bioRef.add({userID: token.uid, bio: request.body.bio}).then(() =>
                            {
                                response.send("Registration details set"); i
                                return;
                            });
                            return;
                        });
                        return;
                    });
                }
                else 
                {
                    response.send("UserID already taken, denied");
                }
                return;
            });
        }
        else
        {
            response.send("Error missing details");
        }
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
        });
});

exports.checkToken = functions.https.onRequest((request, response) =>
{
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
        response.send("OK");
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
        });
});



exports.setDisplayName = functions.https.onRequest((request, response) =>
{
    cors(request, response, () => {
        console.log('Check if request is authorized with Firebase ID token');
        if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
        response.status(403).send('Unauthorized');
        return;
        }
        let idToken;
        if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = request.body.authorization.split('Bearer ')[1];
        } else {
        // No cookie
        response.status(403).send('Unauthorized');
        return;
        }
        try {
        const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
        console.log('ID Token correctly decoded', token);
        //
                if (request.body.displayName)
                {
                    displayNameRef.where('userID','==',token.uid).get().then((snapshot) =>
                    {
                        if (snapshot.empty)
                        {
                            response.send("Error does not exist");
                            return;
                        }
                        else
                        {
                            snapshot.forEach(doc =>
                                {
                                    accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
                                    {
                                        if (snapshot.empty) response.send("No email associated with account");
                                        else
                                        {
                                            snapshot.forEach(doc2 =>
                                            {

                                                friendsListRef.where('friendEmail', '==', doc2.data().email).get().then((snapshot) =>
                                                {
                                                    if (!snapshot.empty)
                                                    {
                                                        snapshot.forEach(doc2 =>
                                                            {
                                                                friendsListRef.doc(doc2.id).update({displayName: request.body.displayName});
                                                            });
                                                    }
            
                                                    displayNameRef.doc(doc.id).delete().then(() => 
                                                    {
                                                        displayNameRef.add({userID: token.uid, displayName: request.body.displayName}).then(() => {response.send("Successfully changed display name"); return;});
                                                    });     
                                                    return;                                   
                                                });                                           });
                                            
                                        }
                                        return;
                                    });
                                                                      
                                });
                        }
                        return;
                    });
                }
                else
                {
                    response.send("Invalid details sent");
                    return;
                }
            
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
        });
});


exports.removeFriend = functions.https.onRequest((request, response) =>
{
    cors(request, response, () => {
        console.log('Check if request is authorized with Firebase ID token');
        if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
        response.status(403).send('Unauthorized');
        return;
        }
        let idToken;
        if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = request.body.authorization.split('Bearer ')[1];
        } else {
        // No cookie
        response.status(403).send('Unauthorized');
        return;
        }
        try {
        const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
        console.log('ID Token correctly decoded', token);
        if (request.body.friendEmail)
        {
            accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
            {
                if (snapshot.empty) response.send ("No email associated with account");
                else
                {
                    snapshot.forEach(account =>
                    {
                        friendsListRef.where('userID', '==', token.uid).get().then((snapshot) =>
                        {
                            if (snapshot.empty) response.send("Friend not added");
                            else
                            {
                                snapshot.forEach(doc =>
                                {
                                    if (doc.data().friendEmail == request.body.friendEmail)
                                    {
                                        friendsListRef.doc(doc.id).delete().then(() =>
                                        {
                                            friendsListRef.where('userEmail', '==', request.body.friendEmail).get((snapshot) =>
                                            {
                                                
                                                if (snapshot.empty) response.send("No user email associate with friend");
                                                else
                                                {
                                                    snapshot.forEach(doc2 =>
                                                    {
                                                        if (doc2.data().friendEmail == account.data().email)
                                                        {
                                                            friendsListRef.doc(doc2.id).delete().then(() =>
                                                            {
                                                                response.send("Friend deleted");
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        });                     
                    });
                }
            });
        }
        else response.send("Invalid details sent");
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
        });
});

exports.sendFriendRequest = functions.https.onRequest((request, response) =>
{
    cors(request, response, () => 
    {
        console.log('Check if request is authorized with Firebase ID token');
        if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
        response.status(403).send('Unauthorized');
        return;
        }
        let idToken;
        if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = request.body.authorization.split('Bearer ')[1];
        } else {
        // No cookie
        response.status(403).send('Unauthorized');
        return;
        }
        try {
        const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
        console.log('ID Token correctly decoded', token);
        if (request.body.requestEmail)
        {
            accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
            {
                var i = 0;
                if (snapshot.empty) response.send("No email matches token");
                else
                {
                    snapshot.forEach(doc =>
                    {
                        friendsListRef.where('friendEmail', '==', doc.data().email).get().then((snapshot) =>
                        {
                                if (snapshot.empty)
                                {       
                                    accountsRef.where('email', '==', request.body.requestEmail).get().then((snapshot) =>
                                    {
                                        if (snapshot.empty) response.send("No email associated with user");
                                        else
                                        {
                                            snapshot.forEach(doc2 =>
                                            {
                                                //starts
                                                pendingListRef.where('requestEmail', '==', request.body.requestEmail).get().then((snapshot) =>
                                                {
                                                    if (snapshot.empty)
                                                    {
                                                        pendingListRef.where('userEmail', '==', request.body.requestEmail).get().then((snapshot) =>
                                                        {
                                                            if (snapshot.empty)
                                                            {
                                                                pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                {
                                                                    response.send("Friend request sent");
                                                                    return;
                                                                }); 
                                                            }
                                                            else
                                                            {
                                                                snapshot.forEach(doc3 =>
                                                                {
                                                                    if (doc3.data().requestEmail == request.body.requestEmail) response.send("Friend request already sent");
                                                                    else if (i == 0)
                                                                    {
                                                                        i = 1;
                                                                        pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                        {
                                                                            response.send("Friend request sent");
                                                                            return;
                                                                        });                                                                
                                                                    }
                                                                });
                                                            }
                                                        });
                                                                                                
                                                    }
                                                    else
                                                    {
                                                        var i = 0;
                                                        snapshot.forEach(doc3 =>
                                                        {
                                                            if (doc3.data().userEmail == doc.data().email) response.send("Friend request already sent");
                                                            else
                                                            {
                                                                pendingListRef.where('userEmail', '==', request.body.requestEmail).get().then((snapshot) =>
                                                                {
                                                                    if (snapshot.empty && i == 0)
                                                                    {
                                                                        i = 1;
                                                                        pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                        {
                                                                            response.send("Friend request sent");
                                                                            return;
                                                                        }); 
                                                                    }
                                                                    else 
                                                                    {
                                                                        snapshot.forEach(doc3 =>
                                                                        {
                                                                            if (doc3.data().requestEmail == request.body.requestEmail) response.send("Friend request already sent");
                                                                            else if (i == 0)
                                                                            {
                                                                                i = 1;
                                                                                pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                                {
                                                                                    response.send("Friend request sent");
                                                                                    return;
                                                                                });                                                                
                                                                            }
                                                                        });
                                                                    }
                                                                }); 
                                                            }
                                                        });
                                                    }
                                                    return;
                                                });
                                            });
                                        }
                                    });            
                                }
                                else 
                                {
                                    let matchCheck = false;
                                    snapshot.forEach(friendDoc =>
                                    {
                                        if (friendDoc.data().userEmail == request.body.requestEmail) matchCheck = true;
                                    });

                                    if (!matchCheck)
                                    {
                                        accountsRef.where('email', '==', request.body.requestEmail).get().then((snapshot) =>
                                        {
                                            if (snapshot.empty) response.send("No email associated with user");
                                            else
                                            {
                                                snapshot.forEach(doc2 =>
                                                {
                                                    //starts
                                                    pendingListRef.where('requestEmail', '==', request.body.requestEmail).get().then((snapshot) =>
                                                    {
                                                        if (snapshot.empty)
                                                        {
                                                            pendingListRef.where('userEmail', '==', request.body.requestEmail).get().then((snapshot) =>
                                                            {
                                                                if (snapshot.empty)
                                                                {
                                                                    pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                    {
                                                                        response.send("Friend request sent");
                                                                        return;
                                                                    }); 
                                                                }
                                                                else
                                                                {
                                                                    snapshot.forEach(doc3 =>
                                                                    {
                                                                        if (doc3.data().requestEmail == request.body.requestEmail) response.send("Friend request already sent");
                                                                        else
                                                                        {
                                                                            pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                            {
                                                                                response.send("Friend request sent");
                                                                                return;
                                                                            });                                                                
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                                                                    
                                                        }
                                                        else
                                                        {
                                                            snapshot.forEach(doc3 =>
                                                            {
                                                                if (doc3.data().userEmail == doc.data().email) response.send("Friend request already sent");
                                                                else
                                                                {
                                                                    pendingListRef.where('userEmail', '==', request.body.requestEmail).get().then((snapshot) =>
                                                                    {
                                                                        if (snapshot.empty)
                                                                        {
                                                                            pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                            {
                                                                                response.send("Friend request sent");
                                                                                return;
                                                                            }); 
                                                                        }
                                                                        else
                                                                        {
                                                                            snapshot.forEach(doc3 =>
                                                                            {
                                                                                if (doc3.data().requestEmail == request.body.requestEmail) response.send("Friend request already sent");
                                                                                else
                                                                                {
                                                                                    pendingListRef.add({userID: token.uid, requestUserID: doc2.data().userID, userEmail: doc.data().email, requestEmail: request.body.requestEmail, userPublicKeyString: doc.data().userPublicKeyString, receiverPublicKeyString: doc2.data().userPublicKeyString}).then(() =>
                                                                                    {
                                                                                        response.send("Friend request sent");
                                                                                        return;
                                                                                    });                                                                
                                                                                }
                                                                            });
                                                                        }
                                                                    }); 
                                                                }
                                                            });
                                                        }
                                                        return;
                                                    });
                                                });
                                            }
                                        });                                                
                                    }
                                    else response.send("Friend already added");
                                }
                            return;
                        });                          
                    });
                }
                return;
            });
        }
        else response.send("Invalid details");
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
    });
    return;
});

exports.removeFriendRequest = functions.https.onRequest((request,response) =>
{
    cors(request, response, () => {
        console.log('Check if request is authorized with Firebase ID token');
        if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        'Make sure you authorize your request by providing the following HTTP header:',
        'Authorization: Bearer <Firebase ID Token>');
        response.status(403).send('Unauthorized');
        return;
        }
        let idToken;
        if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = request.body.authorization.split('Bearer ')[1];
        } else {
        // No cookie
        response.status(403).send('Unauthorized');
        return;
        }
        try {
        const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
        console.log('ID Token correctly decoded', token);
        if (request.body.requestEmail)
        {
            pendingListRef.where('requestEmail', '==', request.body.requestEmail).get().then((snapshot) =>
            {
                if (!snapshot.empty)
                {
                    snapshot.forEach(doc =>
                    {
                        if (doc.data().requestUserID == token.uid || doc.data().userID == token.uid)
                        {
                            pendingListRef.doc(doc.id).delete().then(() =>
                            {
                                response.send("Friend removed successfully");
                                return;
                            }); 
                        }
                        else response.send("Invalid token");
                    });
                }
                else response.send("No such email exists in pending list");
                return;
            });   
        }
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
        });
});

exports.getDisplayName = functions.https.onRequest((request, response) => 
{
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
         displayNameRef.where('userID', '==', token.uid).get().then((snapshot) =>
         {
             if (snapshot.empty) response.send("No display name associated with account");
             else
             {
                 snapshot.forEach(doc =>
                 {
                     response.send(doc.data().displayName);
                     return;
                 });
             }
             return;
         });
         });
         } catch (error) {
         console.error('Error while verifying Firebase ID token:', error);
         response.status(403).send('Unauthorized');
         return;
         }
         });
});
    

exports.acceptFriendRequest = functions.https.onRequest((request,response) =>
    {
        cors(request, response, () =>
        {
            console.log('Check if request is authorized with Firebase ID token');
            if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
            console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>');
            response.status(403).send('Unauthorized');
            return;
            }
            let idToken;
            if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
            console.log('Found "Authorization" header');
            // Read the ID Token from the Authorization header.
            idToken = request.body.authorization.split('Bearer ')[1];
            } else {
            // No cookie
            response.status(403).send('Unauthorized');
            return;
            }
            try {
            const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
            console.log('ID Token correctly decoded', token);
            if (request.body.requestEmail)
            {
                accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
                {
                    if (snapshot.empty) response.send("No email associated with account");
                    else
                    {
                        snapshot.forEach(doc =>
                            {
                                pendingListRef.where('requestEmail', '==', doc.data().email).get().then((snapshot) =>
                                {
                                    if (snapshot.empty) response.send("Error this friend is not in pending list")
                                    else
                                    {
                                        var i = 0;
                                        snapshot.forEach(pendingListDoc =>
                                        {
                                            if (pendingListDoc.data().userEmail == request.body.requestEmail && i == 0)
                                            {
                                                displayNameRef.where('userID', '==', token.uid).get().then((snapshot) =>
                                                {
                                                    if (snapshot.empty) response.send("No display name associated with account");
                                                    else
                                                    {
                                                        snapshot.forEach(doc3 =>
                                                            {
                                                                accountsRef.where('email', '==', request.body.requestEmail).get().then((snapshot) =>
                                                                {
                                                                    if (snapshot.empty) response.send("No email associated with account");
                                                                    else
                                                                    {
                                                                        snapshot.forEach(doc4 =>
                                                                        {
                                                                            displayNameRef.where('userID', '==', doc4.data().userID).get().then((snapshot) =>
                                                                            {
                                                                                if (snapshot.empty) response.send("No display name associated with account");
                                                                                else
                                                                                {
                                                                                    snapshot.forEach(doc5 =>
                                                                                    {
                                                                                        bioRef.where('userID', '==', token.uid).get().then((snapshot) =>
                                                                                        {
                                                                                          if (snapshot.empty) response.send("No bio found with account");
                                                                                          else
                                                                                          {
                                                                                              snapshot.forEach(doc6 =>
                                                                                              {
                                                                                                  bioRef.where('userID', '==', doc4.data().userID).get().then((snapshot) =>
                                                                                                  {
                                                                                                      if (snapshot.empty) response.send("No bio associated with account");
                                                                                                      else
                                                                                                      {
                                                                                                          snapshot.forEach(doc7 =>
                                                                                                           {
                                                                                                                friendsListRef.add({userID: pendingListDoc.data().requestUserID, userEmail: pendingListDoc.data().requestEmail,friendEmail: pendingListDoc.data().userEmail,userPublicKeyString: pendingListDoc.data().userPublicKeyString, displayName: doc5.data().displayName, bio: doc7.data().bio}).then(() =>
                                                                                                                {
                                                                                                                    friendsListRef.add({userID: pendingListDoc.data().userID, userEmail: pendingListDoc.data().userEmail,friendEmail:pendingListDoc.data().requestEmail,userPublicKeyString: pendingListDoc.data().receiverPublicKeyString, displayName: doc3.data().displayName, bio: doc6.data().bio}).then(() =>
                                                                                                                    {
                                                                                                                        pendingListRef.doc(pendingListDoc.id).delete().then(() =>
                                                                                                                        {
                                                                                                                            response.send("Friend added");
                                                                                                                            return;
                                                                                                                        });
                                                                                                                        return;
                                                                                                                    });
                                                                                                                    return;
                                                                                                                });
                                                                                                           });
                                                                                                      }
                                                                                                      return;
                                                                                                  });
                                                                                              });
                                                                                          }
                                                                                          return;
                                                                                        }); 
                                                                                    });
                                                                                }
                                                                                return;
                                                                            });
                                                                        });
                                                                    }
                                                                    return;
                                                                });
                                                            });
                                                    }
                                                    return;
                                                });
    
                                                i = 1; 
                                            }
                                            else response.send("Invalid request");                                    
                                        });
                                    }
                                    return;
                                });
                            });   
                    }
                });
            }else response.send("Invalid details sent");
            });
            } catch (error) {
            console.error('Error while verifying Firebase ID token:', error);
            response.status(403).send('Unauthorized');
            return;
            }
            
        });
    }); 



exports.getFriends = functions.https.onRequest((request, response) =>
{
    cors(request,response,() =>
    {
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
        friends = [];
        friendsListRef.where('userID','==',token.uid).get().then((snapshot) =>
        {
            snapshot.forEach(doc =>
            {
                friends.push(doc.data());
            });
            response.send(friends);
            return;
        });
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
    });
    return;
});

exports.getPendingListSent = functions.https.onRequest((request, response) =>
{
    cors(request,response,() =>
    {
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
        var pendingList = [];
        pendingListRef.where('userID','==',token.uid).get().then((snapshot) =>
        {
            snapshot.forEach(doc =>
            {
                pendingList.push(doc.data().requestEmail);
            });
            response.send(pendingList);
            return;
        });
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
    });
    return;
});

exports.getPendingListReceived = functions.https.onRequest((request, response) =>
{
    cors(request,response,() =>
    {
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
        var pendingList = [];
        accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
        {
            snapshot.forEach(doc =>
            {
                pendingListRef.where('requestEmail', '==', doc.data().email).get().then((snapshot) =>
                {
                    snapshot.forEach(doc2 =>
                    {
                        pendingList.push(doc2.data().userEmail);
                    });
                    response.send(pendingList);
                    return;
                });
            });
        });
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
    });
});

exports.getMessages = functions.https.onRequest((request, response) =>
{
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
        var data = [];
        accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
        {
            if (snapshot.empty) response.send("No email associated with account")
            else
            {
                snapshot.forEach(doc =>
                {
                    messageReceivedRef.where('receiverEmail', '==', doc.data().email).get().then((snapshot) =>
                    {
                        if (!snapshot.empty)
                        {
                            snapshot.forEach(doc =>
                            {
                                data.push(doc.data());
                            });
                        }

                        messageSentRef.where('userID', '==', token.uid).get().then((snapshot) =>
                        {
                            if (!snapshot.empty)
                            {
                                snapshot.forEach(doc =>
                                {
                                    data.push(doc.data());
                                });
                            }
                            response.send(data);
                            return;
                        });
                        return;
                    });
                });
            }
            return;
        });
        });
        } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        response.status(403).send('Unauthorized');
        return;
        }
        });
});

exports.sendMessage = functions.https.onRequest((request, response) => 
{
cors(request, response, () => {
    console.log('Check if request is authorized with Firebase ID token');
    if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
    'Make sure you authorize your request by providing the following HTTP header:',
    'Authorization: Bearer <Firebase ID Token>');
    response.status(403).send('Unauthorized');
    return;
    }
    let idToken;
    if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = request.body.authorization.split('Bearer ')[1];
    } else {
    // No cookie
    response.status(403).send('Unauthorized');
    return;
    }
    try {
    const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
    console.log('ID Token correctly decoded', token);
    if (request.body.receiverEmail && request.body.messageReceiver && request.body.messageSender && request.body.timestamp)
    {
        friendsListRef.where('friendEmail', '==', request.body.receiverEmail).get().then((snapshot) =>
        {
            if (snapshot.empty) response.send("You have not added this person");
            else
            {
                accountsRef.where('userID','==', token.uid).get().then((snapshot) =>
                {
                    if (snapshot.empty) response.send("No email associated with userID")
                    else
                    {
                        snapshot.forEach(doc =>
                        {
                            messageSentRef.add({userID: token.uid,message: request.body.messageSender, receiverEmail: request.body.receiverEmail, timestamp: request.body.timestamp}).then(() =>
                            {
                                messageReceivedRef.add({senderEmail: doc.data().email, receiverEmail: request.body.receiverEmail, message: request.body.messageReceiver, timestamp: request.body.timestamp}).then(() =>
                                {
                                    response.send("Message saved");
                                    return;
                                });
                                return;
                            });
                        });
                    }
                    return;
                });
            
            }
            return;
        });
    }
    else response.send("Invalid details");
    });
    } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    response.status(403).send('Unauthorized');
    return;
    }
    });
});

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

exports.getBio = functions.https.onRequest((request, response) => {
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
     
     bioRef.where("userID", "==", token.uid).get().then((snapshot) => 
     {
        snapshot.forEach(doc => {
            response.send(doc.data().bio);
        });
        return;
     });
    
     });
     } catch (error) {
     console.error('Error while verifying Firebase ID token:', error);
     response.status(403).send('Unauthorized');
     return;
     }
     });
    });

    exports.setBio = functions.https.onRequest((request, response) =>
    {
        cors(request, response, () => {
            console.log('Check if request is authorized with Firebase ID token');
            if ((!request.body.authorization || !request.body.authorization.startsWith('Bearer '))) {
            console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>');
            response.status(403).send('Unauthorized');
            return;
            }
            let idToken;
            if (request.body.authorization && request.body.authorization.startsWith('Bearer ')) {
            console.log('Found "Authorization" header');
            // Read the ID Token from the Authorization header.
            idToken = request.body.authorization.split('Bearer ')[1];
            } else {
            // No cookie
            response.status(403).send('Unauthorized');
            return;
            }
            try 
            {
            const decodedIdToken = admin.auth().verifyIdToken(idToken).then((token) => {
            console.log('ID Token correctly decoded', token);
            //
                    if (request.body.bio)
                    {
                        bioRef.where('userID','==',token.uid).get().then((snapshot) =>
                        {
                            if (snapshot.empty)
                            {
                                response.send("No bio found");
                            }
                            else
                            {
                                snapshot.forEach(doc =>
                                {
                                    accountsRef.where('userID', '==', token.uid).get().then((snapshot) =>
                                    {
                                        if (snapshot.empty) response.send("No email associated with account");
                                        else
                                        {
                                            snapshot.forEach(doc2 =>
                                            {
                                                friendsListRef.where('friendEmail', '==', doc2.data().email).get().then((snapshot) =>
                                                {
                                                    if (!snapshot.empty)
                                                    {
                                                        snapshot.forEach(doc3 =>
                                                        {
                                                            friendsListRef.doc(doc3.id).update({bio: request.body.bio});
                                                        });
                                                    }
            
                                                    bioRef.doc(doc.id).delete().then(() => 
                                                    {
                                                        bioRef.add({userID: token.uid, bio: request.body.bio}).then(() => {response.send("Successfully changed bio"); return;});
                                                    });
                                                    return;
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else
                    {
                        response.send("Invalid details sent");
                        return;
                    }
                
            });
            } catch (error) {
            console.error('Error while verifying Firebase ID token:', error);
            response.status(403).send('Unauthorized');
            return;
            }
            });
    });

