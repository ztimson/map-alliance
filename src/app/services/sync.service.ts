import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {BehaviorSubject, combineLatest, Subscription} from "rxjs";
import {Circle, MapData, MapSymbol, Marker, Measurement, Polygon, Polyline, Position, Rectangle} from "../models/mapSymbol";
import {Md5} from 'ts-md5';
import {filter, map} from "rxjs/operators";

export const LOCATION_COLLECTION = 'Users';
export const MAP_COLLECTION = 'Maps';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private location;
    private locationChanged = false;
    private locationDoc: AngularFirestoreDocument;
    private mapCode: string;
    private mapDoc: AngularFirestoreDocument;
    private mapChanged = false;
    private mapSub: Subscription;
    private saveInterval: number;
    private username: string;

    freeze = new BehaviorSubject<boolean>(false);
    mapData = new BehaviorSubject<MapData>({});
    status = new BehaviorSubject<string>(null);

    constructor(private db: AngularFirestore) {
        // Handle prompting the user before exit if there are changes
        this.status.pipe(filter(s => !s)).subscribe(() => window.onbeforeunload = () => this.unload());
        this.status.pipe(filter(s => !!s)).subscribe(() => {
            window.onbeforeunload = e => {
                this.removeLocation();
                let ignore = this.save();
                e.returnValue = 'Please wait for us to finish saving!';
                return e.returnValue;
            }
        });
    }

    private addMapSymbol(s: MapSymbol, key: string) {
        let map = this.mapData.value;
        if(!map[key]) map[key] = {};
        s.updated = new Date().getTime();
        if(!s.id) s.id = Md5.hashStr(s.updated.toString()).toString();
        map[key][s.id] = s;
        this.mapData.next(map);
        this.mapChanged = true;
        this.status.next('modified');
    }

    async exists(mapCode: string) {
        return (await this.db.collection(MAP_COLLECTION).doc(mapCode).ref.get()).exists;
    }

    addCircle(circle: Circle) {
        this.addMapSymbol(circle, 'circles');
    }

    addMarker(marker: Marker) {
        this.addMapSymbol(marker, 'markers');
    }

    addMeasurement(measurement: Measurement) {
        this.addMapSymbol(measurement, 'measurements');
    }

    addMyLocation(location: Position) {
        location.timestamp = new Date();
        let markForSave = this.location == null;
        this.locationChanged = true;
        this.location = location;
        if(markForSave) return this.save(false, true);
    }

    addPolygon(polygon: Polygon) {
        this.addMapSymbol(polygon, 'polygons');
    }

    addPolyline(polyline: Polyline) {
        this.addMapSymbol(polyline, 'polylines')
    }

    addRectangle(rect: Rectangle) {
        this.addMapSymbol(rect, 'rectangles')
    }

    delete(...symbols) {
        let map = this.mapData.value;
        Object.keys(map).forEach(key => symbols.filter(s => !!map[key][s.id]).forEach(s => {
            map[key][s.id].updated = new Date().getTime();
            map[key][s.id].deleted = true
        }));
        this.mapData.next(map);
        this.mapChanged = true;
        this.status.next('modified');
    }

    load(mapCode: string, username: string) {
        this.mapCode = mapCode;
        this.username = username.replace(/\s/g, '');
        this.mapDoc = this.db.collection(MAP_COLLECTION).doc(mapCode);
        this.locationDoc = this.mapDoc.collection(LOCATION_COLLECTION).doc(username);

        this.mapSub = combineLatest(this.mapDoc.valueChanges(), this.mapDoc.collection(LOCATION_COLLECTION, ref => {
            let aMinuteAgo = new Date();
            aMinuteAgo.setMinutes(aMinuteAgo.getMinutes() - 1);
            return ref.where('timestamp', '>=', aMinuteAgo);
        }).snapshotChanges(), this.freeze)
            .pipe(map(data => {
                let oldMap = this.mapData.value;
                if(data[2]) return;
                let newMap = data[0] || {};
                let mergedMap = this.mergeMaps(newMap, oldMap);

                let locations = data[1].map(doc => ({id: doc.payload.doc.id, data: <Marker>doc.payload.doc.data()}));
                locations.filter(l => l.id != username).forEach(l => {
                    mergedMap.locations[l.id] = l.data;
                });

                return mergedMap;
            })).subscribe((mapData: MapData) => {
                if(!mapData) return;
                this.mapData.next(mapData);
                this.status.next(null);
                if(this.saveInterval) clearInterval(this.saveInterval);
                this.saveInterval = setInterval(() => this.save(), (mapData.locations && Object.keys(mapData.locations).length > 0) ? 5_000 : 30_000);
            });
    }

    mergeMaps(newMap: MapData, oldMap: MapData) {
        let map: MapData = {locations: {}};
        let twoMinAgo = new Date();
        twoMinAgo.setMinutes(twoMinAgo.getMinutes() - 2);
        Object.keys(newMap).forEach(key => {
            if(!map[key]) map[key] = {};
            Object.keys(newMap[key]).filter(id => !newMap[key][id].deleted || newMap[key][id].updated > twoMinAgo)
                .forEach(id => map[key][id] = newMap[key][id]);
        });
        Object.keys(oldMap).filter(key => key != 'locations').forEach(key => {
            if(!map[key]) map[key] = {};
            Object.keys(oldMap[key]).filter(id => {
                let newS = map[key][id] || false;
                return !newS && !oldMap[key][id].deleted || newS && oldMap[key][id].updated > newS.updated;
            }).forEach(id => map[key][id] = oldMap[key][id]);
        });
        return map;
    }

    removeLocation() {
        // Hack to delete doc even if page is closed
        navigator.sendBeacon(`https://us-central1-mapalliance-ab38a.cloudfunctions.net/closeSession/?mapCode=${this.mapCode}&username=${this.username}`);
    }

    save(map=true, location=true) {
        let promises = [];

        if(location && this.locationDoc && this.locationChanged) {
            promises.push(this.locationDoc.set(this.location));
        }

        if(map && this.mapDoc && this.mapChanged) {
            this.status.next('saving');
            let map = this.mapData.value;
            delete map.locations;
            promises.push(this.mapDoc.set(map));
            this.mapChanged = false;
        }

        return Promise.all(promises)
    }

    unload() {
        this.removeLocation();

        if(this.saveInterval) clearInterval(this.saveInterval);
        let saving = this.save(true, false);

        if(this.mapSub) {
            this.mapSub.unsubscribe();
            this.mapSub = null;
        }

        if(this.mapDoc) {
            this.mapDoc = null;
            this.mapChanged = false;
        }

        if(this.locationDoc) {
            this.location = null;
            this.locationChanged = false;
            this.locationDoc = null;
        }

        this.mapCode = null;
        this.username = null;
        this.mapData.next({});
        return saving;
    }
}
