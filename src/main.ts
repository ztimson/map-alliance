import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {initializeApp} from 'firebase/app';
import 'hammerjs';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

initializeApp(environment.firebase);

platformBrowserDynamic().bootstrapModule(AppModule)
	.catch(err => console.error(err));
