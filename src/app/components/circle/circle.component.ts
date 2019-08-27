import {Component, Inject} from "@angular/core";
import {MatBottomSheetRef} from "@angular/material";
import {MAT_BOTTOM_SHEET_DATA} from "@angular/material/bottom-sheet";
import {Circle} from "../../models/mapSymbol";
import {MatDialog} from "@angular/material/dialog";
import {ColorPickerDialogComponent} from "../colorPickerDialog/colorPickerDialog.component";

@Component({
    selector: 'calibrate',
    templateUrl: 'circle.component.html'
})
export class CircleComponent {
    symbol: any;
    circle: Circle;

    constructor(private dialog: MatDialog, private bottomSheetRef: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) circle) {
        this.symbol = circle;
        this.circle = this.symbol.symbol;

        this.symbol.enableEdit();

        this.bottomSheetRef.afterDismissed().subscribe(() => this.symbol.disableEdit());
    }

    close() {
        this.circle.latlng = this.symbol.getLatLng();
        this.circle.radius = this.symbol.getRadius();
        this.bottomSheetRef.dismiss(this.symbol);
    }

    colorPicker() {
        this.dialog.open(ColorPickerDialogComponent, {data: this.circle.color, hasBackdrop: false, panelClass: 'p-0'}).afterClosed()
            .subscribe(color => {
                this.circle.color = color
            });
    }
}
