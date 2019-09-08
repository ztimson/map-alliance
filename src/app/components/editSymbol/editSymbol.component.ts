import {Component, Inject} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {MapSymbol} from "../../models/mapSymbol";
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {ColorPickerDialogComponent} from "../colorPickerDialog/colorPickerDialog.component";

@Component({
    selector: 'edit-symbol',
    templateUrl: 'editSymbol.component.html'
})
export class EditSymbolComponent {
    symbol: MapSymbol;
    mapItem;

    constructor(private dialog: MatDialog, private ref: MatBottomSheetRef, @Inject(MAT_BOTTOM_SHEET_DATA) data) {
        this.symbol = Object.assign({color: '#ff4141'}, data.symbol);
        this.mapItem = data.item;

        this.mapItem.enableEdit();
        this.ref.afterDismissed().subscribe(() => this.mapItem.disableEdit());
    }

    close() {
        let latlng = this.mapItem.getLatLng();
        this.symbol.latlng = {lat: latlng.lat, lng: latlng.lng};
        if(this.mapItem.getRadius) this.symbol['radius'] = this.mapItem.getRadius();
        this.ref.dismiss(this.symbol);
    }

    colorPicker() {
        this.dialog.open(ColorPickerDialogComponent, {data: this.symbol.color, hasBackdrop: false, panelClass: 'p-0'}).afterClosed()
            .subscribe(color => {
                this.symbol.color = color
            });
    }
}
