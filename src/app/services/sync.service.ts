import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {BehaviorSubject, combineLatest, Subscription} from "rxjs";
import {Circle, MapData, MapSymbol, Marker, Measurement, Polygon, Polyline, Rectangle} from "../models/mapSymbol";
import * as _ from 'lodash';
import {map} from "rxjs/operators";

export const LOCATION_COLLECTION = 'Users';
export const MAP_COLLECTION = 'Maps';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private

    private location;
    private locationChanged = false;
    private locationDoc: AngularFirestoreDocument;
    private mapDoc: AngularFirestoreDocument;
    private mapChanged = false;
    private mapSub: Subscription;
    private saveInterval: number;

    mapData = new BehaviorSubject<MapData>({});

    constructor(private db: AngularFirestore) { }

    private addMapSymbol(s: MapSymbol, key: string) {
        s.new = true;
        let map = this.mapData.value;
        if(!map[key]) map[key] = [];
        map[key].push(s);
        this.mapData.next(map);
        this.mapChanged = true;
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

    addMyLocation(location: Marker) {
        let markForSave = this.location == null;
        if(!this.locationChanged) this.locationChanged = !_.isEqual(this.location, location);
        if(this.locationChanged) this.location = location;
        if(markForSave) this.save(true);
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
        [map.circles, map.markers, map.measurements, map.polygons, map.polylines, map.rectangles]
            .forEach((storage: MapSymbol[]) => symbols.forEach(s => storage = storage.filter(ss => !_.isEqual(s, ss))));
        this.mapData.next(map);
        this.mapChanged = true;
    }

    load(mapCode: string, username: string) {
        this.unload();
        this.mapDoc = this.db.collection(MAP_COLLECTION).doc(mapCode);
        this.locationDoc = this.mapDoc.collection(LOCATION_COLLECTION).doc(username);

        this.mapSub = combineLatest(this.mapDoc.valueChanges(), this.mapDoc.collection(LOCATION_COLLECTION).snapshotChanges())
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
                if(this.saveInterval) clearInterval(this.saveInterval);
                this.saveInterval = setInterval(() => this.save(), (mapData.locations && Object.keys(mapData.locations).length > 0) ? 5_000 : 30_000)
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

    removeMyLocation() {
        this.location = null;
        return this.locationDoc.delete();
    }

    save(locationOnly?) {
        if(this.locationDoc && this.locationChanged) {
            let ignore = this.locationDoc.set(this.location);
        }

        if(!locationOnly && this.mapDoc && this.mapChanged) {
            let map = this.mapData.value;
            Object.values(map).forEach(val => val.filter(s => s.new).forEach(s => delete s.new));
            delete map.locations;
            let ignore = this.mapDoc.set(map);
            this.mapChanged = false;
        }
    }

    async unload() {
        if(this.saveInterval) clearInterval(this.saveInterval);
        this.mapData.next({});

        if(this.mapSub) {
            this.mapSub.unsubscribe();
            this.mapSub = null;
        }

        if(this.mapDoc) {
            this.mapDoc = null;
            this.mapChanged = false;
        }

        if(this.locationDoc) {
            this.locationChanged = false;
            await this.removeMyLocation();
            this.locationDoc = null;
        }
    }
}
