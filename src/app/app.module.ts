import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRouting} from './app.routing';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {FormsModule} from "@angular/forms";
import {MapComponent} from "./map/map.component";
import {NotFoundComponent} from "./404/404.component";
import {HomeComponent} from "./home/home.component";
import {AgmCoreModule} from "@agm/core";
import {MaterialModule} from "./material.module";



@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        MapComponent,
        NotFoundComponent,
    ],
    imports: [
        AgmCoreModule.forRoot({apiKey: 'AIzaSyDFtvCY6nH_HUoTBNf_5b-E8nRweSLYtxE'}),
        AppRouting,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
