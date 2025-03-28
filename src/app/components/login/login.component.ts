import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink]
})

export class LoginComponent {
  email: string = '';
  password: string = '';

<<<<<<< Updated upstream
  constructor(private authService: AuthService) {}
=======
  constructor(private authService: AuthService, private router: Router) {}// Se añade Router
>>>>>>> Stashed changes

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
        console.log("Resultado del login:", success);
  
        if (success) {  
<<<<<<< Updated upstream
          this.mostrarExito();  //Solo éxito si login es correcto
=======
          this.mostrarExito();  //Si login es correcto
          setTimeout(() =>{
            this.router.navigate(['/dashboard']); // Redirección a la página dashboard
          }, 1500);
>>>>>>> Stashed changes
        } else {
          this.mostrarError();   //Solo error si login falla
        }
      })
      .catch(error => {
        console.error("Error en el login:", error);
        this.mostrarError(); // Solo se ejecuta si hay error
      });
  }
  
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