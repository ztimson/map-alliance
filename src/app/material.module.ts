import {
    MatBottomSheetModule,
    MatButtonModule,
    MatIconModule, MatMenuModule,
    MatSnackBarModule,
    MatToolbarModule
} from "@angular/material";
import {NgModule} from "@angular/core";

export const materialModules = [
    MatBottomSheetModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatToolbarModule,
];

@NgModule({
    imports: materialModules,
    exports: materialModules
})
export class MaterialModule { }
