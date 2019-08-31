import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {BehaviorSubject, Subscription} from "rxjs";
import {Circle, MapData, Marker, Measurement, Rectangle} from "../models/mapSymbol";
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private code: string;
    private collection: AngularFirestoreCollection;
    private mapSub: Subscription;

    mapSymbols = new BehaviorSubject<MapData>(null);

    constructor(private db: AngularFirestore) {
        this.collection = this.db.collection('Maps');
    }

    async exists(mapCode: string) {
        return (await this.collection.doc(mapCode).ref.get()).exists;
    }

    addCircle(circle: Circle) {
        let map = this.mapSymbols.value;
        if(!map.circles) map.circles = [];
        map.circles.push(circle);
        this.save();
    }

    addMarker(marker: Marker) {
        let map = this.mapSymbols.value;
        if(!map.markers) map.markers = [];
        map.markers.push(marker);
        this.save();
    }

    addMeasurement(measurement: Measurement) {
        let map = this.mapSymbols.value;
        if(!map.measurements) map.measurements = [];
        map.measurements.push(measurement);
        this.save();
    }

    addRectangle(rect: Rectangle) {
        let map = this.mapSymbols.value;
        if(!map.rectangles) map.rectangles = [];
        map.rectangles.push(rect);
        this.save();
    }

    delete(...symbols) {
        let map = this.mapSymbols.value;
        if(map.circles) symbols.forEach(s => map.circles = map.circles.filter(c => !_.isEqual(s, c)));
        if(map.markers) symbols.forEach(s => map.markers = map.markers.filter(m => !_.isEqual(s, m)));
        if(map.measurements) symbols.forEach(s => map.measurements = map.measurements.filter(m => !_.isEqual(s, m)));
        if(map.rectangles) symbols.forEach(s => map.rectangles = map.rectangles.filter(r => !_.isEqual(s, r)));
        this.save();
    }

    load(mapCode: string) {
        if(this.mapSub) {
            this.mapSub.unsubscribe();
            this.mapSub = null;
        }
        this.code = mapCode;
        this.mapSub = this.collection.doc(this.code).valueChanges().subscribe(newMap => this.mapSymbols.next(Object.assign({}, newMap)));
    }

    save() {
        if(this.code && this.mapSymbols.value) {
            this.collection.doc(this.code).set(this.mapSymbols.value);
        }
    }
}
