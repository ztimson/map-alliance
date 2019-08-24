import { Component } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(private snackbar: MatSnackBar, private update: SwUpdate) {
    update.available.subscribe(() => snackbar.open('Update Available!! 🚀', 'Reload').onAction().subscribe(async () => update.activateUpdate()))
    update.activated.subscribe(() => window.location.reload());
  }
}
