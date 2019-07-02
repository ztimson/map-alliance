import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRouting} from './app.routing';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {FormsModule} from "@angular/forms";
import {MatSnackBarModule, MatToolbarModule} from "@angular/material";
import {MapComponent} from "./map/map.component";
import {NotFoundComponent} from "./404/404.component";
import {HomeComponent} from "./home/home.component";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        MapComponent,
        NotFoundComponent,
    ],
    imports: [
        BrowserModule,
        AppRouting,
        BrowserAnimationsModule,
        FormsModule,
        MatSnackBarModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        MatToolbarModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
