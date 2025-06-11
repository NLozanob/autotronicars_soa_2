import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { UserLogin } from '../models/user-login.model';
import * as bcrypt from 'bcryptjs'; // Librería para hashing de contraseñas

// Decorador que hace el servicio disponible en toda la aplicación
@Injectable({ providedIn: 'root' })
export class AuthLogService {
  constructor(private firestore: Firestore) {} 

  /**
   * Registra el login de un usuario en Firestore
   * @param user - Objeto usuario de Firebase Auth
   * @param provider - Proveedor de autenticación ('password', 'google', etc.)
   * @param password - Contraseña en texto plano (solo para auth email/password)
   */
  async logUserLogin(user: any, provider: string, password?: string) {
    // Creación del objeto UserLogin con los datos del usuario
    const userLogin: UserLogin = {
      uid: user.uid, 
      email: user.email, 
      displayName: user.displayName || '', 
      authProvider: provider as any, 
      // Hasheo de contraseña si se proporciona (solo para auth email/password)
      encryptedPassword: password ? await bcrypt.hash(password, 10) : undefined,
      createdAt: serverTimestamp() // Marca de tiempo del servidor Firestore
    };

    // Referencia a la colección 'user_logins' en Firestore
    const colRef = collection(this.firestore, 'user_logins');
    
    // Añade un nuevo documento con los datos del login (siempre crea nuevo registro)
    await addDoc(colRef, userLogin);
  }
}