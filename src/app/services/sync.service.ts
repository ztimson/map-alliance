import {Injectable} from "@angular/core";
import {onSnapshot, setDoc, collection, getFirestore, doc, DocumentReference, getDoc} from 'firebase/firestore';
import {BehaviorSubject, Subscription} from "rxjs";
import {Circle, MapData, MapSymbol, Marker, Measurement, Polygon, Polyline, Position, Rectangle} from "../models/mapSymbol";
import {filter} from "rxjs/operators";
import {randomStringBuilder} from '../utils/string';

export const LOCATION_COLLECTION = 'Users';
export const MAP_COLLECTION = 'Maps';

@Injectable({
	providedIn: 'root'
})
export class SyncService {
	private location?: any;
	private locationChanged = false;
	private locationDoc?: DocumentReference | null;
	private locationSub?: Function;
	private mapCode?: string | null;
	private mapDoc?: DocumentReference | null;
	private mapChanged = false;
	private mapSub?: Subscription | null;
	private saveInterval?: any;
	private username?: string | null;

	freeze = new BehaviorSubject<boolean>(false);
	mapData = new BehaviorSubject<MapData>({});
	status = new BehaviorSubject<string | null>(null);

	get db() { return getFirestore(); }

	constructor() {
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
		if(!s.id) s.id = randomStringBuilder(32, true, true);
		map[key][s.id] = s;
		this.mapData.next(map);
		this.mapChanged = true;
		this.status.next('modified');
	}

	async exists(mapCode: string) {
		const value = await getDoc(doc(collection(this.db, MAP_COLLECTION), mapCode));
		return value.exists();
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

	async addMyLocation(location: Position) {
		location.timestamp = new Date();
		let markForSave = this.location == null;
		this.locationChanged = true;
		this.location = location;
		if(markForSave)
			await this.save(false, true);
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
		this.mapDoc = doc(collection(this.db, MAP_COLLECTION), mapCode);
		this.locationDoc = doc(collection(this.db, LOCATION_COLLECTION), username);

		onSnapshot(this.mapDoc, map => {
			this.status.next(null);
			const data = this.mergeMaps( map.data() || {}, this.mapData.value);
			if(this.locationSub) this.locationSub();
			this.locationSub = onSnapshot(collection(this.mapDoc, LOCATION_COLLECTION), docs => {
				docs.forEach(doc => {
					const d: any = doc.data();
					if(d.timestamp.seconds * 1000 > (new Date().getTime() - 60000 * 3))
						data.locations[doc.id] = <any>{id: doc.id, ...doc.data()}
				});
				this.mapData.next(data);
			})
			this.mapData.next(data);
			if(this.saveInterval) clearInterval(this.saveInterval);
			const hasUserLocations = Object.keys(this.mapData.value?.locations)?.length > 0 || false;
			this.saveInterval = setInterval(() => this.save(), hasUserLocations ? 5_000 : 30_000);
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
		let promises: Promise<any>[] = [];

		if(location && this.locationDoc && this.locationChanged) {
			promises.push(setDoc(this.locationDoc, this.location));
		}

		if(map && this.mapDoc && this.mapChanged) {
			this.status.next('saving');
			let map = this.mapData.value;
			delete map.locations;
			promises.push(setDoc(this.mapDoc, map));
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
