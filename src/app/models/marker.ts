import {LatLng} from "./latlng";

export interface Marker {
    latLng: LatLng;
    name: string;
    color: string;
    notes: string;
    icon: string;
}
