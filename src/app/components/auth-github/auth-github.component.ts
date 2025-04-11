import { Component, Output, EventEmitter } from '@angular/core';
import { Auth, signInWithPopup, GithubAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auth-github',
  standalone: true,
  template: `
    <button (click)="signInWithGithub()" class="github-auth-button">
      <img src="assets/icons/github-icon.svg" alt="GitHub Logo" width="20">
      Continuar con GitHub
    </button>
  `,
  styles: [`
    .github-auth-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #24292e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      justify-content: center;
    }
  `]
})
export class AuthGithubComponent {
  @Output() authSuccess = new EventEmitter<void>();

  constructor(private auth: Auth, private router: Router) {}

  async signInWithGithub() {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Autenticación con GitHub exitosa!',
        showConfirmButton: false,
        timer: 1500
      });
      this.authSuccess.emit();
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    } catch (error) {
      console.error('Error en autenticación con GitHub:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo autenticar con GitHub. Inténtalo de nuevo.',
      });
    }
  }
}