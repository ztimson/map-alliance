import {Component, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics.service";
import {filter, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../models/toolbarItem";
import {flyInRight, flyOutRight} from "../../animations";
import {ARROW, MapLayers, MapService, WeatherLayers} from "../../services/map.service";

declare const L;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnInit {
    drawColor = '#ff4141';
    isNaN = isNaN;
    map: MapService;
    markers = [];
    position;
    positionMarker = {arrow: null, circle: null};
    showPalette = false;

    menu: ToolbarItem[] = [
        {name: 'Marker', icon: 'room', toggle: true, individualToggle: true, click: () => this.addMarker()},
        {name: 'Draw', icon: 'create', toggle: true, individualToggle: true, onEnabled: () => this.startDrawing(), onDisabled: () => this.endDrawing()},
        {name: 'Measure', icon: 'straighten', toggle: true, individualToggle: true, click: () => this.measure()},
        {name: 'Delete', icon: 'delete', toggle: true, individualToggle: true, onEnabled: () => this.map.deleteMode = true, onDisabled: () => this.map.deleteMode = false},
        {name: 'Map Style', icon: 'terrain', toggle: true, subMenu: [
            {name: 'ESRI:Topographic', click: () => this.map.setMapLayer(MapLayers.ESRI_TOPOGRAPHIC)},
            {name: 'ESRI:Satelite', click: () => this.map.setMapLayer(MapLayers.ESRI_IMAGERY)},
            {name: 'ESRI:Satelite Clear', click: () => this.map.setMapLayer(MapLayers.ESRI_IMAGERY_CLARITY)}
        ]},
        {name: 'Weather', icon: 'cloud', toggle: true, subMenu: [
                {name: 'None', click: () => this.map.setWeatherLayer()},
                {name: 'Temperature', click: () => this.map.setWeatherLayer(WeatherLayers.TEMP_NEW)},
                {name: 'Wind', click: () => this.map.setWeatherLayer(WeatherLayers.WIND_NEW)},
                {name: 'Sea Level Pressure', click: () => this.map.setWeatherLayer(WeatherLayers.SEA_LEVEL_PRESSURE)},
                {name: 'Clouds', click: () => this.map.setWeatherLayer(WeatherLayers.CLOUDS_NEW)},
        ]},
        {name: 'Calibrate', icon: 'explore', click: () => this.calibrate()},
        {name: 'Messages', icon: 'chat', hidden: true},
        {name: 'Identity', icon: 'perm_identity', hidden: true},
        {name: 'Settings', icon: 'settings', hidden: true}
    ];

    constructor(public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet) { }

    ngOnInit() {
        this.map = new MapService('map');
        this.physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(!this.position) this.center({lat: pos.latitude, lng: pos.longitude});
            if(this.positionMarker.arrow) this.map.delete(this.positionMarker.arrow);
            if(this.positionMarker.circle) this.map.delete(this.positionMarker.circle);
            this.positionMarker.arrow = this.map.newMarker({lat: pos.latitude, lng: pos.longitude}, {noDelete: true, icon: ARROW, rotationAngle: pos.heading, rotationOrigin: 'center'});
            this.positionMarker.circle = this.map.newCircle({lat: pos.latitude, lng: pos.longitude}, pos.accuracy, {interactive: false});
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
