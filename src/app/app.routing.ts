import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MapComponent} from "./views/map/map.component";
import {HomeComponent} from "./views/home/home.component";

const routes: Routes = [
    {path: ':code', component: MapComponent},
    {path: '**', pathMatch: 'full', component: HomeComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRouting { }
