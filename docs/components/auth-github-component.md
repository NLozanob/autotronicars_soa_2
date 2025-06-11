# AuthGithubComponent

Componente Angular standalone para autenticación de usuarios mediante GitHub.

---

## Descripción

`AuthGithubComponent` permite a los usuarios autenticarse usando su cuenta de GitHub. Utiliza el servicio `AuthService` para gestionar la autenticación y proporciona retroalimentación visual mediante SweetAlert2. Además, emite un evento cuando la autenticación es exitosa y redirige automáticamente al dashboard.

---

## Estructura del Código

```typescript
@Component({
  selector: 'app-auth-github',
  standalone: true,
  templateUrl: './auth-github.component.html',
  styleUrls: ['./auth-github.component.css']
})
export class AuthGithubComponent {
  @Output() authSuccess = new EventEmitter<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  async signInWithGithub() {
    try {
      await this.authService.loginWithGithub();
      this.showSuccessAlert();
      this.authSuccess.emit();
      this.navigateToDashboard();
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  private showSuccessAlert(): void { ... }
  private navigateToDashboard(): void { ... }
  private handleAuthError(error: any): void { ... }
}
```

---

## Métodos Principales

- **signInWithGithub()**  
  Inicia el proceso de autenticación con GitHub. Si es exitoso, muestra una alerta, emite un evento y redirige al dashboard. Si falla, muestra una alerta de error.

- **showSuccessAlert()**  
  Muestra una notificación de éxito usando SweetAlert2.

- **navigateToDashboard()**  
  Redirige al usuario al dashboard después de un breve retraso (1.5 segundos).

- **handleAuthError(error: any)**  
  Muestra una alerta de error si la autenticación falla.

---

## Eventos

- **@Output() authSuccess**  
  Se emite cuando la autenticación con GitHub es exitosa.

---

## Dependencias

- `AuthService`  
  Servicio encargado de la lógica de autenticación.

- `Router`  
  Para la navegación programática tras la autenticación.

- `SweetAlert2`  
  Para mostrar notificaciones visuales al usuario.

---

## Uso

Incluye el componente en tu template:

```html
<app-auth-github (authSuccess)="onAuthSuccess()"></app-auth-github>
```

---

## Notas

- El componente es standalone (Angular 14+).
- El manejo de errores y la retroalimentación visual están centralizados en métodos privados para mantener el código limpio y reutilizable.
- La navegación al dashboard se realiza tras un pequeño delay para permitir que el usuario vea la notificación de éxito.