import {Component} from "@angular/core";
import {fadeOut} from "../../animations";

@Component({
    selector: 'animated-background',
    templateUrl: 'animatedBackground.component.html',
    styleUrls: ['animatedBackground.component.scss'],
    animations: [fadeOut]
})
export class AnimatedBackgroundComponent {
    splash = true;

    constructor() {
        setTimeout(() => this.splash = false, 1000);
    }
}
