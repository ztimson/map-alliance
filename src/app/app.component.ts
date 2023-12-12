import {Component} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {SwUpdate} from "@angular/service-worker";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(private snackbar: MatSnackBar, private update: SwUpdate) {
		// Check for updates
		(async () => {
			if(await update.checkForUpdate())
				snackbar.open('Update Available!! 🚀', 'Reload')
					.onAction().subscribe(async () => {
						await update.activateUpdate();
						location.reload();
				})
		})();
    }
}
