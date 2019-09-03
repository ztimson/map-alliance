import {Component} from "@angular/core";
import {MatBottomSheetRef} from "@angular/material";
import {PhysicsService} from "../../services/physics.service";
import {collapse, expand} from "../../animations";

@Component({
    selector: 'calibrate',
    templateUrl: 'calibrate.component.html',
    animations: [collapse, expand]
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
        let currentHeading = Math.round(this.physicsService.orientation.value.alpha);
        if(currentHeading > 0) {
            this.calibration = currentHeading - 360;
        } else {
            this.calibration = -currentHeading;
        }
    }
}
