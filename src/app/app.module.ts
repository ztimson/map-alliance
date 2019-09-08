import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRouting} from './app.routing';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {FormsModule} from "@angular/forms";
import {MapComponent} from "./views/map/map.component";
import {HomeComponent} from "./views/home/home.component";
import {MaterialModule} from "./material.module";
import {CalibrateComponent} from "./components/calibrate/calibrate.component";
import {MatInputModule} from "@angular/material";
import {PermissionsComponent} from "./components/permissions/permissions.component";
import {AngularFireModule} from "@angular/fire";
import {AngularFirestoreModule} from "@angular/fire/firestore";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {PaletteComponent} from "./components/palette/palette.component"
import {AnimatedBackgroundComponent} from "./components/animatedBackground/animatedBackground.component";
import {ClickOutsideModule} from "ng-click-outside";
import {ColorPickerModule} from "ngx-color-picker";
import {ColorPickerDialogComponent} from "./components/colorPickerDialog/colorPickerDialog.component";
import {DimensionsDialogComponent} from "./components/dimensionsDialog/dimensionsDialog.component";
import {EditSymbolComponent} from "./components/editSymbol/editSymbol.component";

@NgModule({
    declarations: [
        AnimatedBackgroundComponent,
        AppComponent,
        CalibrateComponent,
        ColorPickerDialogComponent,
        DimensionsDialogComponent,
        EditSymbolComponent,
        HomeComponent,
        MapComponent,
        PaletteComponent,
        PermissionsComponent,
        ToolbarComponent
    ],
    imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule.enablePersistence(),
        AppRouting,
        BrowserAnimationsModule,
        BrowserModule,
        ClickOutsideModule,
        ColorPickerModule,
        FormsModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        MatInputModule,
    ],
    providers: [],
    entryComponents: [CalibrateComponent, ColorPickerDialogComponent, DimensionsDialogComponent, EditSymbolComponent, PermissionsComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}
