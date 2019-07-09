import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MatSnackBar} from "@angular/material";

@Injectable({
    providedIn: 'root'
})
export class GeolocationService implements OnDestroy {
    private readonly watchRegistrationID;
    private orientation: DeviceOrientationEvent;

    location = new BehaviorSubject<any>(null);

    constructor(snackBar: MatSnackBar) {
        window.addEventListener('deviceorientation', (orientation) => this.orientation = orientation, true);

        if(navigator.geolocation) {
            this.watchRegistrationID = navigator.geolocation.watchPosition(pos => {
                this.location.next({
                    accuracy: pos.coords.accuracy,
                    altitude: pos.coords.altitude,
                    altitudeAccuracy: pos.coords.altitudeAccuracy,
                    heading: pos.coords.heading || this.orientation.alpha,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    speed: pos.coords.speed
                });
            }, (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        snackBar.open('Geolocation permission denied', null, {duration: 3000, horizontalPosition: 'right', panelClass: ['bg-warning', 'text-white']});
                        break;
                    case error.POSITION_UNAVAILABLE:
                        snackBar.open('Geolocation unavailable', null, {duration: 3000, horizontalPosition: 'right', panelClass: ['bg-warning', 'text-white']});
                        break;
                    case error.TIMEOUT:
                        snackBar.open('Geolocation timeout', null, {duration: 3000, horizontalPosition: 'right', panelClass: ['bg-warning', 'text-white']});
                        break;
                    default:
                        snackBar.open('Geolocation experienced an unknown error', null, {duration: 3000, horizontalPosition: 'right', panelClass: ['bg-warning', 'text-white']});
                }
            }, {enableHighAccuracy: true});
        } else {
            snackBar.open('Geolocation is not supported', null, {duration: 3000, horizontalPosition: 'right', panelClass: ['bg-warning', 'text-white']});
        }
    }

    ngOnDestroy() {
        if(this.watchRegistrationID) navigator.geolocation.clearWatch(this.watchRegistrationID);
    }
}
