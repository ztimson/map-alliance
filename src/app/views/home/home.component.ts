import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {SyncService} from "../../services/sync.service";
import {AuthService} from "../../services/auth.service";
import {fadeIn} from "../../animations";

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss'],
    animations: [fadeIn]
})
export class HomeComponent {
    code: string = '';
    valid = false;

    constructor(public authService: AuthService, private syncService: SyncService, private router: Router) { }

    async new() {
        let mapCode: string;
        do {
            mapCode = Array(8).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
        } while (await this.syncService.exists(mapCode));
        return this.router.navigate(['/', mapCode]);
    }

    isValid() {
        this.valid = !this.code.split('').filter(c => chars.indexOf(c) == -1).length
    }
}
