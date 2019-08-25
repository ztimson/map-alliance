import {Component} from "@angular/core";
import {Observable, timer} from "rxjs";
import {map, take} from "rxjs/operators";
import {Router} from "@angular/router";
import {SyncService} from "../../services/sync.service";

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

@Component({
    selector: 'home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss']
})
export class HomeComponent {
    phrase = 'If you\'re into that';
    typedText: Observable<string>;

    constructor(private syncService: SyncService, private router: Router) {
        this.typedText = timer(750, 50).pipe(take(this.phrase.length), map((i: number) => this.phrase.substring(0, i + 1)));
    }

    async new() {
        let mapCode: string;
        do {
            mapCode = Array(16).fill(0).map(() => chars[Math.round(Math.random() * chars.length)]).join('');
        } while (await this.syncService.exists(mapCode));
        return this.router.navigate(['/', mapCode]);
    }
}
