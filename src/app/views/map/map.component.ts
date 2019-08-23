import {Component, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics/physics.service";
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
    providers: [MapService],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnInit {
    map: MapService;
    markers = [];
    position;


    drawColor = '#d82b00';
    showPalette = false;
    isNaN = isNaN;

    menu: ToolbarItem[][] = [[
        {name: 'compass', icon: 'explore', hidden: true},
    ], [
        {name: 'marker', icon: 'room', toggle: true, individualToggle: true, click: () => this.addMarker()},
        {name: 'draw', icon: 'create', toggle: true, individualToggle: true, onEnabled: () => this.startDrawing(), onDisabled: () => this.endDrawing()},
        {name: 'measure', icon: 'straighten', toggle: true, individualToggle: true, click: () => this.measure()},
        {name: 'delete', icon: 'delete', toggle: true, individualToggle: true, onEnabled: () => this.map.deleteMode = true, onDisabled: () => this.map.deleteMode = false},
        {name: 'style', icon: 'terrain', enabled: true, toggle: true},
        {name: 'weather', icon: 'cloud', toggle: true},
        {name: 'compass', icon: 'explore', click: () => this.calibrate()}
    ], [
        {name: 'messages', icon: 'chat', hidden: true},
        {name: 'identity', icon: 'perm_identity', hidden: true},
        {name: 'settings', icon: 'settings', hidden: true}
    ]];

    constructor(public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet) { }

    ngOnInit() {
        this.map = new MapService('map');
        this.physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(!this.position) this.center({lat: pos.latitude, lng: pos.longitude});
            this.position = pos;
            if(this.position.heading != null) {
                let marker: HTMLElement = document.querySelector('img[src*="arrow.png"]');
                if(marker) marker.style.transform = `rotate(${this.position.heading}deg)`
            }
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
            this.menu[1][0].enabled = false;
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
                this.menu[1][2].enabled = false;
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
