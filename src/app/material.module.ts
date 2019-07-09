import {
    MatBottomSheetModule,
    MatButtonModule, MatDividerModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatMenuModule, MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule
} from "@angular/material";
import {NgModule} from "@angular/core";

export const materialModules = [
    MatBottomSheetModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSliderModule,
    MatSnackBarModule,
    MatToolbarModule,
];

@NgModule({
    imports: materialModules,
    exports: materialModules
})
export class MaterialModule { }
