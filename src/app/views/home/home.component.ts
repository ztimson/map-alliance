import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {SyncService} from "../../services/sync.service";

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss']
})
export class HomeComponent {
    splash = true;

    constructor(private syncService: SyncService, private router: Router) { }

    async new() {
        let mapCode: string;
        do {
            mapCode = Array(16).fill(0).map(() => chars[Math.round(Math.random() * chars.length)]).join('');
        } while (await this.syncService.exists(mapCode));
        return this.router.navigate(['/', mapCode]);
    }
}
