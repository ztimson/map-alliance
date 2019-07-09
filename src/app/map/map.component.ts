import {Component} from "@angular/core";
import {GeolocationService} from "../geolocation/geolocation.service";
import {filter} from "rxjs/operators";
import {version} from "../../../package.json";

declare const google;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss']
})
export class MapComponent {
    drawListener;
    mapApi: any;
    markers = [];
    mode: 'marker' | 'circle' | 'square' | 'draw';
    position: any;
    remove = false;
    style: 'satellite' | 'terrain' | 'roadmap' | 'hybrid' = 'terrain';
    version = version;

    constructor(public geolocation: GeolocationService) {
        geolocation.location.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(this.mapApi) {
                console.log(pos);
                if(!this.position) this.center(pos);
                this.position = pos;
            }
        });
    }

    mapReady(map) {
        this.mapApi = map;
    }

    center(pos?) {
        if(!pos) pos = this.position;
        this.mapApi.setCenter({lat: pos.latitude, lng: pos.longitude});
    }

    clicked(type: 'single' | 'double' | 'right', event) {
        if(this.mode == 'marker') {
            this.markers.push({latitude: event.coords.lat, longitude: event.coords.lng});
            this.mode = null;
        }
    }

    draw() {
        if(!this.drawListener) {
            this.drawListener = google.maps.event.addDomListener(this.mapApi.getDiv(), 'mousedown', () => {
                let poly = new google.maps.Polyline({map: this.mapApi, clickable: true});
                google.maps.event.addListener(poly, 'click', () => {
                    if(this.remove) poly.setMap(null);
                });
                let moveListener = google.maps.event.addListener(this.mapApi, 'mousemove', e => poly.getPath().push(e.latLng));
                google.maps.event.addListener(this.mapApi, 'mouseup', () => google.maps.event.removeListener(moveListener));
                google.maps.event.addListener(poly, 'mouseup', () => google.maps.event.removeListener(moveListener));
            });

            this.mapApi.setOptions({
                draggable: false
            });
        } else {
            google.maps.event.removeListener(this.drawListener);
            this.drawListener = null;
            this.mapApi.setOptions({
                draggable: true
            });
        }
    }
}
