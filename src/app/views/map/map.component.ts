import {Component, isDevMode, OnDestroy, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics.service";
import {filter, finalize, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../models/toolbarItem";
import {flyInRight, flyOutRight} from "../../animations";
import {MapLayers, MapService, WeatherLayers} from "../../services/map.service";
import {Subscription} from "rxjs";
import {copyToClipboard, relativeLatLng} from "../../utils";
import {ActivatedRoute} from "@angular/router";
import {DimensionsDialogComponent} from "../../components/dimensionsDialog/dimensionsDialog.component";
import {MatDialog} from "@angular/material/dialog";
import {SyncService} from "../../services/sync.service";
import {MapData, MapSymbol, Marker} from "../../models/mapSymbol";
import {Adjectives} from "../../adjectives";
import {Nouns} from "../../nounes";
import {EditSymbolComponent} from "../../components/editSymbol/editSymbol.component";

declare const L;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnDestroy, OnInit {
    private calibration;

    code: string;
    drawColor = '#ff4141';
    map: MapService;
    name: string;
    polygon: any;
    position;
    positionMarker = {arrow: null, circle: null};
    shareDialog = false;
    showPalette = false;
    sub: Subscription;

    menu: ToolbarItem[];

    constructor(public physicsService: PhysicsService, public syncService: SyncService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet, private dialog: MatDialog, private route: ActivatedRoute) {
        this.name = localStorage.getItem('callSign');
        if(!this.name) {
            this.name = Adjectives[Math.floor(Math.random() * Adjectives.length)] + Nouns[Math.floor(Math.random() * Nouns.length)];
            localStorage.setItem('callSign', this.name);
        }

        this.menu = [
            {name: 'Marker', icon: 'room', toggle: true, onEnabled: this.startMarker, onDisabled: this.unsub},
            {name: 'Draw', icon: 'create', toggle: true, onEnabled: this.startDrawing, onDisabled: this.unsub},
            {name: 'Circle', icon: 'panorama_fish_eye', toggle: true, onEnabled: this.startCircle, onDisabled: this.unsub},
            {name: 'Square', icon: 'crop_square', toggle: true, onEnabled: this.startRectangle, onDisabled: this.unsub},
            {name: 'Polygon', icon: 'details', toggle: true, onEnabled: this.startPolygon, onDisabled: this.stopPolygon},
            {name: 'Measure', icon: 'straighten', toggle: true, onEnabled: this.startMeasuring, onDisabled: this.unsub},
            {name: 'Place Relative', icon: 'control_camera', click: this.placeRelative},
            {name: 'Delete', icon: 'delete', toggle: true, onEnabled: this.startDelete, onDisabled: this.unsub},
            {name: 'Map Style', icon: 'terrain', subMenu: [
                    {name: 'Bing:Satellite', toggle: true, click: () => this.map.setMapLayer(MapLayers.BING)},
                    {name: 'Google:Hybrid', toggle: true, enabled: true, click: () => this.map.setMapLayer(MapLayers.GOOGLE_HYBRID)},
                    {name: 'Google:Road', toggle: true, click: () => this.map.setMapLayer(MapLayers.GOOGLE_ROAD)},
                    {name: 'Google:Satellite', toggle: true, click: () => this.map.setMapLayer(MapLayers.GOOGLE_SATELLITE)},
                    {name: 'Google:Terrain', toggle: true, click: () => this.map.setMapLayer(MapLayers.GOOGLE_TERRAIN)},
                    {name: 'ESRI:Topographic', toggle: true, click: () => this.map.setMapLayer(MapLayers.ESRI_TOPOGRAPHIC)},
                    {name: 'ESRI:Satellite', toggle: true, click: () => this.map.setMapLayer(MapLayers.ESRI_IMAGERY)},
                    {name: 'ESRI:Satellite Clear', toggle: true, click: () => this.map.setMapLayer(MapLayers.ESRI_IMAGERY_CLARITY)}
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
            {name: 'Settings', icon: 'settings', hidden: true}
        ];
    }

    ngOnDestroy(): void {
        let ignore = this.syncService.unload();
    }

    ngOnInit() {
        // Setup services
        this.map = new MapService('map');
        this.route.params.subscribe(params => {
            this.code = params['code'];
            this.syncService.load(this.code, this.name);
        });

        // Setup map repainting on updates
        this.syncService.mapData.pipe(filter(s => !!s)).subscribe((map: MapData) => {
            this.map.deleteAll();
            if (map.circles) Object.values(map.circles).filter(c => !c.deleted).forEach(c => this.map.newCircle(c));
            if (map.locations) Object.values(map.locations).forEach(l => this.map.newMarker(Object.assign(l, {icon: 'dot', noDeleteTool: true})));
            if (map.markers) Object.values(map.markers).filter(m => !m.deleted).forEach(m => this.map.newMarker(m));
            if (map.measurements) Object.values(map.measurements).filter(m => !m.deleted).forEach(m => this.map.newMeasurement(m));
            if (map.polygons) Object.values(map.polygons).filter(p => !p.deleted).forEach(p => this.map.newPolygon(p));
            if (map.polylines) Object.values(map.polylines).filter(p => !p.deleted).forEach(p => this.map.newPolyline(p));
            if (map.rectangles) Object.values(map.rectangles).filter(r => !r.deleted).forEach(r => this.map.newRectangle(r));
        });

        // Handle opening map symbols
        this.map.click.pipe(filter(e => !!e)).subscribe(e => {
            if(this.sub == null && e.symbol) {
                if(e.symbol.noClick) return;
                this.syncService.freeze.next(true);
                this.sub = this.bottomSheet.open(EditSymbolComponent, {data: e, disableClose: true, hasBackdrop: false}).afterDismissed().pipe(finalize(() => this.sub = null)).subscribe(symbol => {
                    this.syncService.freeze.next(false);
                    this.syncService.delete(e.symbol);
                    if(e.item instanceof L.Circle) {
                        this.syncService.addCircle(symbol);
                    }
                });
            }
        });

        // Display location information & submit it
        this.physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if (!this.position) this.center({lat: pos.latitude, lng: pos.longitude});
            if (this.positionMarker.arrow) this.map.delete(this.positionMarker.arrow);
            if (this.positionMarker.circle) this.map.delete(this.positionMarker.circle);
            this.positionMarker.arrow = this.map.newMarker({latlng: {lat: pos.latitude, lng: pos.longitude}, noSelect: true, noDelete: true, noDeleteTool: true, icon: 'arrow', rotationAngle: (pos.heading / 2), rotationOrigin: 'center'});
            this.positionMarker.circle = this.map.newCircle({latlng: {lat: pos.latitude, lng: pos.longitude}, color: '#2873d8', noSelect: true, noDelete: true, noDeleteTool: true, radius: pos.accuracy, interactive: false});
            let ignore = this.syncService.addMyLocation({latlng: {lat: pos.latitude, lng: pos.longitude}, label: this.name, noDeleteTool: true});
            this.position = pos;
        });

        // Request calibration if needed
        this.physicsService.requireCalibration.subscribe(() => {
            if(!this.calibration) this.snackBar.open('Compass requires calibration', 'calibrate', {
                duration: 5000,
                panelClass: 'bg-warning,text-white'
            }).onAction().subscribe(() => this.startCalibrating());
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

    placeRelative = () => {
        this.dialog.open(DimensionsDialogComponent, {data: ['Distance (m)', 'Baring'], panelClass: 'pb-0'}).afterClosed().subscribe(dimensions => {
            if(!dimensions) return;
            let latlng = relativeLatLng({lat: this.position.latitude, lng: this.position.longitude}, dimensions[0], dimensions[1]);
            let marker: Marker = {latlng: latlng, color: '#ff4141'};
            this.syncService.addMarker(marker);
        })
    };

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

    startCalibrating = (menuItem?) => {
        this.calibration = this.bottomSheet.open(CalibrateComponent, {hasBackdrop: false, disableClose: true});
        this.sub = this.calibration.afterDismissed().pipe(finalize(() => {
            menuItem.enabled = false;
        })).subscribe(() => {
            this.calibration.dismiss();
            this.calibration = null;
            this.sub = null;
        });
    };

    startCircle = menuItem => {
        this.sub = this.map.click.pipe(skip(1), take(1)).subscribe(async e => {
            let dimensions = await this.dialog.open(DimensionsDialogComponent, {data: ['Radius (m)'], panelClass: 'pb-0'}).afterClosed().toPromise();
            if(!dimensions) return;
            menuItem.enabled = false;
            this.sub = null;
            let circle = {latlng: e.latlng, radius: dimensions[0]};
            this.syncService.addCircle(circle);
        });
    };

    startDelete = () => {
        this.sub = this.map.click.pipe(skip(1), filter(e => !!e.symbol)).subscribe(e => {
            if (!!e.symbol && e.symbol.noDeleteTool) return;
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
            let p = {latlng: [e.latlng], noClick: true, noDelete: true, color: this.drawColor, weight: 8};
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
            this.sub = null;
            let marker: Marker = {latlng: e.latlng};
            this.syncService.addMarker(marker);
        });
    };

    startMeasuring = () => {
        let lastPoint;
        this.sub = this.map.click.pipe(skip(1), finalize(() => this.map.delete(lastPoint))).subscribe(e => {
            if (lastPoint) {
                let measurement = {latlng: {lat: lastPoint.getLatLng().lat, lng: lastPoint.getLatLng().lng}, latlng2: e.latlng, noClick: true};
                this.syncService.addMeasurement(measurement);
                this.map.delete(lastPoint);
            }
            lastPoint = this.map.newMarker({latlng: e.latlng, color: '#ff4141'});
        })
    };

    startPolygon = () => {
        let lastPoint;
        this.sub = this.map.click.pipe(skip(1), finalize(() => this.map.delete(lastPoint))).subscribe(e => {
            if(!this.polygon) {
                let p = {latlng: [e.latlng], noDelete: true};
                this.polygon = this.map.newPolygon(p)
            } else {
                this.polygon.addLatLng(e.latlng);
                this.map.delete(lastPoint);
            }
            lastPoint = this.map.newMarker({latlng: e.latlng});
        })
    };

    startRectangle = menuItem => {
        let lastPoint;
        this.sub = this.map.click.pipe(skip(1), take(2), finalize(() => this.map.delete(lastPoint))).subscribe(e => {
            if (lastPoint) {
                menuItem.enabled = false;
                this.sub = null;
                let rect = {latlng: {lat: lastPoint.getLatLng().lat, lng: lastPoint.getLatLng().lng}, latlng2: e.latlng};
                this.syncService.addRectangle(rect);
                return this.map.delete(lastPoint);
            }
            lastPoint = this.map.newMarker({latlng: e.latlng, color: '#ff4141'});
        })
    };

    stopPolygon = () => {
        if(this.polygon) {
            let p = {latlng: this.polygon.getLatLngs()[0].map(latlng => ({lat: latlng.lat, lng: latlng.lng}))};
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
}
