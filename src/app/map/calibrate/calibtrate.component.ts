import {Component, Inject} from "@angular/core";
import {Subject} from "rxjs";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material";

@Component({
    selector: 'calibrate',
    templateUrl: 'calibrate.component.html'
})
export class CalibtrateComponent {
    private _calibration = 0;
    get calibration() { return this._calibration; }
    set calibration(c: number) {
        this._calibration = c;
        this.out.next(c);
    }

    out: Subject<number>;
    heading: number;

    constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) pipe) {
        this.out = pipe.out;
        pipe.in.subscribe(heading => this.heading = heading);
    }

    log = (e) => console.log(e);

    close() {
        this.bottomSheetRef.dismiss();
    }

    setN() {
        let c = this.heading;
        this.calibration = -c;
    }
}
