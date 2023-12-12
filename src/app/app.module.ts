import {isDevMode, NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ServiceWorkerModule} from "@angular/service-worker";
import {ClickOutsideModule} from "ng-click-outside";
import {ColorPickerModule} from "ngx-color-picker";
import {AppComponent} from './app.component';
import {AppRouting} from './app.routing';
import {CalibrateComponent} from "./components/calibrate/calibrate.component";
import {ColorPickerDialogComponent} from "./components/colorPickerDialog/colorPickerDialog.component";
import {DimensionsDialogComponent} from "./components/dimensionsDialog/dimensionsDialog.component";
import {EditSymbolComponent} from "./components/editSymbol/editSymbol.component";
import {PaletteComponent} from "./components/palette/palette.component";
import {PermissionsComponent} from "./components/permissions/permissions.component";
import {StarrySkyComponent} from "./components/starrySky/starrySky.component";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {MaterialModule} from "./material.module";
import {HomeComponent} from "./views/home/home.component";
import {MapComponent} from "./views/map/map.component";

@NgModule({
	declarations: [
		AppComponent,
		CalibrateComponent,
		ColorPickerDialogComponent,
		DimensionsDialogComponent,
		EditSymbolComponent,
		HomeComponent,
		MapComponent,
		PaletteComponent,
		PermissionsComponent,
		StarrySkyComponent,
		ToolbarComponent
	],
	imports: [
		AppRouting,
		BrowserAnimationsModule,
		BrowserModule,
		FormsModule,
		ClickOutsideModule,
		ColorPickerModule,
		MaterialModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:30000' // when stable or after 30 seconds
		})
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
