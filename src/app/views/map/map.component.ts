import {Component, isDevMode, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics.service";
import {filter, finalize, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../models/toolbarItem";
import {flyInRight, flyOutRight} from "../../animations";
import {MapLayers, MapService, WeatherLayers} from "../../services/map.service";
import {Subscription} from "rxjs";
import {copyToClipboard} from "../../utils";
import {ActivatedRoute} from "@angular/router";
import {DimensionsDialogComponent} from "../../components/dimensionsDialog/dimensionsDialog.component";
import {MatDialog} from "@angular/material/dialog";
import {SyncService} from "../../services/sync.service";
import {MapData, Marker} from "../../models/mapSymbol";

declare const L;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnInit {
    code: string;
    drawColor = '#ff4141';
    isNaN = isNaN;
    map: MapService;
    polygon: any;
    position;
    positionMarker = {arrow: null, circle: null};
    shareDialog = false;
    showPalette = false;
    sub: Subscription;

    startCalibrating = () => {
        let calibration = this.bottomSheet.open(CalibrateComponent, {hasBackdrop: false, disableClose: true});
        this.sub = calibration.afterDismissed().pipe(finalize(() => calibration.dismiss())).subscribe();
    };

    startCircle = menuItem => {
        this.sub = this.map.click.pipe(skip(1), take(1)).subscribe(async e => {
            let dimensions = await this.dialog.open(DimensionsDialogComponent, {
                data: ['Radius (m)'],
                disableClose: true,
                panelClass: 'pb-0'
            }).afterClosed().toPromise();
            menuItem.enabled = false;
            let circle = {latlng: e.latlng, radius: dimensions[0] || 500, color: '#ff4141'};
            this.syncService.addCircle(circle);
        });
    };

    startDelete = () => {
        this.sub = this.map.click.pipe(skip(1), filter(e => !!e.symbol)).subscribe(e => {
            if (!!e.symbol && e.symbol.noDelete) return;
            this.syncService.delete(e.symbol)
        });
    };

    startDrawing = () => {
        this.showPalette = true;
        this.map.lock();
        this.sub = this.map.touch.pipe(skip(1), filter(e => e.type == 'start'), finalize(() => {
            this.showPalette = false;
            this.map.lock(true);
        })).subscribe(e => {
            let p = {latlng: [e.latlng], noDelete: true, color: this.drawColor, weight: 8};
            let polyline = this.map.newPolyline(p);
            let drawingSub = this.map.touch.pipe(filter(e => e.type == 'move')).subscribe(e => polyline.addLatLng(e.latlng));
            this.map.touch.pipe(filter(e => e.type == 'end'), take(1)).subscribe(() => {
                drawingSub.unsubscribe();
                p.noDelete = false;
                p.latlng = polyline.getLatLngs().map(latlng => ({lat: latlng.lat, lng: latlng.lng}));
                this.map.delete(polyline);
                this.syncService.addPolyline(p);
            });
        })
    };

    startMarker = menuItem => {
        this.sub = this.map.click.pipe(skip(1), take(1)).subscribe(e => {
            menuItem.enabled = false;
            let marker: Marker = {latlng: e.latlng, color: '#ff4141'};
            this.syncService.addMarker(marker);
        });
    };

    startMeasuring = menuItem => {
        let lastPoint;
        this.sub = this.map.click.pipe(skip(1), take(2), finalize(() => this.map.delete(lastPoint))).subscribe(e => {
            if (lastPoint) {
                menuItem.enabled = false;
                let measurement = {
                    latlng: {lat: lastPoint.getLatLng().lat, lng: lastPoint.getLatLng().lng},
                    latlng2: e.latlng,
                    color: '#ff4141',
                    weight: 8
                };
                this.syncService.addMeasurement(measurement);
                return this.map.delete(lastPoint);
            }
            lastPoint = this.map.newMarker({latlng: e.latlng, color: '#ff4141'});
        })
    };

    startPolygon = () => {
        let lastPoint;
        this.sub = this.map.click.pipe(skip(1), finalize(() => this.map.delete(lastPoint))).subscribe(e => {
            if(!this.polygon) {
                let p = {latlng: [e.latlng], noDelete: true, color: '#ff4141'};
                this.polygon = this.map.newPolygon(p)
            } else {
                this.polygon.addLatLng(e.latlng);
                this.map.delete(lastPoint);
            }
            lastPoint = this.map.newMarker({latlng: e.latlng, color: '#ff4141'});
        })
    };

    startRectangle = menuItem => {
        let lastPoint;
        this.sub = this.map.click.pipe(skip(1), take(2), finalize(() => this.map.delete(lastPoint))).subscribe(e => {
            if (lastPoint) {
                menuItem.enabled = false;
                let rect = {
                    latlng: {lat: lastPoint.getLatLng().lat, lng: lastPoint.getLatLng().lng},
                    latlng2: e.latlng,
                    color: '#ff4141'
                };
                this.syncService.addRectangle(rect);
                return this.map.delete(lastPoint);
            }
            lastPoint = this.map.newMarker({latlng: e.latlng, color: '#ff4141'});
        })
    };

    stopPolygon = () => {
        if(this.polygon) {
            let p = {latlng: this.polygon.getLatLngs()[0].map(latlng => ({lat: latlng.lat, lng: latlng.lng})), color: '#ff4141'};
            this.map.delete(this.polygon);
            this.polygon = null;
            this.syncService.addPolygon(p);
        }
        if (this.sub) {
            this.sub.unsubscribe();
            this.sub = null;
        }
    };

    unsub = () => {
        if (this.sub) {
            this.sub.unsubscribe();
            this.sub = null;
        }
    };

    menu: ToolbarItem[] = [
        {name: 'Marker', icon: 'room', toggle: true, onEnabled: this.startMarker, onDisabled: this.unsub},
        {name: 'Draw', icon: 'create', toggle: true, onEnabled: this.startDrawing, onDisabled: this.unsub},
        {name: 'Circle', icon: 'panorama_fish_eye', toggle: true, onEnabled: this.startCircle, onDisabled: this.unsub},
        {name: 'Square', icon: 'crop_square', toggle: true, onEnabled: this.startRectangle, onDisabled: this.unsub},
        {name: 'Polygon', icon: 'details', toggle: true, onEnabled: this.startPolygon, onDisabled: this.stopPolygon},
        {name: 'Measure', icon: 'straighten', toggle: true, onEnabled: this.startMeasuring, onDisabled: () => this.unsub},
        {name: 'Delete', icon: 'delete', toggle: true, onEnabled: this.startDelete, onDisabled: this.unsub},
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
        {name: 'Calibrate', icon: 'explore', toggle: true, onEnabled: this.startCalibrating, onDisabled: this.unsub},
        {name: 'Share', icon: 'share', toggle: true, onEnabled: () => this.share(), onDisabled: () => this.shareDialog = false},
        {name: 'Messages', icon: 'chat', hidden: true},
        {name: 'Identity', icon: 'perm_identity', hidden: true},
        {name: 'Settings', icon: 'settings', hidden: true},
        {name: 'delete all', icon: 'cancel', click: () => this.map.deleteAll(), hidden: !isDevMode()}
    ];

    constructor(public physicsService: PhysicsService, private syncService: SyncService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet, private dialog: MatDialog, private route: ActivatedRoute) {
        this.route.params.subscribe(params => {
            this.code = params['code'];
            this.syncService.load(this.code);
        })
    }

    ngOnInit() {
        this.map = new MapService('map');

        // Handle drawing the map after updates
        this.syncService.mapSymbols.pipe(filter(s => !!s)).subscribe((map: MapData) => {
            this.map.deleteAll();
            if (map.circles) map.circles.forEach(c => this.map.newCircle(c));
            if (map.markers) map.markers.forEach(m => this.map.newMarker(m));
            if (map.measurements) map.measurements.forEach(m => this.map.newMeasurement(m));
            if (map.polygons) map.polygons.forEach(p => this.map.newPolygon(p));
            if (map.polylines) map.polylines.forEach(p => this.map.newPolyline(p));
            if (map.rectangles) map.rectangles.forEach(r => this.map.newRectangle(r));
        });

        // Handle opening symbols
        this.map.click.pipe(filter(e => !!e && e.item)).subscribe(e => {
            if (e.item instanceof L.Marker) {
                if (e.symbol.noSelect) return;
                /*this.bottomSheet.open(MarkerComponent, {data: e.symbol, hasBackdrop: false, disableClose: true});*/
            } else if (e.item instanceof L.Circle) {
                if (e.symbol.noSelect) return;
                /*this.bottomSheet.open(CircleComponent, {data: e.symbol, hasBackdrop: false, disableClose: true}).afterDismissed().subscribe(c => {
                    let circle = c['_symbol'];
                    this.map.delete(c);
                    this.map.newCircle(circle);
                });*/
            }
        });

        // Display location
        this.physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if (!this.position) this.center({lat: pos.latitude, lng: pos.longitude});
            if (this.positionMarker.arrow) this.map.delete(this.positionMarker.arrow);
            if (this.positionMarker.circle) this.map.delete(this.positionMarker.circle);
            this.positionMarker.arrow = this.map.newMarker({
                latlng: {lat: pos.latitude, lng: pos.longitude},
                noSelect: true,
                noDelete: true,
                icon: 'arrow',
                rotationAngle: pos.heading,
                rotationOrigin: 'center'
            });
            this.positionMarker.circle = this.map.newCircle({
                latlng: {lat: pos.latitude, lng: pos.longitude},
                color: '#2873d8',
                noSelect: true,
                noDelete: true,
                radius: pos.accuracy,
                interactive: false
            });
            this.position = pos;
        });

        // Calibration popup
        this.physicsService.requireCalibration.subscribe(() => {
            this.snackBar.open('Compass requires calibration', 'calibrate', {
                duration: 5000,
                panelClass: 'bg-warning,text-white'
            })
                .onAction().subscribe(() => this.startCalibrating());
        });
    }

    center(pos?) {
        if (!pos) pos = {lat: this.position.latitude, lng: this.position.longitude};
        this.map.centerOn(pos);
    }

    copyUrl() {
        copyToClipboard(window.location.href);
        this.snackBar.open('Copied to your clipboard! 📋', null, {duration: 3000})
    }

    share() {
        this.shareDialog = true;
        if (navigator['share']) {
            navigator['share']({
                title: 'Map Alliance',
                text: 'A map alliance has been requested!',
                url: window.location.href,
            })
        }
    }
}
