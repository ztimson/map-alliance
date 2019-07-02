import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {NotFoundComponent} from "./404/404.component";
import {MapComponent} from "./map/map.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
    {path: '', pathMatch: 'full', component: HomeComponent},
    {path: '404', component: NotFoundComponent},
    {path: '**', component: MapComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRouting { }
