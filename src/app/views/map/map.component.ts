import {Component, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics.service";
import {filter, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../components/toolbar/toolbarItem";
import {flyInRight, flyOutRight} from "../../animations";
import {MapService} from "../../services/map.service";

declare const L;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnInit {
    map: MapService;
    markers = [];
    position;
    positionMarker;


    drawColor = '#d82b00';
    showPalette = false;
    isNaN = isNaN;

    menu: ToolbarItem[] = [
        {name: 'Marker', icon: 'room', toggle: true, individualToggle: true, click: () => this.addMarker()},
        {name: 'Draw', icon: 'create', toggle: true, individualToggle: true, onEnabled: () => this.startDrawing(), onDisabled: () => this.endDrawing()},
        {name: 'Measure', icon: 'straighten', toggle: true, individualToggle: true, click: () => this.measure()},
        {name: 'Delete', icon: 'delete', toggle: true, individualToggle: true, onEnabled: () => this.map.deleteMode = true, onDisabled: () => this.map.deleteMode = false},
        {name: 'Style', icon: 'terrain', enabled: true, toggle: true},
        {name: 'Weather', icon: 'cloud', toggle: true},
        {name: 'Calibrate', icon: 'explore', click: () => this.calibrate()},
        {name: 'Messages', icon: 'chat', hidden: true},
        {name: 'Identity', icon: 'perm_identity', hidden: true},
        {name: 'Settings', icon: 'settings', hidden: true}
    ];

    constructor(public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet) { }

    ngOnInit() {
        this.map = new MapService('map');
        let positionIcon = L.icon({iconUrl: '/assets/images/arrow.png'});
        this.physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(!this.position) this.center({lat: pos.latitude, lng: pos.longitude});
            if(this.positionMarker) this.map.delete(this.positionMarker);
            this.positionMarker = this.map.newMarker({lat: pos.latitude, lng: pos.longitude}, {icon: positionIcon, rotationAngle: pos.heading, rotationOrigin: 'center center'});
            this.position = pos;
        });

        this.physicsService.requireCalibration.subscribe(() => {
            this.snackBar.open('Compass requires calibration', 'calibrate', {
                duration: 5000,
                panelClass: 'bg-warning,text-white'
            }).onAction().subscribe(() => this.calibrate());
        });
    }

    center(pos?) {
        if(!pos) pos = {lat: this.position.latitude, lng: this.position.longitude};
        this.map.centerOn(pos);
    }

    addMarker() {
        this.map.click.pipe(skip(1), take(1)).subscribe(latlng => {
            this.menu[0].enabled = false;
            this.markers.push(latlng);
            this.map.newMarker(latlng);
        });
    }

    draw() {
        this.markers.forEach(marker => this.map.newMarker(marker));
    }

    measure() {
        let firstPoint;
        this.map.click.pipe(skip(1), take(2)).subscribe(latlng => {
            if(!firstPoint) {
                firstPoint = this.map.newMarker(latlng);
            } else {
                this.menu[3].enabled = false;
                this.map.newMeasurement(firstPoint.getLatLng(), latlng);
                this.map.delete(firstPoint);
            }
        })
    }

    calibrate() {
        this.bottomSheet.open(CalibrateComponent, {
            hasBackdrop: false,
            disableClose: true
        });
    }

    startDrawing() {
        this.showPalette = true;
        this.map.startDrawing();
    }

    endDrawing() {
        this.showPalette = false;
        this.map.stopDrawing()
    }
}
