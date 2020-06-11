import {User as FirebaseUser} from "firebase"
import {AngularFirestoreDocument} from '@angular/fire/firestore';

export interface User extends FirebaseUser {
    ref?: AngularFirestoreDocument;
}
