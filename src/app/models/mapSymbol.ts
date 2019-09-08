export interface LatLng {
    lat: number;
    lng: number;
}

export interface MapData {
    circles?: {[key: string]: Circle};
    locations?: {[key: string]: Marker};
    markers?: {[key: string]: Marker};
    measurements?: {[key: string]: Measurement};
    polygons?: {[key: string]: Polygon};
    polylines?: {[key: string]: Polyline};
    rectangles?: {[key: string]: Rectangle};
}

export interface MapSymbol {
    deleted?: boolean;
    id?: string;
    symbol?: any;
    latlng?: LatLng | LatLng[];
    noClick?: boolean;
    noDelete?: boolean;
    noDeleteTool?: boolean;
    noSelect?: boolean;
    label?: string;
    color?: string;
    notes?: string;
    interactive?: boolean;
    rotationAngle?: number;
    rotationOrigin?: string;
    updated?: number;
}

export interface Circle extends MapSymbol {
    latlng: LatLng;
    radius?: number;
}

export interface Marker extends MapSymbol {
    latlng: LatLng;
    icon?: any;
}

export interface Measurement extends MapSymbol {
    latlng: LatLng;
    latlng2: LatLng;
    weight?: number;
}

export interface Polygon extends MapSymbol {
    latlng: LatLng[];
}

export interface Polyline extends MapSymbol {
    latlng: LatLng[];
    weight?: number;
}

export interface Position extends Marker {
    timestamp?: Date;
}

export interface Rectangle extends MapSymbol {
    latlng: LatLng;
    latlng2: LatLng;
}
