import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class PhysicsService {
    private motionTimestamp;

    requireCalibration = new EventEmitter();
    calibrate = new BehaviorSubject(0);

    info = new BehaviorSubject(null);
    motion = new BehaviorSubject<DeviceMotionEvent>(null);
    orientation = new BehaviorSubject<DeviceOrientationEvent>(null);
    position = new BehaviorSubject<Position>(null);
    speed = new BehaviorSubject(null);

    constructor() {
        // Gather physical data
        window.addEventListener('deviceorientation', orientation => this.orientation.next(orientation));
        window.addEventListener('devicemotion', motion => this.motion.next(motion));
        navigator.geolocation.watchPosition(position => this.position.next(position));

        // Calculate speed from motion events
        this.motion.subscribe(event => {
            if (!this.motionTimestamp) return this.motionTimestamp = new Date().getTime();

            let currentTime = new Date().getTime();
            let {speedX, speedY, speedZ} = this.speed.value || {speedX: 0, speedY: 0, speedZ: 0};
            this.speed.next({
                speedX: speedX + event.acceleration.x / 1000 * ((currentTime - this.motionTimestamp) / 1000) / 3600,
                speedY: speedY + event.acceleration.y / 1000 * ((currentTime - this.motionTimestamp) / 1000) / 3600,
                speedZ: speedZ + event.acceleration.z / 1000 * ((currentTime - this.motionTimestamp) / 1000) / 3600
            });
            this.motionTimestamp = currentTime;
        });

        // Combine data into one nice package
        combineLatest(this.position, this.orientation, this.calibrate, this.speed).subscribe(data => {
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

            if(info.heading == null && !!data[1] && data[1].alpha) {
                if(!data[1].absolute && this.calibrate.value == null) {
                    this.requireCalibration.emit();
                    this.calibrate.next(0);
                }

                info.heading = data[1].alpha + this.calibrate.value;
                if(info.heading > 360) info.heading -= 360;
                if(info.heading < 0) info.heading += 360;
            }
            if(info.speed == null && !!data[3]) info.speed = Math.sqrt(data[3].x**2 + data[3].y**2 + data[3].z**2);

            this.info.next(info);
        })
    }
}
