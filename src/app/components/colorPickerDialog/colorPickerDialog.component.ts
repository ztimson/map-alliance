import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
    selector: '',
    templateUrl: `./colorPickerDialog.component.html`
})
export class ColorPickerDialogComponent {
    readonly originalColor: string;

    constructor(@Inject(MAT_DIALOG_DATA) public color) {
        this.originalColor = color;
    }
}
