import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material";

@Component({
    selector: 'permissions',
    templateUrl: 'permissions.component.html'
})
export class PermissionsComponent {
    icon: string;
    message: string;

    constructor(@Inject(MAT_DIALOG_DATA) data) {
        this.icon = data.icon;
        this.message = data.message;
    }
}
