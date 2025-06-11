// Importaciones necesarias para el servicio
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
import { Firestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { FacebookAuthProvider } from '@angular/fire/auth';
import * as bcrypt from 'bcryptjs';

// Decorador que marca la clase como un servicio inyectable
@Injectable({
  providedIn: 'root', // Disponible en toda la aplicación
})
export class AuthService {
  // Inyección de dependencias
  private auth = inject(Auth); // Servicio de autenticación de Firebase
  private firestore = inject(Firestore); // Servicio de Firestore
  private router = inject(Router); // Router para navegación
  
  // Estado del usuario actual usando BehaviorSubject
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.initAuthListener(); // Inicializa el listener de estado de autenticación
  }

  // ==================== Métodos Básicos ====================
  
  // Método para inicio de sesión con email y contraseña
  async login(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.handleSuccessfulAuth(userCredential.user);
      await this.logUserAuth(userCredential.user, 'custom', password); // Loguear acceso
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  // Método para registrar nuevo usuario
  async register(email: string, password: string, additionalData?: any): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      // Guarda datos adicionales en Firestore
      await this.saveUserData(userCredential.user.uid, {
        email,
        ...additionalData,
        createdAt: new Date(),
      });
      await this.handleSuccessfulAuth(userCredential.user);
      await this.logUserAuth(userCredential.user, 'custom', password); // Loguear acceso
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Método para cerrar sesión
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
  
  // Autenticación con Google
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      await this.handleSocialLogin(userCredential, 'google');
      await this.logUserAuth(userCredential.user, 'google'); // Loguear acceso
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Autenticación con GitHub
  async loginWithGithub(): Promise<void> {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email'); // Solicitar acceso al email
      const userCredential = await signInWithPopup(this.auth, provider);
      await this.handleSocialLogin(userCredential, 'github');
      await this.logUserAuth(userCredential.user, 'github'); // Loguear acceso
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  // Manejo común para logins sociales
  private async handleSocialLogin(userCredential: UserCredential, provider: string): Promise<void> {
    const user = userCredential.user;
    let email = user.email;

    // Caso especial para GitHub que puede no devolver email
    if (provider === 'github' && !email) {
      email = await this.getGitHubEmail(user);
    }

    // Guardar datos del usuario en Firestore
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

  // ===================== Facebook ====================
  async loginWithFacebook(): Promise<void> {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email'); // Solicitar acceso al email
      provider.addScope('public_profile'); // Solicitar acceso al perfil público
      
      const userCredential = await signInWithPopup(this.auth, provider)
        .catch(async (error) => {
          // Manejo especial para error de cuenta existente
          if (error.code === 'auth/account-exists-with-different-credential') {
            await this.handleAccountExistsError(error);
            return;
          }
          throw error;
        });
  
      if (userCredential) {
        await this.handleSocialLogin(userCredential, 'facebook');
        await this.logUserAuth(userCredential.user, 'facebook'); // Loguear acceso
      }
    } catch (error) {
      console.error('Detalles completos del error:', error);
      this.handleAuthError(error);
      throw error;
    }
  }
  
  // Manejo de error cuando la cuenta ya existe con otro proveedor
  private async handleAccountExistsError(error: any): Promise<void> {
    const email = error.customData?.email;
    if (email) {
      await Swal.fire({
        icon: 'warning',
        title: 'Cuenta existente',
        text: `Ya existe una cuenta con el email ${email}. Por favor inicia sesión con el método original.`,
      });
    }
  }

  // ==================== Operaciones con Firestore ====================
  
  // Guardar datos del usuario en Firestore
  async saveUserData(userId: string, userData: any): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await setDoc(userRef, userData, { merge: true }); // merge: true para no sobrescribir datos existentes
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
      throw error;
    }
  }

  // Obtener datos del usuario desde Firestore
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

  // ==================== Log de Autenticaciones ====================
  // Guarda un registro de cada autenticación exitosa en la colección users_log
  private async logUserAuth(user: User, provider: string, password?: string): Promise<void> {
    try {
      const usersLogRef = collection(this.firestore, 'users_log');
      const encryptedPassword = password ? await bcrypt.hash(password, 10) : null;
      await addDoc(usersLogRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider,
        password: encryptedPassword, // Solo si aplica
        createdAt: serverTimestamp(), // Fecha/hora exacta del servidor
      });
    } catch (error) {
      console.error('Error al registrar log de autenticación:', error);
    }
  }

  // ==================== Helpers ====================
  
  // Obtener email de GitHub mediante API (cuando no viene en el login)
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

  // Generar avatar por defecto según proveedor
  private getDefaultProviderAvatar(uid: string, provider: string): string {
    return provider === 'github' 
      ? `https://avatars.githubusercontent.com/u/${uid}?v=4`
      : `https://ui-avatars.com/api/?name=${uid}&background=random`;
  }

  // Manejo común para autenticación exitosa
  private async handleSuccessfulAuth(user: User): Promise<void> {
    this.currentUserSubject.next(user); // Actualizar estado del usuario
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: '¡Autenticación exitosa!',
      showConfirmButton: false,
      timer: 1500
    });
    this.router.navigate(['/dashboard']); // Redirigir al dashboard
  }

  // Manejo de errores de autenticación
  private handleAuthError(error: any): void {
    console.error('Error de autenticación:', error);
    let errorMessage = 'Ocurrió un error durante la autenticación';

    // Mapeo de códigos de error a mensajes amigables
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

    // Mostrar error al usuario
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
    });
  }

  // ==================== Gestión de Estado ====================
  
  // Listener para cambios en el estado de autenticación
  private initAuthListener(): void {
    this.auth.onAuthStateChanged((user) => {
      this.currentUserSubject.next(user); // Actualizar estado
      if (!user) {
        this.router.navigate(['/login']); // Redirigir si no hay usuario
      }
    });
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Obtener ID del usuario actual
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}