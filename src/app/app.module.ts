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
import {CalibtrateComponent} from "./map/calibrate/calibtrate.component";
import {MatInputModule} from "@angular/material";



@NgModule({
    declarations: [
        AppComponent,
        CalibtrateComponent,
        HomeComponent,
        MapComponent
    ],
    imports: [
        AgmCoreModule.forRoot({apiKey: 'AIzaSyDFtvCY6nH_HUoTBNf_5b-E8nRweSLYtxE'}),
        AppRouting,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        MatInputModule,
    ],
    providers: [],
    entryComponents: [CalibtrateComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}
