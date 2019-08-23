import {Component, Inject} from "@angular/core";
import {MatBottomSheetRef} from "@angular/material";
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";

@Component({
    selector: 'calibrate',
    templateUrl: 'marker.component.html'
})
export class MarkerComponent {

    constructor(private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) public marker) { }
}
