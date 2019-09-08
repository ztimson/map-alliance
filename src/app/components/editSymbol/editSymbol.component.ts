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
        if(this.mapItem.getRadius) {
            let latlng = this.mapItem.getLatLng();
            this.symbol.latlng = {lat: latlng.lat, lng: latlng.lng};
            this.symbol['radius'] = this.mapItem.getRadius();
        } else if(this.mapItem.getLatLngs) {
            let path = this.mapItem.getLatLngs();
            this.symbol.latlng = path[0].map(latlng => ({lat: latlng.lat, lng: latlng.lng}));
        } else if(this.mapItem.getBounds) {
            let bounds = this.mapItem.getBounds();
            this.symbol.latlng = {lat: bounds['_northEast'].lat, lng: bounds['_northEast'].lng};
            this.symbol['latlng2'] = {lat: bounds['_southWest'].lat, lng: bounds['_southWest'].lng};
        } else if(this.mapItem.getLatLng) {
            let latlng = this.mapItem.getLatLng();
            this.symbol.latlng = {lat: latlng.lat, lng: latlng.lng};
        }

        this.ref.dismiss(this.symbol);
    }

    colorPicker() {
        this.dialog.open(ColorPickerDialogComponent, {data: this.symbol.color, hasBackdrop: false, panelClass: 'p-0'}).afterClosed()
            .subscribe(color => {
                this.symbol.color = color
            });
    }
}
