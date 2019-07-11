import {Component} from "@angular/core";
import {PhysicsService} from "../physics/physics.service";
import {debounceTime, filter, map} from "rxjs/operators";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "./calibrate/calibrate.component";
import {version} from "../../../package.json";

declare const google;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss']
})
export class MapComponent {
    drawListener = [];
    mapApi: any;
    markers = [];
    mobile = false;
    mode: 'marker' | 'circle' | 'square' | 'draw';
    position: any;
    remove = false;
    style: 'satellite' | 'terrain' | 'roadmap' | 'hybrid' = 'terrain';
    version = version;

    Infinity = Infinity;
    isNaN = isNaN;

    constructor(private bpObserver: BreakpointObserver, public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet) {
        bpObserver.observe([Breakpoints.Handset]).subscribe(results => this.mobile = results.matches);
        physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(this.mapApi) {
                if(!this.position) this.center(pos);
                this.position = pos;

                if(this.position.heading != null) {
                    let marker: HTMLElement = document.querySelector('img[src*="arrow.png"]');
                    if(marker) marker.style.transform = `rotate(${this.position.heading}deg)`
                }
            }
        });

        physicsService.requireCalibration.subscribe(() => {
            snackBar.open('Compass requires calibration', 'calibrate', {
                duration: 5000,
                panelClass: 'bg-warning,text-white'
            }).onAction().subscribe(() => this.calibrate());
        });
    }

    mapReady(map) {
        this.mapApi = map;
    }

    calibrate() {
        this.bottomSheet.open(CalibrateComponent, {
            hasBackdrop: false,
            disableClose: true
        });
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
        if(!this.drawListener.length) {
            this.mapApi.setOptions({draggable: false});

            let drawHander = () => {
                let poly = new google.maps.Polyline({map: this.mapApi, clickable: true});
                google.maps.event.addListener(poly, 'click', () => {
                    if(this.remove) poly.setMap(null);
                });
                let moveListener = [
                    google.maps.event.addListener(this.mapApi, 'touchmove', e => poly.getPath().push(e.latLng)),
                    google.maps.event.addListener(this.mapApi, 'mousemove', e => poly.getPath().push(e.latLng))
                ];
                google.maps.event.addListener(this.mapApi, 'touchend', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
                google.maps.event.addListener(this.mapApi, 'mouseup', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
                google.maps.event.addListener(poly, 'touchend', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
                google.maps.event.addListener(poly, 'mouseup', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
            };

            this.drawListener = [
                google.maps.event.addDomListener(this.mapApi.getDiv(), 'touchstart', drawHander),
                google.maps.event.addDomListener(this.mapApi.getDiv(), 'mousedown', drawHander)
            ]
        } else {
            this.mapApi.setOptions({draggable: true});
            this.drawListener.forEach(listener => google.maps.event.removeListener(listener));
            this.drawListener = [];
        }
    }
}
