export interface LatLng {
    lat: number;
    lng: number;
}

export interface MapData {
    circles?: Circle[];
    locations?: {[key: string]: Marker};
    markers?: Marker[];
    measurements?: Measurement[];
    polygons?: Polygon[];
    polylines?: Polyline[];
    rectangles?: Rectangle[];
}

export interface MapSymbol {
    symbol?: any;
    latlng?: LatLng | LatLng[];
    new?: boolean;
    noDelete?: boolean;
    noDeleteTool?: boolean;
    noSelect?: boolean;
    label?: string;
    color?: string;
    notes?: string;
    interactive?: boolean;
    rotationAngle?: number;
    rotationOrigin?: string;
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

export interface Rectangle extends MapSymbol {
    latlng: LatLng;
    latlng2: LatLng;
}
