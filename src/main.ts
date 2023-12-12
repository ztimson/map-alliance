import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {initializeApp} from 'firebase/app';
import 'hammerjs';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

initializeApp(environment.firebase);

platformBrowserDynamic().bootstrapModule(AppModule)
	.catch(err => console.error(err));

// Leaflet touch polyfill ===========================================
declare const L;

// Touch support
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
	_eventWrapper: function(e) {
		let containerPoint = this._map.mouseEventToContainerPoint(e);
		let layerPoint = this._map.containerPointToLayerPoint(containerPoint);
		let latlng = this._map.layerPointToLatLng(layerPoint);

		return {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		}
	},
	_onTouchStart: function (e) {
		if (!this._map._loaded) return;
		this._map.fire('touchstart', this._eventWrapper(e));
	},
	_onTouchEnd: function (e) {
		if (!this._map._loaded) return;
		this._map.fire('touchend', this._eventWrapper(e));
	},
	_onTouchMove: function(e) {
		if(!this._map._loaded) return;
		this._map.fire('touchmove', this._eventWrapper(e));
	}
});
L.Map.addInitHook('addHandler', 'touchExtend', L.Map.TouchExtend);
