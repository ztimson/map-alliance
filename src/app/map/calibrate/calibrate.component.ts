import {Component} from "@angular/core";
import {MatBottomSheetRef} from "@angular/material";
import {PhysicsService} from "../../physics/physics.service";

@Component({
    selector: 'calibrate',
    templateUrl: 'calibrate.component.html'
})
export class CalibrateComponent {
    private _calibration = 0;
    get calibration() { return this._calibration; }
    set calibration(c: number) {
        this._calibration = c;
        this.physicsService.calibrate.next(c);
    }

    constructor(private bottomSheetRef: MatBottomSheetRef, public physicsService: PhysicsService) {
        this._calibration = this.physicsService.calibrate.value;
    }

    close() {
        this.bottomSheetRef.dismiss();
    }

    setN() {
        let currentHeading = this.physicsService.orientation.value.alpha;
        if(currentHeading <= 180) {
            this.calibration = 360 - Math.round(currentHeading);
        } else {
            this.calibration = -Math.round(currentHeading);
        }
    }
}
