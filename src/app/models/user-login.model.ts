export interface UserLogin {
  uid: string;
  email: string;
  displayName?: string;
  authProvider: 'password' | 'google' | 'facebook' | 'github';
  encryptedPassword?: string;
  createdAt: any; // Firestore Timestamp
}