# AuthFacebookComponent

Componente Angular standalone para autenticación de usuarios mediante Facebook.

---

## Descripción

`AuthFacebookComponent` permite a los usuarios autenticarse usando su cuenta de Facebook. Utiliza el servicio `AuthService` para gestionar la autenticación y proporciona retroalimentación visual mediante SweetAlert2. Emite un evento cuando la autenticación es exitosa y redirige automáticamente al dashboard.

---

## Estructura del Código

```typescript
@Component({
  selector: 'app-auth-facebook',
  standalone: true,
  templateUrl: './auth-facebook.component.html',
  styleUrls: ['./auth-facebook.component.css']
})
export class AuthFacebookComponent {
  @Output() authSuccess = new EventEmitter<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  async signInWithFacebook() {
    // ...ver código fuente...
  }

  private showSuccessAlert(): void { ... }
  private navigateToDashboard(): void { ... }
  private handleAuthError(error: any): void { ... }
}
```

---

## Métodos Principales

- **signInWithFacebook()**  
  Inicia el proceso de autenticación con Facebook. Muestra un loading mientras se realiza la autenticación. Si es exitosa, muestra una alerta de éxito, emite un evento y redirige al dashboard. Si falla, cierra el loading y muestra una alerta de error.

- **showSuccessAlert()**  
  Muestra una notificación de éxito usando SweetAlert2.

- **navigateToDashboard()**  
  Redirige al usuario al dashboard después de un breve retraso (1.5 segundos).

- **handleAuthError(error: any)**  
  Muestra una alerta de error si la autenticación falla.

---

## Eventos

- **@Output() authSuccess**  
  Se emite cuando la autenticación con Facebook es exitosa.

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
<app-auth-facebook (authSuccess)="onAuthSuccess()"></app-auth-facebook>
```

---

## Notas

- El componente es standalone (Angular 14+).
- El loading visual se muestra durante todo el proceso de autenticación.
- El manejo de errores y la retroalimentación visual están centralizados en métodos privados para mantener el código limpio y reutilizable.
- La navegación al dashboard se realiza tras un pequeño delay para permitir que el usuario vea la notificación de éxito.