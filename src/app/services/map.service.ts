import {BehaviorSubject} from "rxjs";
import {latLngDistance} from "../utils";
import {environment} from "../../environments/environment";
import {Circle, LatLng, MapSymbol, Marker, Measurement, Polygon, Polyline, Rectangle} from "../models/mapSymbol";

declare const L;

export enum MapLayers {
    BING,
    GOOGLE_HYBRID,
    GOOGLE_ROAD,
    GOOGLE_SATELLITE,
    GOOGLE_TERRAIN,
    ESRI_TOPOGRAPHIC,
    ESRI_IMAGERY,
    ESRI_IMAGERY_CLARITY
}

export enum WeatherLayers {
    CLOUDS_NEW,
    PRECIPITATION_NEW,
    SEA_LEVEL_PRESSURE,
    WIND_NEW,
    TEMP_NEW
}

const ARROW = L.icon({iconUrl: '/assets/images/arrow.png', iconSize: [40, 45], iconAnchor: [20, 23]});
const DOT = L.icon({iconUrl: '/assets/images/dot.png', iconSize: [25, 25], iconAnchor: [13, 13]});
const MARKER = L.icon({iconUrl: '/assets/images/marker.png', iconSize: [40, 55], iconAnchor: [20, 55]});
const MEASURE = L.icon({iconUrl: '/assets/images/measure.png', iconSize: [75, 50], iconAnchor: [25, 25]});

export class MapService {
    private readonly map;

    private circles = [];
    private markers = [];
    private measurements = [];
    private mapLayer;
    private polygons = [];
    private polylines = [];
    private rectangles = [];
    private weatherLayer;

    click = new BehaviorSubject<{latlng: LatLng, symbol?: MapSymbol, item?: any}>(null);
    touch = new BehaviorSubject<{type: string, latlng: LatLng}>(null);

