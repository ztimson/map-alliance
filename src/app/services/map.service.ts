import {BehaviorSubject} from "rxjs";
import {distanceInM} from "../utils";
import {environment} from "../../environments/environment";
import {Circle, LatLng, Marker, Measurement} from "../models/mapSymbol";

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

export const ARROW = L.icon({iconUrl: '/assets/images/arrow.png', iconSize: [40, 45], iconAnchor: [20, 23]});
export const MARKER = L.icon({iconUrl: '/assets/images/marker.png', iconSize: [40, 55], iconAnchor: [20, 55]});
export const MEASURE = L.icon({iconUrl: '/assets/images/measure.png', iconSize: [75, 50], iconAnchor: [25, 25]});

export class MapService {
    private drawListener;
    private markers = [];
    private measurements = [];
    private mapLayer;
    private weatherLayer;

    click = new BehaviorSubject<{event: any, symbol?: any}>(null);
    drawingColor = '#ff4141';
    drawingWeight = 10;
    map;

    constructor(private elementId: string) {
        this.map = L.map(elementId, {attributionControl: false, editable: true, tap: true, zoomControl: false, maxBoundsViscosity: 1, doubleClickZoom: false}).setView({lat: 0, lng: 0}, 10);
        this.map.on('click', (e) => this.click.next({event: e}));
        this.setMapLayer();

        this.map.on('editable:drag', e => console.log(e));
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

    setMapLayer(layer?: MapLayers) {
        if(this.mapLayer) this.map.removeLayer(this.mapLayer);
        if(layer == null) layer = MapLayers.ESRI_IMAGERY;
        switch(layer) {
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

    newCircle(c: Circle) {
        if(!c.radius) c.radius = 500;
        if(!c.color) c.color = '#ff4141';
        let circle = L.circle(c.latlng, c).addTo(this.map);
        circle.symbol = c;
        circle.on('click', e => this.click.next({event: e, symbol: circle}));
        return circle;
    }

    newMarker(m: Marker) {
        if(!m.icon) m.icon = MARKER;
        let marker = L.marker(m.latlng, m).addTo(this.map);
        if(m.label) marker.bindTooltip(m.label, {permanent: true, direction: 'bottom'});
        marker.symbol = m;
        marker.on('click', e => this.click.next({event: e, symbol: marker}));
        return marker;
    }

    newMeasurement(m: Measurement) {
        if(!m.color) m.color = '#ff4141';
        if(!m.weight) m.weight = 8;
        let line = L.polyline([m.latlng, m.latlng2], m);
        let decoration = L.polylineDecorator(line, {patterns: [
            {offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, headAngle: 180, pathOptions: m})},
            {offset: '-100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 10, polygon: false, headAngle: 180, pathOptions: m})}
        ]});
        let group = L.layerGroup([line, decoration]).addTo(this.map);
        group.symbol = m;
        line.on('click', e => this.click.next({event: e, symbol: group}));
        let distance = distanceInM(m.latlng.lat, m.latlng.lng, m.latlng2.lat, m.latlng2.lng);
        line.bindPopup(`${distance > 1000 ? Math.round(distance / 100) / 10 : Math.round(distance)} ${distance > 1000 ? 'k' : ''}m`, {autoClose: false, closeOnClick: false}).openPopup();
        return group;
    }

    startDrawing() {
        this.lock();
        this.drawListener = e => {
            let poly = L.polyline([e.latlng], {interactive: true, color: this.drawingColor, weight: this.drawingWeight}).addTo(this.map);
            poly.on('click', e => this.click.next({event: e, symbol: poly}));
            let pushLine = e => poly.addLatLng(e.latlng);
            this.map.on('touchmove', pushLine);
            this.map.on('touchend', () => this.map.off('touchmove', pushLine));
        };

        this.map.on('touchstart', this.drawListener);
    }

    stopDrawing() {
        this.lock(true);
        this.map.setMaxBounds(null);
        this.map.off('touchstart', this.drawListener);
    }
}
