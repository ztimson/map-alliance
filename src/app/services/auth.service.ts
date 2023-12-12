import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {User} from '../models/user';
import {getAuth, FacebookAuthProvider, GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {collection, getFirestore, doc, getDoc} from 'firebase/firestore';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	readonly collection = 'Users';

	authenticated = false;
	user = new BehaviorSubject<User | false>(null);

	private get auth() { return getAuth(); }
	private get db() { return getFirestore(); }

	constructor(private router: Router) {
		this.user.subscribe(user => this.authenticated = user instanceof Object);
		this.whoAmI();
	}

	async loginWithGoogle() {
		const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
		this.user.next(result.user);
		return result.user;
	}

	async loginWithFacebook() {
		const result = await signInWithPopup(this.auth, new FacebookAuthProvider());
		this.user.next(result.user);
		return result.user;
	}

	async logout() {
		await this.auth.signOut();
		this.user.next(false);
		return this.router.navigate(['/']);
	}

	async whoAmI() {
		await this.auth.authStateReady();
		const user = this.auth.currentUser || false;
		if(!!user) {
			const ref = doc(collection(this.db, this.collection), user.uid);
			const data = await getDoc(ref);
			Object.assign(user, {ref, ...data});
		}
		this.user.next(user);
		return user;
	}
}
