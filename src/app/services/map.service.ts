import {BehaviorSubject} from "rxjs";
import {distanceInM} from "../utils";
import {environment} from "../../environments/environment";
import {LatLng} from "../models/latlng";

declare const L;

export enum MapLayers {
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

export const ARROW = L.icon({iconUrl: '/assets/images/arrow.png', iconSize: [50, 55], iconAnchor: [25, 28]});
export const MARKER = L.icon({iconUrl: '/assets/images/marker.png', iconSize: [40, 55], iconAnchor: [20, 55]});

export class MapService {
    private drawListener;
    private markers = [];
    private measurements = [];
    private mapLayer;
    private weatherLayer;

    click = new BehaviorSubject<{lat: number, lng: number}>(null);
    deleteMode = false;
    drawingColor = '#d82b00';
    drawingWeight = 10;
    map;

    constructor(private elementId: string) {
        this.map = L.map(elementId, {attributionControl: false, zoomControl: false}).setView({lat: 0, lng: 0}, 10);
        this.map.on('click', (e) => this.click.next(e.latlng));
        this.setMapLayer();
    }

    centerOn(latlng: LatLng, zoom=14) {
        this.map.setView(latlng, zoom);
    }

    delete(...symbols) {
        symbols.forEach(s => {
            this.map.removeLayer(s);
            this.markers = this.markers.filter(m => m != s);
            this.measurements = this.markers.filter(m => m != s);
        });
    }

    deleteAll() {
        this.markers.forEach(m => this.delete(m));
        this.measurements.forEach(m => this.delete(m.line, m.decoration));
    }

    setMapLayer(layer?: MapLayers) {
        if(this.mapLayer) this.map.removeLayer(this.mapLayer);
        switch(layer) {
            case MapLayers.ESRI_TOPOGRAPHIC:
                this.mapLayer = L.esri.basemapLayer('Topographic');
                break;
            case MapLayers.ESRI_IMAGERY:
                this.mapLayer = L.esri.basemapLayer('Imagery');
                break;
            default:
                this.mapLayer = L.esri.basemapLayer('ImageryClarity');
        }
        this.mapLayer.addTo(this.map);
    }

    setWeatherLayer(layer?: WeatherLayers) {
        if(this.weatherLayer) this.map.removeLayer(this.weatherLayer);
        switch(layer) {
            case WeatherLayers.CLOUDS_NEW:
                this.weatherLayer = L.OWM.clouds({appId: environment.openWeather, opacity: 0.5});
                break;
            case WeatherLayers.PRECIPITATION_NEW:
                this.weatherLayer = L.OWM.precipitation({appId: environment.openWeather, opacity: 0.5});
                break;
            case WeatherLayers.SEA_LEVEL_PRESSURE:
                this.weatherLayer = L.OWM.pressure({appId: environment.openWeather, opacity: 0.5});
                break;
            case WeatherLayers.WIND_NEW:
                this.weatherLayer = L.OWM.wind({appId: environment.openWeather, opacity: 0.5});
                break;
            case WeatherLayers.TEMP_NEW:
                this.weatherLayer = L.OWM.temperature({appId: environment.openWeather, opacity: 0.5});
                break;
        }
        if(this.weatherLayer) this.weatherLayer.addTo(this.map);
    }

    newCircle(latlng: LatLng, radius: number, opts: any={}) {
        opts.radius = radius;
        let circle = L.circle(latlng, opts).addTo(this.map);
        circle.on('click', () => {
            if(!opts.noDelete && this.deleteMode) {
                this.delete(circle);
            } else {

            }
        });
        return circle;
    }

    newMarker(latlng: LatLng, opts: any={}) {
        if(!opts.icon) opts.icon = MARKER;
        let marker = L.marker(latlng, opts).addTo(this.map);
        this.markers.push(marker);
        marker.on('click', () => {
            if(!opts.noDelete && this.deleteMode) {
                this.delete(marker);
            } else {

            }
        });
        return marker;
    }

    newMeasurement(latlng1: LatLng, latlng2: LatLng) {
        let line = L.polyline([latlng1, latlng2], {color: '#d82b00', weight: 5}).addTo(this.map);
        let decoration = L.polylineDecorator(line, {patterns: [
                {offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, headAngle: 180, pathOptions: {color: '#d82b00', stroke: true}})},
                {offset: '-100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, headAngle: 180, pathOptions: {color: '#d82b00', stroke: true}})}
            ]}).addTo(this.map);
        this.measurements.push({line: line, decoration: decoration});
        let distance = distanceInM(latlng1.lat, latlng1.lng, latlng2.lat, latlng2.lng);
        line.bindPopup(`${distance > 1000 ? Math.round(distance / 100) / 10 : Math.round(distance)} ${distance > 1000 ? 'k' : null}m`).openPopup();
        line.on('click', () => { if(this.deleteMode) this.delete(line, decoration);});
        return {line: line, decoration: decoration};
    }

    startDrawing() {
        this.map.dragging.disable();

        this.drawListener = () => {
            let poly = L.polyline([], {interactive: true, color: this.drawingColor, weight: this.drawingWeight}).addTo(this.map);
            poly.on('click', () => { if(this.deleteMode) this.map.removeLayer(poly); });
            let pushLine = e => poly.addLatLng(e.latlng);
            this.map.on('mousemove', pushLine);
            this.map.on('mouseup', () => this.map.off('mousemove', pushLine));
        };

        this.map.on('mousedown', this.drawListener);
    }

    stopDrawing() {
        this.map.dragging.enable();
        this.map.off('mousedown', this.drawListener);
    }
}
