import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { AuthGithubComponent } from '../auth-github/auth-github.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthGithubComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const { email, password, name } = this.registerForm.value;
        await this.authService.register(email, password, {
          displayName: name,
          role: 'user',
          photoURL: '',
        });

        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
          timer: 2000,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      } catch (error: any) {
        let errorMessage = 'Error al registrar usuario. Inténtalo de nuevo.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'El correo electrónico ya está en uso.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
      } finally {
        this.loading = false;
      }
    } else {
      this.registerForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor, completa el formulario correctamente.',
      });
    }
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      Swal.fire({
        icon: 'success',
        title: '¡Autenticación exitosa!',
        text: 'Has iniciado sesión correctamente con Google.',
      });
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
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
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Autenticación con GitHub exitosa!',
      showConfirmButton: false,
      timer: 1500
    });
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
}