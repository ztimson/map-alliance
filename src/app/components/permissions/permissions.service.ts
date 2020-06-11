import {Injectable} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {PermissionsComponent} from "./permissions.component";

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    constructor(private dialog: MatDialog) { }

    async requestPermission(name: string, icon: string, message: string) {
        let perm = await navigator['permissions'].query({name: <PermissionName>name});
        if (perm.state == 'prompt') {
            return await this.dialog.open(PermissionsComponent, {autoFocus: false, data: {icon: icon, message: message}}).afterClosed().toPromise();
        }
        return perm.state == 'granted'
    }
}
