import {NgModule} from "@angular/core";
import {AppRouting} from './app.routing';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {MapComponent} from "./views/map/map.component";
import {HomeComponent} from "./views/home/home.component";
import {MaterialModule} from "./material.module";
import {CalibrateComponent} from "./components/calibrate/calibrate.component";
import {PermissionsComponent} from "./components/permissions/permissions.component";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {PaletteComponent} from "./components/palette/palette.component"
import {ColorPickerDialogComponent} from "./components/colorPickerDialog/colorPickerDialog.component";
import {DimensionsDialogComponent} from "./components/dimensionsDialog/dimensionsDialog.component";
import {EditSymbolComponent} from "./components/editSymbol/editSymbol.component";
import {AngularFireModule} from "@angular/fire";
import {AngularFirestoreModule} from "@angular/fire/firestore";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {ClickOutsideModule} from "ng-click-outside";
import {ColorPickerModule} from "ngx-color-picker";
import {FormsModule} from "@angular/forms";
import {ServiceWorkerModule} from "@angular/service-worker";
import {StarrySkyComponent} from "./components/starrySky/starrySky.component";
import {AngularFireAuthModule} from "@angular/fire/auth";

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
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule.enablePersistence(),
        AngularFireAuthModule,
        AppRouting,
        BrowserAnimationsModule,
        BrowserModule,
        ClickOutsideModule,
        ColorPickerModule,
        FormsModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    ],
    providers: [],
    entryComponents: [CalibrateComponent, ColorPickerDialogComponent, DimensionsDialogComponent, EditSymbolComponent, PermissionsComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}
