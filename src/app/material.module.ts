import {
    MatBottomSheetModule,
    MatButtonModule, MatDialogModule, MatDividerModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatMenuModule, MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule
} from "@angular/material";
import {NgModule} from "@angular/core";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

export const materialModules = [
    MatBottomSheetModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
];

@NgModule({
    imports: materialModules,
    exports: materialModules
})
export class MaterialModule { }
