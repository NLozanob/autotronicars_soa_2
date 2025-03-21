import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  }

  async register(email: string, password: string, userData?: any): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (userData) {
        await this.saveUserData(userCredential.user.uid, {
          email,
          ...userData,
          createdAt: new Date(),
        });
      }
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al registrarse:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);

      await this.saveUserData(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: new Date(),
      });

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async saveUserData(userId: string, userData: any): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
      throw error;
    }
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  initAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('Usuario autenticado:', user.email);
      } else {
        console.log('Usuario no autenticado');
        this.router.navigate(['/login']);
      }
    });
  }
}