import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MatSnackBar} from "@angular/material";

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    location = new BehaviorSubject(null);

    constructor(private snackBar: MatSnackBar) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.updatePosition, this.errorHandler);
        } else {
            snackBar.open('Geolocation is not supported', null, {horizontalPosition: 'right', panelClass: 'bg-warn'});
        }
    }

    updatePosition(position) {
        this.location.next(position);
    }

    errorHandler(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                this.snackBar.open('Geolocation permission denied', null, {horizontalPosition: 'right', panelClass: 'bg-warn'});
                break;
            case error.POSITION_UNAVAILABLE:
                this.snackBar.open('Geolocation unavailable', null, {horizontalPosition: 'right', panelClass: 'bg-warn'});
                break;
            case error.TIMEOUT:
                this.snackBar.open('Geolocation timeout', null, {horizontalPosition: 'right', panelClass: 'bg-warn'});
                break;
            case error.UNKNOWN_ERROR:
                this.snackBar.open('Geolocation experienced an unknown error', null, {horizontalPosition: 'right', panelClass: 'bg-warn'});
                break;
        }
    }
}
