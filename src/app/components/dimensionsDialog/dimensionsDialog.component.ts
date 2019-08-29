import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'dimensions-dialog',
    templateUrl: './dimensionsDialog.component.html',
    styleUrls: ['./dimensionsDialog.component.scss']
})
export class DimensionsDialogComponent {
    dimensionsOut: number[];

    constructor(private ref: MatDialogRef<DimensionsDialogComponent>, @Inject(MAT_DIALOG_DATA) public dimensions: string[]) {
        this.dimensionsOut = Array(dimensions.length).fill(0);
    }

    close() {
        this.ref.close(this.dimensionsOut);
    }
}
