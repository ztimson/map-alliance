import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {PermissionsService} from "../components/permissions/permissions.service";

@Injectable({
    providedIn: 'root'
})
export class PhysicsService {
    private _mode: string;
    get mode() { return this._mode; }
    set mode(mode: string) {
        this._mode = mode;
        localStorage.setItem('headingMode', mode);
        this.calibrate.next(this.calibrate.value);
    }

    requireCalibration = new EventEmitter();
    calibrate = new BehaviorSubject<number>(Infinity);

    info = new BehaviorSubject(null);
    motion = new BehaviorSubject<DeviceMotionEvent>(null);
    orientation = new BehaviorSubject<DeviceOrientationEvent>(null);
    position = new BehaviorSubject<Position>(null);

    constructor(permissionsService: PermissionsService) {
        this.mode = localStorage.getItem('headingMode');
        permissionsService.requestPermission('geolocation', 'gps_fixed', 'Can we use your location?').then(granted => {
            if(granted) {
                // Gather physical data
                window.addEventListener('devicemotion', motion => this.motion.next(motion));
                window.addEventListener('deviceorientation', orientation => this.orientation.next(orientation));
                navigator.geolocation.watchPosition(position => this.position.next(position));

                // Combine data into one nice package
                combineLatest(this.position, this.orientation, this.calibrate).subscribe(data => {
                    if(!data[0]) return;

                    let info = {
                        accuracy: data[0].coords.accuracy,
                        altitude: data[0].coords.altitude,
                        altitudeAccuracy: data[0].coords.altitudeAccuracy,
                        heading: data[0].coords.heading,
                        latitude: data[0].coords.latitude,
                        longitude: data[0].coords.longitude,
                        speed: data[0].coords.speed
                    };

                    if(this.mode == null) this.mode = info.heading ? 'gps' : 'orientation';
                    if(this.mode == 'orientation') {
                        if((!data[1] || !data[1].absolute) && data[2] == Infinity) {
                            this.calibrate.next(0);
                            this.requireCalibration.emit();
                        }

                        info.heading = -(data[1] ? data[1].alpha : 0) - (data[2] == Infinity ? 0 : data[2]);
                        if(info.heading < 0) info.heading += 360;
                        if(info.heading >= 360) info.heading -= 360;
                    }

                    this.info.next(info);
                })
            }
        });
    }
}
