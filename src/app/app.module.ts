import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRouting} from './app.routing';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {FormsModule} from "@angular/forms";
import {MapComponent} from "./map/map.component";
import {HomeComponent} from "./home/home.component";
import {AgmCoreModule} from "@agm/core";
import {MaterialModule} from "./material.module";
import {CalibrateComponent} from "./map/calibrate/calibrate.component";
import {MatInputModule} from "@angular/material";
import {PermissionsComponent} from "./permissions/permissions.component";
import {AngularFireModule} from "@angular/fire";
import {AngularFirestoreModule} from "@angular/fire/firestore";
import {ToolbarComponent} from "./map/toolbar/toolbar.component";

@NgModule({
    declarations: [
        AppComponent,
        CalibrateComponent,
        HomeComponent,
        MapComponent,
        PermissionsComponent,
        ToolbarComponent
    ],
    imports: [
        AgmCoreModule.forRoot({apiKey: 'AIzaSyDFtvCY6nH_HUoTBNf_5b-E8nRweSLYtxE'}),
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule.enablePersistence(),
        AppRouting,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        MatInputModule,
    ],
    providers: [],
    entryComponents: [CalibrateComponent, PermissionsComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}
