import { Component } from '@angular/core';
import {GeolocationService} from "./geolocation/geolocation.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(private geolocation: GeolocationService) {
    geolocation.location.subscribe(pos => console.log(pos));
  }
}
