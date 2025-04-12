import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  template: `
    <div class="welcome-container">
      <div class="background-image"></div>
      <div class="welcome-card">
        <img src="/images/logo.png" class="logo-image" alt="Logo">
        <div class="button-group">
          <button (click)="goToLogin()" class="btn btn-primary">Iniciar Sesión</button>
          <button (click)="goToRegister()" class="btn btn-register">Registrarse</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  goToLogin() {
    console.log('Navegando a login');
    this.router.navigate(['/login']);
  }

  goToRegister() {
    console.log('Navegando a register');
    this.router.navigate(['/register']).then(nav => {
      if (!nav) {
        console.error('Falló la navegación a register');
        // Forzar recarga como último recurso
        window.location.href = '/register';
      }
    });
  }
}