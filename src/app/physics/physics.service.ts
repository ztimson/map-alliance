import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PhysicsService {
    private motionTimestamp;

    info = new BehaviorSubject(null);
    motion = new BehaviorSubject<DeviceMotionEvent>(null);
    orientation = new BehaviorSubject<DeviceOrientationEvent>(null);
    position = new BehaviorSubject<Coordinates>(null);
    speed = new BehaviorSubject(null);

    constructor() {
        // Gather physical data
        window.addEventListener('deviceorientation', orientation => this.orientation.next(orientation));
        window.addEventListener('devicemotion', motion => this.motion.next(motion));
        navigator.geolocation.watchPosition(pos => this.position.next(pos.coords));

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
        combineLatest(this.position, this.orientation, this.speed).subscribe(data => {
            if(!data[0]) return;

            let info = {
                accuracy: data[0].accuracy,
                altitude: data[0].altitude,
                altitudeAccuracy: data[0].altitudeAccuracy,
                heading: data[0].heading,
                latitude: data[0].latitude,
                longitude: data[0].longitude,
                speed: data[0].speed
            };

            if(info.heading == null && !!data[1]) info.heading = data[1].alpha;
            if(info.speed == null && !!data[2]) info.speed = Math.sqrt(data[2].x**2 + data[2].y**2 + data[2].z**2);

            this.info.next(info);
        })
    }
}
