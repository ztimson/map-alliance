import {User as FirebaseUser} from '@angular/fire/auth'
import {DocumentReference} from '@angular/fire/firestore';

export interface User extends FirebaseUser {
    ref?: DocumentReference;
}
