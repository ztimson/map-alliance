import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PhysicsService {
    private motionTimestamp;

    info = new BehaviorSubject(null);
    motion = new BehaviorSubject<DeviceMotionEvent>(null);
    speed = new BehaviorSubject(null);
    orientation = new BehaviorSubject<DeviceOrientationEvent>(null);
    position = new BehaviorSubject<Coordinates>(null);

    constructor() {
        // Gather physical data
        window.addEventListener('deviceorientation', orientation => this.orientation.next(orientation));
        window.addEventListener('devicemotion', motion => this.motion.next(motion));
        navigator.geolocation.watchPosition(pos => this.position.next(pos.coords));

        // Calculate speed from motion events
        this.motion.subscribe(event => {
            if (!this.motionTimestamp) return this.motionTimestamp = new Date().getTime();

            let currentTime = new Date().getTime();
            let {speedX, speedY, speedZ} = this.speed.value;
            this.speed.next({
                speedX: speedX + event.acceleration.x / 1000 * ((currentTime - this.motionTimestamp) / 1000) / 3600,
                speedY: speedY + event.acceleration.y / 1000 * ((currentTime - this.motionTimestamp) / 1000) / 3600,
                speedZ: speedZ + event.acceleration.z / 1000 * ((currentTime - this.motionTimestamp) / 1000) / 3600
            });
            this.motionTimestamp = currentTime;
        });

        // Combine data into one nice package
        combineLatest(this.position, this.orientation, this.speed).subscribe(data => {
            this.info.next({
                accuracy: data[0].accuracy,
                altitude: data[0].altitude,
                altitudeAccuracy: data[0].altitudeAccuracy,
                heading: data[0].heading || data[1].alpha,
                latitude: data[0].latitude,
                longitude: data[0].longitude,
                speed: data[0].speed || Math.sqrt(data[2].x**2 + data[2].y**2 + data[2].z**2),
            });
        })
    }
}
