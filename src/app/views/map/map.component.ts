import {Component, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics.service";
import {filter, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../models/toolbarItem";
import {flyInRight, flyOutRight} from "../../animations";
import {ARROW, MapLayers, MapService, MEASURE, WeatherLayers} from "../../services/map.service";
import {Subscription} from "rxjs";
import {MarkerComponent} from "../../components/marker/marker.component";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {copyToClipboard} from "../../utils";
import {ActivatedRoute} from "@angular/router";

declare const L;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnInit {
    calibration: MatBottomSheetRef;
    code: string;
    drawColor = '#ff4141';
    isNaN = isNaN;
    map: MapService;
    markers = [];
    position;
    positionMarker = {arrow: null, circle: null};
    shareDialog = false;
    showPalette = false;
    lastMeasuringPoint;
    measuringSubscription: Subscription;

    menu: ToolbarItem[] = [
        {name: 'Marker', icon: 'room', toggle: true, click: () => { this.addMarker(); }},
        {name: 'Draw', icon: 'create', toggle: true, onEnabled: () => this.startDrawing(), onDisabled: () => this.stopDrawing()},
        {name: 'Measure', icon: 'straighten', toggle: true, onEnabled: () => this.startMeasuring(), onDisabled: () => this.stopMeasuring()},
        {name: 'Delete', icon: 'delete', toggle: true},
        {name: 'Map Style', icon: 'terrain', subMenu: [
            {name: 'ESRI:Topographic', toggle: true, click: () => this.map.setMapLayer(MapLayers.ESRI_TOPOGRAPHIC)},
            {name: 'ESRI:Satellite', toggle: true, click: () => this.map.setMapLayer(MapLayers.ESRI_IMAGERY)},
            {name: 'ESRI:Satellite Clear', toggle: true, enabled: true, click: () => this.map.setMapLayer(MapLayers.ESRI_IMAGERY_CLARITY)}
        ]},
        {name: 'Weather', icon: 'cloud', subMenu: [
                {name: 'None', toggle: true, enabled: true, click: () => this.map.setWeatherLayer()},
                {name: 'Temperature', toggle: true, click: () => this.map.setWeatherLayer(WeatherLayers.TEMP_NEW)},
                {name: 'Wind', toggle: true, click: () => this.map.setWeatherLayer(WeatherLayers.WIND_NEW)},
                {name: 'Sea Level Pressure', toggle: true, click: () => this.map.setWeatherLayer(WeatherLayers.SEA_LEVEL_PRESSURE)},
                {name: 'Clouds', toggle: true, click: () => this.map.setWeatherLayer(WeatherLayers.CLOUDS_NEW)},
        ]},
        {name: 'Calibrate', icon: 'explore', toggle: true, onEnabled: () => this.startCalibrating(), onDisabled: () => this.stopCalibrating()},
        {name: 'Share', icon: 'share', toggle: true, onEnabled: () => this.share(), onDisabled: () => this.shareDialog = false},
        {name: 'Messages', icon: 'chat', hidden: true},
        {name: 'Identity', icon: 'perm_identity', hidden: true},
        {name: 'Settings', icon: 'settings', hidden: true}
    ];

    constructor(public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet, private route: ActivatedRoute) {
        this.route.params.subscribe(params => {
            this.code = params['code'];
        })
    }

    ngOnInit() {
        this.map = new MapService('map');

        // Handle click actions
        this.map.click.pipe(filter(e => !!e)).subscribe(e => {
            if(!!e.symbol && this.menu[3].enabled) return this.map.delete(e.symbol);
            if(e.symbol instanceof L.Marker) this.bottomSheet.open(MarkerComponent, {data: e.symbol});
        });

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
            }).onAction().subscribe(() => this.startCalibrating());
        });
    }

    addMarker() {
        this.map.click.pipe(skip(1), take(1), filter(() => this.menu[0].enabled)).subscribe(e => {
            this.menu[0].enabled = false;
            this.markers.push(e.event.latlng);
            this.map.newMarker(e.event.latlng);
        });
    }

    center(pos?) {
        if(!pos) pos = {lat: this.position.latitude, lng: this.position.longitude};
        this.map.centerOn(pos);
    }

    copyUrl() {
        copyToClipboard(window.location.href);
        this.snackBar.open('Copied to your clipboard! 📋', null, {duration: 3000})
    }

    share() {
        this.shareDialog = true;
        if(navigator['share']) {
            navigator['share']({
                title: 'Map Alliance',
                text: 'A map alliance has been requested!',
                url: window.location.href,
            })
        }
    }

    startCalibrating() {
        this.menu[6].enabled = true;
        this.calibration = this.bottomSheet.open(CalibrateComponent, {
            hasBackdrop: false,
            disableClose: true
        });
        this.calibration.afterDismissed().subscribe(() => {
            this.menu[6].enabled = false;
            this.calibration = null;
        });
    }

    startDrawing() {
        this.showPalette = true;
        this.map.startDrawing();
    }

    startMeasuring() {
        this.measuringSubscription = this.map.click.pipe(skip(1)).subscribe(e => {
            if(this.lastMeasuringPoint) {
                this.map.newMeasurement(this.lastMeasuringPoint.getLatLng(), e.event.latlng);
                this.map.delete(this.lastMeasuringPoint);
            }
            this.lastMeasuringPoint = this.map.newMarker(e.event.latlng, {icon: MEASURE});
        })
    }

    stopCalibrating() {
        if(this.calibration) this.calibration.dismiss();
    }

    stopDrawing() {
        this.showPalette = false;
        this.map.stopDrawing()
    }

    stopMeasuring() {
        if(this.measuringSubscription) {
            this.measuringSubscription.unsubscribe();
            this.measuringSubscription = null;
        }
        if(this.lastMeasuringPoint) {
            this.map.delete(this.lastMeasuringPoint);
            this.lastMeasuringPoint = null;
        }
    }
}
