import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {BehaviorSubject, combineLatest, Subscription} from "rxjs";
import {Circle, MapData, MapSymbol, Marker, Measurement, Polygon, Polyline, Position, Rectangle} from "../models/mapSymbol";
import * as _ from 'lodash';
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
        s.new = true;
        let map = this.mapData.value;
        if(!map[key]) map[key] = [];
        map[key].push(s);
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
        if(!this.locationChanged) this.locationChanged = !_.isEqual(this.location, location);
        if(this.locationChanged) this.location = location;
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
        Object.keys(map).filter(key => Array.isArray(map[key])).forEach(key => {
            symbols.forEach(s => map[key] = map[key].filter(ss => !_.isEqual(s, ss)))
        });
        this.mapData.next(map);
        this.mapChanged = true;
        this.status.next('modified');
    }

    load(mapCode: string, username: string) {
        this.mapCode = mapCode;
        this.username = username;
        this.mapDoc = this.db.collection(MAP_COLLECTION).doc(mapCode);
        this.locationDoc = this.mapDoc.collection(LOCATION_COLLECTION).doc(username);


        this.mapSub = combineLatest(this.mapDoc.valueChanges(), this.mapDoc.collection(LOCATION_COLLECTION, ref => {
            let aMinuteAgo = new Date();
            aMinuteAgo.setMinutes(aMinuteAgo.getMinutes() - 1);
            return ref.where('timestamp', '>=', aMinuteAgo);
        }).snapshotChanges())
            .pipe(map(data => {
                let newMap = data[0];
                let oldMap = this.mapData.value;
                let mergedMap = this.mergeMaps(newMap, oldMap);

                let locations = data[1].map(doc => ({id: doc.payload.doc.id, data: <Marker>doc.payload.doc.data()}));
                locations.filter(l => l.id != username).forEach(l => {
                    if(!mergedMap.locations) mergedMap.locations = {};
                    mergedMap.locations[l.id] = l.data;
                });

                return mergedMap;
            })).subscribe((mapData: MapData) => {
                this.mapData.next(mapData);
                this.status.next(null);
                if(this.saveInterval) clearInterval(this.saveInterval);
                this.saveInterval = setInterval(() => this.save(), (mapData.locations && Object.keys(mapData.locations).length > 0) ? 5_000 : 30_000);
            });
    }

    mergeMaps(newMap: MapData, oldMap: MapData) {
        let map = Object.assign({}, newMap);
        Object.keys(oldMap).forEach(key => {
            if(Array.isArray(map[key])) {
                if(!map[key]) map[key] = [];
                oldMap[key].filter(s => !_.find(map[key], s) && s.new).forEach(s => map[key].push(s));
            }
        });
        if(!map.locations) map.locations = {};
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
            Object.values(map).filter(val => Array.isArray(val)).forEach(val => val.filter(s => s.new).forEach(s => delete s.new));
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
