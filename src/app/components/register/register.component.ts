import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { AuthGithubComponent } from '../auth-github/auth-github.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthGithubComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.registerForm.reset({
      name: '',
      email: '',
      password: ''
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      this.loading = true;
      try {
        const { name, email, password } = this.registerForm.value;
        await this.authService.register(email, password, {
          displayName: name,
          role: 'user',
          photoURL: ''
        });

        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
          timer: 2000,
          showConfirmButton: false
        });

        this.resetForm();
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.handleRegisterError(error);
      } finally {
        this.loading = false;
      }
    } else {
      this.handleInvalidForm();
    }
  }

  private handleRegisterError(error: any) {
    let errorMessage = 'Error al registrar usuario.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'El correo electrónico ya está en uso.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'La contraseña es demasiado débil.';
    }

    Swal.fire({ 
      icon: 'error', 
      title: 'Error', 
      text: errorMessage,
      confirmButtonColor: '#d33'
    });
  }

  private handleInvalidForm() {
    this.registerForm.markAllAsTouched();
    Swal.fire({
      icon: 'error',
      title: 'Formulario inválido',
      text: 'Por favor, completa todos los campos correctamente.',
      confirmButtonColor: '#d33'
    });
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      await Swal.fire({
        icon: 'success',
        title: '¡Sesión iniciada con Google!',
        showConfirmButton: false,
        timer: 1500
      });
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión con Google.',
        confirmButtonColor: '#d33'
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
    this.router.navigate(['/dashboard']);
  }
}