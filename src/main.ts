import 'hammerjs';
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

// Add touch events to leaflet
declare const L;

L.Map.mergeOptions({touchExtend: true});

L.Map.TouchExtend = L.Handler.extend({
    initialize: function (map) {
        this._map = map;
        this._container = map._container;
        this._pane = map._panes.overlayPane;
    },
    addHooks: function () {
        L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
        L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
        L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);
    },
    removeHooks: function () {
        L.DomEvent.off(this._container, 'touchstart', this._onTouchStart);
        L.DomEvent.off(this._container, 'touchend', this._onTouchEnd);
        L.DomEvent.off(this._container, 'touchmove', this._onTouchMove);
    },
    _onTouchStart: function (e) {
        if (!this._map._loaded) return;

      var containerPoint = this._map.mouseEventToContainerPoint(e),
          layerPoint = this._map.containerPointToLayerPoint(containerPoint),
          latlng = this._map.layerPointToLatLng(layerPoint);

        this._map.fire('touchstart', {
          latlng: latlng,
          layerPoint: layerPoint,
          containerPoint: containerPoint,
            originalEvent: e
        });
    },
    _onTouchEnd: function (e) {
        if (!this._map._loaded) return;
        this._map.fire('touchend', {originalEvent: e});
    },
    _onTouchMove: function(e) {
        if(!this._map._loaded) return;
        console.log('fire');
      var containerPoint = this._map.mouseEventToContainerPoint(e),
          layerPoint = this._map.containerPointToLayerPoint(containerPoint),
          latlng = this._map.layerPointToLatLng(layerPoint);
        this._map.fire('touchmove', {
          latlng: latlng,
          layerPoint: layerPoint,
          containerPoint: containerPoint,
          originalEvent: e
        });
    }
});
L.Map.addInitHook('addHandler', 'touchExtend', L.Map.TouchExtend);
