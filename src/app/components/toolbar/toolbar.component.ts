import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ToolbarItem} from "./toolbarItem";
import {version} from '../../../../package.json';

@Component({
    selector: 'toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent {
    @Input() menu: ToolbarItem[][];

    @Output() menuChange = new EventEmitter<ToolbarItem[][]>();

    readonly version = version;

    constructor() { }

    clickWrapper(item: ToolbarItem) {
        if(item.toggle) {
            if (item.individualToggle) {
                this.menu.forEach(menu => menu.filter(i2 => item.name != i2.name && i2.individualToggle).forEach(item => {
                    item.enabled = false;
                    if (item.onDisabled) item.onDisabled();
                }));
            }

            item.enabled = !item.enabled;
            this.menuChange.emit(this.menu);

            if(item.enabled) {
                if(item.onEnabled) item.onEnabled();
            } else {
                if(item.onDisabled) item.onDisabled();
            }
        }
        if(item.click) item.click();
    }
}
