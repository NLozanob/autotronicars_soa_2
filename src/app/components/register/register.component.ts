import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'; // Importa SweetAlert2

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

        // Registro con datos adicionales para Firestore
        await this.authService.register(email, password, {
          displayName: name,
          role: 'user',
          photoURL: '',
        });

        // Muestra una alerta de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
        }).then(() => {
          // Redirige al usuario después de cerrar la alerta
          this.router.navigate(['/dashboard']);
        });
      } catch (error: any) {
        // Manejo de errores con SweetAlert2
        let errorMessage = 'Error al registrar usuario. Inténtalo de nuevo.';

        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'El correo electrónico ya está en uso.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        }

        // Muestra una alerta de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });

        console.error('Error detallado:', error);
      } finally {
        this.loading = false;
      }
    } else {
      // Marca todos los campos como tocados para mostrar errores de validación
      this.registerForm.markAllAsTouched();

      // Muestra una alerta si el formulario es inválido
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor, completa el formulario correctamente.',
      });
    }
  }

  // Método para iniciar sesión con Google
  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle(); // Llama al método del servicio
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      // Muestra una alerta de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
      });
    }
  }
}