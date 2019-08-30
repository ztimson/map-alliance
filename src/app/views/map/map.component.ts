import {Component, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics.service";
import {filter, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../models/toolbarItem";
import {flyInRight, flyOutRight} from "../../animations";
import {ARROW, MapLayers, MapService, MEASURE, WeatherLayers} from "../../services/map.service";
import {Subscription} from "rxjs";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {copyToClipboard} from "../../utils";
import {ActivatedRoute} from "@angular/router";
import {DimensionsDialogComponent} from "../../components/dimensionsDialog/dimensionsDialog.component";
import {MatDialog} from "@angular/material/dialog";

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
    position;
    positionMarker = {arrow: null, circle: null};
    shareDialog = false;
    showPalette = false;
    lastMeasuringPoint;
    measuringSubscription: Subscription;

    menu: ToolbarItem[] = [
        {name: 'Marker', icon: 'room', toggle: true, click: () => this.addMarker()},
        {name: 'Draw', icon: 'create', toggle: true, onEnabled: () => this.startDrawing(), onDisabled: () => this.stopDrawing()},
        {name: 'Circle', icon: 'panorama_fish_eye', toggle: true, click: () => this.addCircle()},
        {name: 'Square', icon: 'crop_square', toggle: true, click: () => this.addRectangle()},
        {name: 'Polygon', icon: 'details', toggle: true},
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

    constructor(public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet, private dialog: MatDialog, private route: ActivatedRoute) {
        this.route.params.subscribe(params => {
            this.code = params['code'];
        })
    }

    ngOnInit() {
        this.map = new MapService('map');

        // Handle click actions
        this.map.click.pipe(filter(e => !!e && e.symbol)).subscribe(e => {
            let symbol = e.symbol.symbol;
            if(this.menu[6].enabled) {
                if(!!symbol && symbol.noDelete) return;
                return this.map.delete(e.symbol);
            } else if(e.symbol instanceof L.Marker) {
                if(symbol.noSelect) return;
                /*this.bottomSheet.open(MarkerComponent, {data: e.symbol, hasBackdrop: false, disableClose: true});*/
            } else if(e.symbol instanceof L.Circle) {
                if(symbol.noSelect) return;
                /*this.bottomSheet.open(CircleComponent, {data: e.symbol, hasBackdrop: false, disableClose: true}).afterDismissed().subscribe(c => {
                    let circle = c['_symbol'];
                    this.map.delete(c);
                    this.map.newCircle(circle);
                });*/
            }
        });

        this.physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(!this.position) this.center({lat: pos.latitude, lng: pos.longitude});
            if(this.positionMarker.arrow) this.map.delete(this.positionMarker.arrow);
            if(this.positionMarker.circle) this.map.delete(this.positionMarker.circle);
            this.positionMarker.arrow = this.map.newMarker({latlng: {lat: pos.latitude, lng: pos.longitude}, noSelect: true, noDelete: true, icon: ARROW, rotationAngle: pos.heading, rotationOrigin: 'center'});
            this.positionMarker.circle = this.map.newCircle({latlng: {lat: pos.latitude, lng: pos.longitude}, color: '#2873d8', radius: pos.accuracy, interactive: false});
            this.position = pos;
        });

        this.physicsService.requireCalibration.subscribe(() => {
            this.snackBar.open('Compass requires calibration', 'calibrate', {
                duration: 5000,
                panelClass: 'bg-warning,text-white'
            }).onAction().subscribe(() => this.startCalibrating());
        });
    }

    addCircle() {
        this.map.click.pipe(skip(1), take(1), filter(() => this.menu[2].enabled)).subscribe(async e => {
            let dimensions = await this.dialog.open(DimensionsDialogComponent, {data: ['Radius (m)'], disableClose: true, panelClass: 'pb-0'}).afterClosed().toPromise();
            this.menu[2].enabled = false;
            this.map.newCircle({latlng: e.event.latlng, radius: dimensions[0]});
        });
    }

    addMarker() {
        this.map.click.pipe(skip(1), take(1), filter(() => this.menu[0].enabled)).subscribe(e => {
            this.menu[0].enabled = false;
            this.map.newMarker({latlng: e.event.latlng});
        });
    }

    addRectangle() {
        let lastPoint;
        this.map.click.pipe(skip(1), take(2)).subscribe(e => {
            if(lastPoint) {
                this.menu[3].enabled = false;
                console.log({latlng: lastPoint.getLatLng(), latlng2: e.event.latlng});
                this.map.newRectangle({latlng: lastPoint.getLatLng(), latlng2: e.event.latlng});
                this.map.delete(lastPoint);
                return;
            }
            lastPoint = this.map.newMarker({latlng: e.event.latlng});
        })
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
        this.menu[9].enabled = true;
        this.calibration = this.bottomSheet.open(CalibrateComponent, {
            hasBackdrop: false,
            disableClose: true
        });
        this.calibration.afterDismissed().subscribe(() => {
            this.menu[9].enabled = false;
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
                this.map.newMeasurement({latlng: this.lastMeasuringPoint.getLatLng(), latlng2: e.event.latlng});
                this.map.delete(this.lastMeasuringPoint);
            }
            this.lastMeasuringPoint = this.map.newMarker({latlng: e.event.latlng, icon: MEASURE});
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
