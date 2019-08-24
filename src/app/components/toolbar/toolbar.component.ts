import {AfterViewInit, Component, EventEmitter, HostListener, Input, Output,} from "@angular/core";
import {ToolbarItem} from "../../models/toolbarItem";
import {version} from '../../../../package.json';

@Component({
    selector: 'toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent implements AfterViewInit {
    @Input() menuItems: ToolbarItem[];

    @Output() menuItemsChange = new EventEmitter<ToolbarItem[]>();

    readonly version = version;

    maxMenuItems = 0;

    constructor() { }

    @HostListener('window:resize', ['$event'])
    ngAfterViewInit() {
        setTimeout(() => this.maxMenuItems = Math.floor((document.getElementById('toolbar').offsetWidth - 200) / 75), 1);
    }

    clickWrapper(item: ToolbarItem, menu?: ToolbarItem[]) {
        if(item.toggle) {
            if (!item.individualToggle) {
                menu.filter(i => item.name != i.name && !i.individualToggle).forEach(item => {
                    item.enabled = false;
                    if (item.onDisabled) item.onDisabled();
                });
            }

            item.enabled = !item.enabled;
            this.menuItemsChange.emit(this.menuItems);

            if(item.enabled) {
                if(item.onEnabled) item.onEnabled();
            } else {
                if(item.onDisabled) item.onDisabled();
            }
        }
        if(item.click) item.click();
    }
}