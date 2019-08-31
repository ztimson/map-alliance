import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {BehaviorSubject, Subscription} from "rxjs";
import {Circle, MapData, Marker, Measurement, Polygon, Polyline, Rectangle} from "../models/mapSymbol";
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private code: string;
    private changed = false;
    private collection: AngularFirestoreCollection;
    private mapSub: Subscription;
    private saveRate = 5_000;

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
        this.mapSymbols.next(map);
        this.changed = true;
    }

    addMarker(marker: Marker) {
        let map = this.mapSymbols.value;
        if(!map.markers) map.markers = [];
        map.markers.push(marker);
        this.mapSymbols.next(map);
        this.changed = true;
    }

    addMeasurement(measurement: Measurement) {
        let map = this.mapSymbols.value;
        if(!map.measurements) map.measurements = [];
        map.measurements.push(measurement);
        this.mapSymbols.next(map);
        this.changed = true;
    }

    addPolygon(polygon: Polygon) {
        let map = this.mapSymbols.value;
        if(!map.polygons) map.polygons = [];
        map.polygons.push(polygon);
        this.mapSymbols.next(map);
        this.changed = true;
    }

    addPolyline(polyline: Polyline) {
        let map = this.mapSymbols.value;
        if(!map.polylines) map.polylines = [];
        map.polylines.push(polyline);
        this.mapSymbols.next(map);
        this.changed = true;
    }

    addRectangle(rect: Rectangle) {
        let map = this.mapSymbols.value;
        if(!map.rectangles) map.rectangles = [];
        map.rectangles.push(rect);
        this.mapSymbols.next(map);
        this.changed = true;
    }

    delete(...symbols) {
        let map = this.mapSymbols.value;
        if(map.circles) symbols.forEach(s => map.circles = map.circles.filter(c => !_.isEqual(s, c)));
        if(map.markers) symbols.forEach(s => map.markers = map.markers.filter(m => !_.isEqual(s, m)));
        if(map.measurements) symbols.forEach(s => map.measurements = map.measurements.filter(m => !_.isEqual(s, m)));
        if(map.polygons) symbols.forEach(s => map.polygons = map.polygons.filter(p => !_.isEqual(s , p)));
        if(map.polylines) symbols.forEach(s => map.polylines = map.polylines.filter(p => !_.isEqual(s, p)));
        if(map.rectangles) symbols.forEach(s => map.rectangles = map.rectangles.filter(r => !_.isEqual(s, r)));
        this.mapSymbols.next(map);
        this.changed = true;
    }

    load(mapCode: string) {
        if(this.mapSub) {
            this.mapSub.unsubscribe();
            this.mapSub = null;
        }
        this.code = mapCode;
        this.mapSub = this.collection.doc(this.code).valueChanges().subscribe(newMap => {
            this.mapSymbols.next(Object.assign({}, newMap));
            this.changed = false;
        });

        setInterval(() => this.save(), this.saveRate);
    }

    save() {
        if(this.code && this.mapSymbols.value && this.changed) {
            this.collection.doc(this.code).set(this.mapSymbols.value);
            this.changed = false;
        }
    }
}
