import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import Swal from 'sweetalert2';

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
    this.initAuthListener();
  }

  // ==================== Métodos Básicos ====================
  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.handleSuccessfulAuth(userCredential.user);
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  async register(email: string, password: string, additionalData?: any): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.saveUserData(userCredential.user.uid, {
        email,
        ...additionalData,
        createdAt: new Date(),
      });
      await this.handleSuccessfulAuth(userCredential.user);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Sesión cerrada correctamente',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar la sesión',
      });
    }
  }

  // ==================== Autenticación Social ====================
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      
      await this.saveUserData(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: new Date(),
        role: 'user'
      });

      await this.handleSuccessfulAuth(userCredential.user);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async loginWithGithub(): Promise<void> {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      
      await this.saveUserData(userCredential.user.uid, {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'GitHub User',
        photoURL: userCredential.user.photoURL || '',
        createdAt: new Date(),
        role: 'user'
      });

      await this.handleSuccessfulAuth(userCredential.user);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // ==================== Firestore Operations ====================
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

  // ==================== Helpers ====================
  private async handleSuccessfulAuth(user: User): Promise<void> {
    this.currentUserSubject.next(user);
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: '¡Autenticación exitosa!',
      showConfirmButton: false,
      timer: 1500
    });
    this.router.navigate(['/dashboard']);
  }

  private handleAuthError(error: any): void {
    console.error('Error de autenticación:', error);
    let errorMessage = 'Ocurrió un error durante la autenticación';

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'El correo ya está registrado';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'El popup de autenticación fue cerrado';
          break;
      }
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
    });
  }

  // ==================== State Management ====================
  initAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}