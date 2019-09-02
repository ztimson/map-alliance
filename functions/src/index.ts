import * as functions from 'firebase-functions';
import * as cor from 'cors';

const cors = cor({origin: true});

exports.helloWorld = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        res.status(200).send('Hello World!');
    });
});
