import {LatLng} from "./models/mapSymbol";

export const R = 6_371; // Radius of the Earth

export function copyToClipboard(value: string) {
    let el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    (el.style as any) = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

export function deg2rad(deg) {
    return deg * Math.PI / 180;
}

export function latLngBearing(latLng, latLng2) {
    let dLng = (latLng2.lng - latLng.lng);
    let y = Math.sin(dLng) * Math.cos(latLng2.lat);
    let x = Math.cos(latLng.lat) * Math.sin(latLng2.lat) - Math.sin(latLng.lat) * Math.cos(latLng2.lat) * Math.cos(dLng);
    return (360 - ((rad2deg(Math.atan2(y, x)) + 360) % 360));
}

export function latLngDistance(latLng, latLng2) {
    let dLat = deg2rad(latLng2.lat - latLng.lat);
    let dLng = deg2rad(latLng2.lng - latLng.lng);
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(latLng.lat)) * Math.cos(deg2rad(latLng2.lat)) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1000
}

export function rad2deg(rad) {
    return rad * 180 / Math.PI
}

export function relativeLatLng(latLng: LatLng, meters: number, deg: number) {
    let brng = deg2rad(deg);
    let d = meters / 1000;
    let lat = deg2rad(latLng.lat);
    let lng = deg2rad(latLng.lng);

    let latOut = Math.asin(Math.sign(lat) * Math.cos(d / R) + Math.cos(lat) * Math.sin(d / R) * Math.cos(brng));
    let lngOut = lng + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat), Math.cos(d / R) - Math.sin(lat) * Math.sin(latOut));
    latOut = rad2deg(latOut);
    lngOut = rad2deg(lngOut);

    return {lat: latOut, lng: lngOut};
}
