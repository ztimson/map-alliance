import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ColorPickerDialogComponent} from "../colorPickerDialog/colorPickerDialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'palette',
    templateUrl: 'palette.component.html',
    styleUrls: ['palette.component.scss']
})
export class PaletteComponent implements OnInit {
    @Input() colors = ['#1d1d1a', '#ffffff', '#f4f554', '#33abe3', '#5fd75a', '#e9403d'];
    @Input() vertical = false;

    @Output() selectedChange = new EventEmitter<string>();

    private _selected;
    get selected() { return this._selected; }
    @Input() set selected(color: string) {
        this._selected = color;
        this.selectedChange.emit(this._selected);
    };

    constructor(private dialog: MatDialog) { }

    ngOnInit() {
        if(!this.selected) this.selected = this.colors[0];
    }

    colorPicker() {
        this.dialog.open(ColorPickerDialogComponent, {data: this.selected, hasBackdrop: false, panelClass: 'p-0'}).afterClosed()
            .subscribe(color => this.selected = color);
    }
}