    constructor(private elementId: string) {
        this.map = L.map(elementId, {attributionControl: false, editable: true, tap: true, zoomControl: false, maxBoundsViscosity: 1, doubleClickZoom: false}).setView({lat: 0, lng: 0}, 10);
        this.map.on('click', (e) => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}}));
        this.map.on('touchstart', (e) => this.touch.next({type: 'start', latlng: {lat: e.latlng.lat, lng: e.latlng.lng}}));
        this.map.on('touchmove', (e) => this.touch.next({type: 'move', latlng: {lat: e.latlng.lat, lng: e.latlng.lng}}));
        this.map.on('touchend', (e) => this.touch.next({type: 'end', latlng: {lat: e.latlng.lat, lng: e.latlng.lng}}));
        this.setMapLayer();
    }

    private getIcon(name: string) {
        switch(name) {
            case 'arrow':
                return ARROW;
            case 'dot':
                return DOT;
            case 'measure':
                return MEASURE;
            default:
                return MARKER;
        }
    }

    centerOn(latlng: LatLng, zoom=14) {
        this.map.setView(latlng, zoom);
    }

    delete(...symbols) {
        symbols.forEach(s => {
            this.map.removeLayer(s);
            this.circles = this.circles.filter(c => c != s);
            this.markers = this.markers.filter(m => m != s);
            this.measurements = this.measurements.filter(m => m != s);
            this.polygons = this.polygons.filter(p => p != s);
            this.polylines = this.polylines.filter(p => p != s);
            this.rectangles = this.rectangles.filter(r => r != s);
        });
    }

    deleteAll() {
        this.circles.forEach(c => this.delete(c));
        this.markers.forEach(m => this.delete(m));
        this.measurements.forEach(m => this.delete(m));
        this.polygons.forEach(p => this.delete(p));
        this.polylines.forEach(p => this.delete(p));
        this.rectangles.forEach(r => this.delete(r));
    }

    lock(unlock?: boolean) {
        if(unlock) {
            this.map.setMaxBounds(null);
            this.map.boxZoom.disable();
            this.map.touchZoom.enable();
            this.map.scrollWheelZoom.enable();
        } else {
            this.map.setMaxBounds(this.map.getBounds());
            this.map.boxZoom.disable();
            this.map.touchZoom.disable();
            this.map.scrollWheelZoom.disable();
        }
    }

    newCircle(c: Circle) {
        let circle = L.circle(c.latlng, Object.assign({color: '#ff4141', autoPan: false}, c)).addTo(this.map);
        if(c.label) circle.bindTooltip(c.label, {permanent: true, direction: 'center'});
        circle.on('click', e => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}, symbol: c, item: circle}));
        if(!c.noDelete) this.circles.push(circle);
        return circle;
    }

    newMarker(m: Marker) {
        let marker = L.marker(m.latlng, Object.assign({color: '#ff4141', autoPan: false}, m, {icon: m.icon ? this.getIcon(m.icon) : MARKER})).addTo(this.map);
        if(m.label) marker.bindTooltip(m.label, {permanent: true, direction: 'bottom'});
        marker.on('click', e => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}, symbol: m, item: marker}));
        if(!m.noDelete) this.markers.push(marker);
        return marker;
    }

    newMeasurement(m: Measurement) {
        let line = L.polyline([m.latlng, m.latlng2], Object.assign({color: '#ff4141', autoPan: false, weight: 8, lineCap: "square", dashArray: '10, 20'}, m)).addTo(this.map);
        if(!m.noDelete) this.measurements.push(line);
        let distance = latLngDistance(m.latlng, m.latlng2);
        line.bindPopup(`${distance > 1000 ? Math.round(distance / 100) / 10 : Math.round(distance)} ${distance > 1000 ? 'k' : ''}m`, {autoPan: false, autoClose: false, closeOnClick: false}).openPopup();
        line.on('click', e => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}, symbol: m, item: line}));
        return line;
    }

    newPolygon(p: Polygon) {
        let polygon = new L.Polygon(p.latlng, Object.assign({color: '#ff4141', autoPan: false}, p)).addTo(this.map);
        if(p.label) polygon.bindTooltip(p.label, {permanent: true});
        polygon.on('click', e => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}, symbol: p, item: polygon}));
        if(!p.noDelete) this.polygons.push(polygon);
        return polygon;
    }

    newPolyline(p: Polyline) {
        let polyline = new L.Polyline(p.latlng, Object.assign({color: '#ff4141', autoPan: false,  weight: 10}, p)).addTo(this.map);
        polyline.on('click', e => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}, symbol: p, item: polyline}));
        if(!p.noDelete) this.polylines.push(polyline);
        return polyline;
    }

    newRectangle(r: Rectangle) {
        let rect = new L.Rectangle([r.latlng, r.latlng2], Object.assign({color: '#ff4141', autoPan: false}, r)).addTo(this.map);
        if(r.label) rect.bindTooltip(r.label, {permanent: true, direction: 'center'});
        rect.on('click', e => this.click.next({latlng: {lat: e.latlng.lat, lng: e.latlng.lng}, symbol: r, item: rect}));
        if(!r.noDelete) this.rectangles.push(rect);
        return rect;
    }

    setMapLayer(layer?: MapLayers) {
        if(this.mapLayer) this.map.removeLayer(this.mapLayer);
        if(layer == null) layer = MapLayers.GOOGLE_HYBRID;
        switch(layer) {
            case MapLayers.BING:
                this.mapLayer = L.tileLayer.bing(environment.bing);
                break;
            case MapLayers.GOOGLE_HYBRID:
                this.mapLayer = L.gridLayer.googleMutant({type: 'hybrid'});
                break;
            case MapLayers.GOOGLE_ROAD:
                this.mapLayer = L.gridLayer.googleMutant({type: 'roadmap'});
                break;
            case MapLayers.GOOGLE_SATELLITE:
                this.mapLayer = L.gridLayer.googleMutant({type: 'satellite'});
                break;
            case MapLayers.GOOGLE_TERRAIN:
                this.mapLayer = L.gridLayer.googleMutant({type: 'terrain'});
                break;
            case MapLayers.ESRI_TOPOGRAPHIC:
                this.mapLayer = L.esri.basemapLayer('Topographic');
                break;
            case MapLayers.ESRI_IMAGERY:
                this.mapLayer = L.esri.basemapLayer('Imagery');
                break;
            case MapLayers.ESRI_IMAGERY_CLARITY:
                this.mapLayer = L.esri.basemapLayer('ImageryClarity');
                break;
        }
        this.mapLayer.addTo(this.map);
        if(this.weatherLayer) this.setWeatherLayer(this.weatherLayer.name);
    }

    setWeatherLayer(layer?: WeatherLayers) {
        if(this.weatherLayer) {
            this.map.removeLayer(this.weatherLayer.layer);
            this.weatherLayer = null;
        }
        switch(layer) {
            case WeatherLayers.CLOUDS_NEW:
                this.weatherLayer = {name: WeatherLayers.CLOUDS_NEW, layer: L.OWM.clouds({appId: environment.openWeather, opacity: 0.5})};
                break;
            case WeatherLayers.PRECIPITATION_NEW:
                this.weatherLayer = {name: WeatherLayers.PRECIPITATION_NEW, layer: L.OWM.precipitation({appId: environment.openWeather, opacity: 0.5})};
                break;
            case WeatherLayers.SEA_LEVEL_PRESSURE:
                this.weatherLayer = {name: WeatherLayers.SEA_LEVEL_PRESSURE, layer: L.OWM.pressure({appId: environment.openWeather, opacity: 0.5})};
                break;
            case WeatherLayers.WIND_NEW:
                this.weatherLayer = {name: WeatherLayers.WIND_NEW, layer: L.OWM.wind({appId: environment.openWeather, opacity: 0.5})};
                break;
            case WeatherLayers.TEMP_NEW:
                this.weatherLayer = {name: WeatherLayers.TEMP_NEW, layer: L.OWM.temperature({appId: environment.openWeather, opacity: 0.5})};
                break;
        }
        if(this.weatherLayer) this.weatherLayer.layer.addTo(this.map);
    }
}
