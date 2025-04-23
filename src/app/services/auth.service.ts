import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  UserCredential
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
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
      await this.handleSocialLogin(userCredential, 'google');
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async loginWithGithub(): Promise<void> {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email'); // Solicitar acceso al email
      const userCredential = await signInWithPopup(this.auth, provider);
      await this.handleSocialLogin(userCredential, 'github');
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  private async handleSocialLogin(userCredential: UserCredential, provider: string): Promise<void> {
    const user = userCredential.user;
    let email = user.email;

    // Obtener email para GitHub si no está disponible
    if (provider === 'github' && !email) {
      email = await this.getGitHubEmail(user);
    }

    await this.saveUserData(user.uid, {
      email: email || `${user.uid}@${provider}-user.com`,
      displayName: user.displayName || `${provider} User`,
      photoURL: user.photoURL || this.getDefaultProviderAvatar(user.uid, provider),
      provider,
      createdAt: new Date(),
      role: 'user'
    });

    await this.handleSuccessfulAuth(user);
  }

  // ==================== Operaciones con Firestore ====================
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
  private async getGitHubEmail(user: User): Promise<string> {
    try {
      const token = await user.getIdToken();
      const response = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const emails = await response.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      return primaryEmail?.email || '';
    } catch {
      return '';
    }
  }

  private getDefaultProviderAvatar(uid: string, provider: string): string {
    return provider === 'github' 
      ? `https://avatars.githubusercontent.com/u/${uid}?v=4`
      : `https://ui-avatars.com/api/?name=${uid}&background=random`;
  }

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
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ya existe una cuenta con este email usando otro proveedor';
          break;
      }
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
    });
  }

  // ==================== Gestión de Estado ====================
  private initAuthListener(): void {
    this.auth.onAuthStateChanged((user) => {
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