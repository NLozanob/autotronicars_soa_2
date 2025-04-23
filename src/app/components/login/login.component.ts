import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthGithubComponent } from '../auth-github/auth-github.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink, AuthGithubComponent]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Limpiar inputs al inicializar el componente
  ngOnInit() {
    this.clearInputs();
  }

  clearInputs() {
    this.email = '';
    this.password = '';
  }

  mostrarError() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Credenciales incorrectas',
      confirmButtonColor: '#d33'
    });
  }

  mostrarExito() {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Inicio de Sesión Exitoso!',
      showConfirmButton: false,
      timer: 1500
    });
  }

  onSubmit(): void {
    console.log("Iniciando login...");
  
    this.authService.login(this.email, this.password)
      .then(success => {
        if (success) { 
          this.mostrarExito();
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.mostrarError();
        }
      })
      .catch(error => {
        console.error("Error en el login:", error);
        this.mostrarError();
      });
  }
  
  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
      });
    }
  }

  onAuthSuccess() {
    this.mostrarExito();
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
}