import {Component} from "@angular/core";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {PhysicsService} from "../../services/physics.service";
import {collapse, expand} from "../../utils/animations";

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

	setCalibration(target: any) {
		this.calibration = target.value;
	}

	setN() {
		let currentHeading = Math.round(this.physicsService.orientation.value.alpha ?? 0);
		if(currentHeading > 0) {
			this.calibration = currentHeading > 180 ? currentHeading - 360 : currentHeading;
		} else {
			this.calibration = -currentHeading;
		}
	}
}
