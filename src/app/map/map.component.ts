import {Component} from "@angular/core";
import {PhysicsService} from "../physics/physics.service";
import {filter, map} from "rxjs/operators";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibtrateComponent} from "./calibrate/calibtrate.component";
import {Subject} from "rxjs";
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
    mobile = false;
    mode: 'marker' | 'circle' | 'square' | 'draw';
    position: any;
    remove = false;
    style: 'satellite' | 'terrain' | 'roadmap' | 'hybrid' = 'terrain';
    version = version;

    constructor(private bpObserver: BreakpointObserver, public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet) {
        bpObserver.observe([Breakpoints.Handset]).subscribe(results => this.mobile = results.matches);
        physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(this.mapApi) {
                if(!this.position) this.center(pos);
                this.position = pos;
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
        let liveCalibration = new Subject<number>();
        liveCalibration.subscribe(calibration => this.physicsService.calibrate = calibration);
        this.bottomSheet.open(CalibtrateComponent, {
            hasBackdrop: false,
            disableClose: true,
            data: {
                in: this.physicsService.info.pipe(map(coords => coords.heading)),
                out: liveCalibration
            }
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
        if(!this.drawListener) {
            this.mapApi.setOptions({draggable: false});
            this.drawListener = google.maps.event.addDomListener(this.mapApi.getDiv(), (this.mobile ? 'touchstart' : 'mousedown'), () => {
                let poly = new google.maps.Polyline({map: this.mapApi, clickable: true});
                google.maps.event.addListener(poly, 'click', () => {
                    if(this.remove) poly.setMap(null);
                });
                let moveListener = google.maps.event.addListener(this.mapApi, (this.mobile ? 'touchmove' : 'mousemove'), e => poly.getPath().push(e.latLng));
                google.maps.event.addListener(this.mapApi, (this.mobile ? 'touchend' : 'mouseup'), () => google.maps.event.removeListener(moveListener));
                google.maps.event.addListener(poly, (this.mobile ? 'touchend' : 'mouseup'), () => google.maps.event.removeListener(moveListener));
            });
        } else {
            this.mapApi.setOptions({draggable: true});
            google.maps.event.removeListener(this.drawListener);
            this.drawListener = null;
        }
    }
}
