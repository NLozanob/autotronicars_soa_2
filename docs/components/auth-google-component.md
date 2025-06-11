# AuthGoogleComponent (LoginComponent)

Componente Angular standalone para autenticación de usuarios mediante Google, email/contraseña, GitHub y Facebook.

---

## Descripción

El componente `LoginComponent` (referido aquí como **AuthGoogleComponent** para propósitos de documentación) permite a los usuarios autenticarse usando Google, email/contraseña, GitHub o Facebook. Utiliza el servicio `AuthService` para gestionar la autenticación y proporciona retroalimentación visual mediante SweetAlert2. Redirige automáticamente al dashboard tras un inicio de sesión exitoso.

---

## Estructura del Código

```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, RouterLink, AuthGithubComponent, AuthFacebookComponent]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() { this.clearInputs(); }
  clearInputs() { ... }
  mostrarError() { ... }
  mostrarExito() { ... }
  onSubmit(): void { ... }
  async loginWithGoogle() { ... }
  onAuthSuccess() { ... }
}
```

---

## Métodos Principales

- **onSubmit()**  
  Inicia sesión con email y contraseña. Si es exitoso, muestra una alerta de éxito y redirige al dashboard. Si falla, muestra una alerta de error.

- **loginWithGoogle()**  
  Inicia sesión con Google. Si es exitoso, redirige al dashboard. Si falla, muestra una alerta de error.

- **onAuthSuccess()**  
  Método de callback para manejar el éxito de autenticación desde componentes hijos (GitHub/Facebook). Muestra alerta de éxito y redirige al dashboard.

- **mostrarExito() / mostrarError()**  
  Métodos auxiliares para mostrar notificaciones visuales usando SweetAlert2.

- **clearInputs()**  
  Limpia los campos de email y contraseña al inicializar el componente.

---

## Integración con Otros Proveedores

El componente importa y utiliza los componentes:
- `AuthGithubComponent`
- `AuthFacebookComponent`

Estos permiten la autenticación social adicional desde la misma pantalla de login.

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
<app-login></app-login>
```

Para manejar el éxito de autenticación desde los componentes sociales:

```html
<app-auth-github (authSuccess)="onAuthSuccess()"></app-auth-github>
<app-auth-facebook (authSuccess)="onAuthSuccess()"></app-auth-facebook>
```

---

## Notas

- El componente es standalone (Angular 14+).
- Permite autenticación con Google, email/contraseña, GitHub y Facebook.
- El manejo de errores y la retroalimentación visual están centralizados en métodos privados para mantener el código limpio y reutilizable.
- La navegación al dashboard se realiza tras un pequeño delay para permitir que el usuario vea la notificación de éxito.