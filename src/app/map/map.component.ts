import {Component} from "@angular/core";
import {GeolocationService} from "../geolocation/geolocation.service";
import {filter} from "rxjs/operators";
import {version} from "../../../package.json";

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss']
})
export class MapComponent {
    mapApi: any;
    position: any;
    style = 'terrain';
    version = version;

    constructor(public geolocation: GeolocationService) {
        geolocation.location.pipe(filter(coord => !!coord)).subscribe(pos => {
            if(this.mapApi) {
                console.log(pos);
                if(!this.position) this.center(pos);
                this.position = pos;
            }
        });
    }

    mapReady(map) {
        this.mapApi = map;
    }

    center(pos?) {
        if(!pos) pos = this.position;
        this.mapApi.setCenter({lat: pos.latitude, lng: pos.longitude});
    }
}
