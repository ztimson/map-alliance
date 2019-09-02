import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';

const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore();

exports.closeSession = functions.https.onRequest((req, resp) => {
    return cors(req, resp, () => {
        const code = req.query.mapCode;
        const username = req.query.username;
        return db.collection('Maps').doc(code).collection('Users').doc(username).delete();
    });
});
