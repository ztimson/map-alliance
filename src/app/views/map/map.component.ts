import {Component, OnInit} from "@angular/core";
import {PhysicsService} from "../../services/physics/physics.service";
import {filter, skip, take} from "rxjs/operators";
import {MatBottomSheet, MatSnackBar} from "@angular/material";
import {CalibrateComponent} from "../../components/calibrate/calibrate.component";
import {ToolbarItem} from "../../components/toolbar/toolbarItem";
import {BehaviorSubject} from "rxjs";
import {LatLngLiteral} from "@agm/core";
import {flyInRight, flyOutRight} from "../../animations";

declare const L;

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    animations: [flyInRight, flyOutRight]
})
export class MapComponent implements OnInit {
    map;



    drawColor: string;
    drawListener = [];
    mapApi: any;
    mapClick = new BehaviorSubject<LatLngLiteral>(null);
    mapStyle = [{
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{
            "visibility": "off"
        }]
    }];
    position: any;
    showPalette = false;
    style = 'terrain';
    isNaN = isNaN;

    menu: ToolbarItem[][] = [[
        {name: 'compass', icon: 'explore', hidden: true},
    ], [
        {name: 'marker', icon: 'room', toggle: true, individualToggle: true},
        {name: 'draw', icon: 'create', toggle: true, individualToggle: true},
        {name: 'measure', icon: 'straighten', toggle: true, individualToggle: true},
        {name: 'delete', icon: 'delete', toggle: true, individualToggle: true},
        {name: 'style', icon: 'terrain', enabled: true, toggle: true},
        {name: 'compass', icon: 'explore'}
    ], [
        {name: 'messages', icon: 'chat', hidden: true},
        {name: 'identity', icon: 'perm_identity', hidden: true},
        {name: 'settings', icon: 'settings', hidden: true}
    ]];

    constructor(public physicsService: PhysicsService, private snackBar: MatSnackBar, private bottomSheet: MatBottomSheet) {
        physicsService.info.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(this.mapApi) {
                // if(!this.position) this.center(pos);
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
            }).onAction()/*.subscribe(() => this.calibrate());*/
        });
    }

    ngOnInit() {
        this.map = L.map('map', {attributionControl: false, zoomControl: false}).setView([37.75, -122.23], 10);
        L.esri.basemapLayer('ImageryClarity').addTo(this.map);
    }

    // addMarker() {
    //     this.mapClick.pipe(skip(1), take(1)).subscribe(coords => {
    //         this.menu[1][0].enabled = false;
    //         let marker = new google.maps.Marker({
    //             map: this.mapApi,
    //             position: {lat: coords.lat, lng: coords.lng}
    //         });
    //         google.maps.event.addListener(marker, 'click', () => {
    //             if(this.menu[1][3].enabled) marker.setMap(null)
    //         });
    //     });
    // }
    //
    // measure() {
    //     let deg2rad = (deg) => deg * (Math.PI/180);
    //
    //     let distanceInM = (lat1, lon1, lat2, lon2) => {
    //         const R = 6371; // Radius of the earth in km
    //         let dLat = deg2rad(lat2-lat1);  // deg2rad below
    //         let dLon = deg2rad(lon2-lon1);
    //         let a =
    //             Math.sin(dLat/2) * Math.sin(dLat/2) +
    //             Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    //             Math.sin(dLon/2) * Math.sin(dLon/2)
    //         ;
    //         let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    //         return R * c * 1000
    //     };
    //
    //     let first;
    //     this.mapClick.pipe(skip(1), take(2)).subscribe(coords => {
    //         if(!first) {
    //             first = coords;
    //         } else {
    //             this.menu[1][2].enabled = false;
    //
    //             let line = new google.maps.Polyline({
    //                 map: this.mapApi,
    //                 path: [first, coords],
    //                 strokeColor: '#f00',
    //                 icons: [{
    //                     icon: {path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW},
    //                     offset: '0%'
    //                 }, {
    //                     icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
    //                     offset: '100%'
    //                 }]
    //             });
    //
    //             let distance = distanceInM(first.lat, first.lng, coords.lat, coords.lng);
    //
    //             let info = new google.maps.InfoWindow({
    //                 content: distance >= 1000 ? `${Math.round(distance / 100) / 10} km` : `${Math.round(distance)} m`,
    //                 position: {lat: (first.lat + coords.lat) / 2, lng: (first.lng + coords.lng) / 2}
    //             });
    //             info.open(this.mapApi);
    //
    //             google.maps.event.addListener(line, 'click', () => {
    //                 if(this.menu[1][3].enabled) {
    //                     line.setMap(null);
    //                     info.setMap(null);
    //                 }
    //             });
    //
    //             google.maps.event.addListener(info, 'click', () => {
    //                 if(this.menu[1][3].enabled) {
    //                     line.setMap(null);
    //                     info.setMap(null);
    //                 }
    //             });
    //         }
    //     })
    // }
    //
    // calibrate() {
    //     this.bottomSheet.open(CalibrateComponent, {
    //         hasBackdrop: false,
    //         disableClose: true
    //     });
    // }
    //
    // center(pos?) {
    //     if(!pos) pos = this.position;
    //     this.mapApi.setCenter({lat: pos.latitude, lng: pos.longitude});
    // }
    //
    // startDraw() {
    //     this.showPalette = true;
    //     this.mapApi.setOptions({draggable: false});
    //
    //     let drawHander = () => {
    //         let poly = new google.maps.Polyline({map: this.mapApi, clickable: true, strokeColor: this.drawColor});
    //         google.maps.event.addListener(poly, 'click', () => {
    //             if(this.menu[1][3].enabled) poly.setMap(null);
    //         });
    //         let moveListener = [
    //             google.maps.event.addListener(this.mapApi, 'touchmove', e => poly.getPath().push(e.latLng)),
    //             google.maps.event.addListener(this.mapApi, 'mousemove', e => poly.getPath().push(e.latLng))
    //         ];
    //         google.maps.event.addListener(this.mapApi, 'touchend', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
    //         google.maps.event.addListener(this.mapApi, 'mouseup', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
    //         google.maps.event.addListener(poly, 'touchend', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
    //         google.maps.event.addListener(poly, 'mouseup', () => moveListener.forEach(listener => google.maps.event.removeListener(listener)));
    //     };
    //
    //     this.drawListener = [
    //         google.maps.event.addDomListener(this.mapApi.getDiv(), 'touchstart', drawHander),
    //         google.maps.event.addDomListener(this.mapApi.getDiv(), 'mousedown', drawHander)
    //     ];
    // }
    //
    // endDraw() {
    //     this.showPalette = false;
    //     this.mapApi.setOptions({draggable: true});
    //     this.drawListener.forEach(listener => google.maps.event.removeListener(listener));
    //     this.drawListener = [];
    // }
}
