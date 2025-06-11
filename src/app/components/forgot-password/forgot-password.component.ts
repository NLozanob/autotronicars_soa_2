// Importación de dependencias
import Swal from 'sweetalert2'; // Para mostrar alertas visuales
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Para formularios basados en templates
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth'; // Servicios de Firebase Auth
import { RouterModule, Router } from '@angular/router'; // Para navegación

// Decorador del componente
@Component({
  selector: 'app-forgot-password', // Selector HTML
  standalone: true, // Componente independiente
  imports: [FormsModule, RouterModule], // Módulos requeridos
  templateUrl: './forgot-password.component.html', // Template asociado
  styleUrls: ['./forgot-password.component.css'], // Estilos asociados
})
export class ForgotPasswordComponent {
  email: string = ''; // Variable para almacenar el email del formulario

  // Inyección de dependencias
  constructor(private auth: Auth, private router: Router) {}

  // Método para mostrar error genérico
  mostrarError() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Error al enviar el enlace. Verifica tu correo electrónico.',
      confirmButtonColor: '#d33' // Color rojo para el botón
    });
  }

  // Método para mostrar éxito en el envío
  mostrarExito() {
    Swal.fire({
      position: 'top-end', // Posición en la esquina superior derecha
      icon: 'success',
      title: 'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
      showConfirmButton: false, // Sin botón de confirmación
      timer: 1500 // Cierra automáticamente después de 1.5 segundos
    });
  }

  // Método para mostrar errores específicos con mensaje personalizado
  mostrarError2(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: mensaje,
      confirmButtonColor: '#d33'
    });
  }

  // Método principal que se ejecuta al enviar el formulario
  async onSubmit(): Promise<void> {
    try {
      // Intenta enviar el correo de recuperación usando Firebase Auth
      await sendPasswordResetEmail(this.auth, this.email);
      
      // Si tiene éxito, muestra alerta y redirige al login
      this.mostrarExito();
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('Error al enviar el enlace:', error);
  
      // Manejo específico para error de usuario no encontrado
      if (error.code === 'auth/user-not-found') {
        this.mostrarError2('No hay ninguna cuenta asociada a este correo.');
      } else {
        // Error genérico para otros casos
        this.mostrarError();
      }
    }
  }
}