import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
    selector: 'palette',
    templateUrl: 'palette.component.html',
    styleUrls: ['palette.component.scss']
})
export class PaletteComponent implements OnInit {
    @Input() colors = ['#1d1d1a', '#ffffff', '#008dd5', '#1a891d', '#ff4141'];
    @Input() vertical = false;

    @Output() selectedChange = new EventEmitter<string>();

    private _selected;
    get selected() { return this._selected; }
    @Input() set selected(color: string) {
        this._selected = color;
        this.selectedChange.emit(this._selected);
    };

    constructor() { }

    ngOnInit() {
        if(!this.selected) this.selected = this.colors[0];
    }
}
