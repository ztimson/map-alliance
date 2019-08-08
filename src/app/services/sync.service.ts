import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreCollection, DocumentSnapshot} from "@angular/fire/firestore";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private collection: AngularFirestoreCollection;

    constructor(private db: AngularFirestore) {
        this.collection = this.db.collection('Maps');
    }

    async exists(mapCode: string) {
        return (await this.collection.doc(mapCode).ref.get()).exists;
    }

    load(mapCode: string) {
        return this.collection.doc(mapCode).snapshotChanges().pipe(map((snap: any) => {
            return Object.assign({}, snap.data, {delete: snap.ref.delete, set: snap.ref.set, update: snap.ref.update});
        }))
    }
}
