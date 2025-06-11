# AuthForgotPasswordComponent

Componente Angular standalone para recuperación de contraseña mediante correo electrónico.

---

## Descripción

`AuthForgotPasswordComponent` permite a los usuarios solicitar el restablecimiento de su contraseña a través de un enlace enviado por correo electrónico. Utiliza los servicios de autenticación de Firebase y proporciona retroalimentación visual mediante SweetAlert2. Tras el envío exitoso, redirige automáticamente al usuario a la pantalla de login.

---

## Estructura del Código

```typescript
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private auth: Auth, private router: Router) {}

  mostrarError() { ... }
  mostrarExito() { ... }
  mostrarError2(mensaje: string) { ... }

  async onSubmit(): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.mostrarExito();
      this.router.navigate(['/login']);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.mostrarError2('No hay ninguna cuenta asociada a este correo.');
      } else {
        this.mostrarError();
      }
    }
  }
}
```

---

## Métodos Principales

- **onSubmit()**  
  Envía el correo de recuperación de contraseña usando Firebase Auth. Si tiene éxito, muestra una alerta de éxito y redirige al login. Si falla, muestra una alerta de error específica o genérica según el caso.

- **mostrarExito()**  
  Muestra una notificación de éxito usando SweetAlert2, indicando que el enlace fue enviado.

- **mostrarError()**  
  Muestra una alerta de error genérica si ocurre un problema al enviar el enlace.

- **mostrarError2(mensaje: string)**  
  Muestra una alerta de error personalizada, por ejemplo, si el correo no está asociado a ninguna cuenta.

---

## Dependencias

- `@angular/forms`  
  Para el manejo de formularios basados en templates.

- `@angular/fire/auth`  
  Para la integración con Firebase Auth y el envío del correo de recuperación.

- `@angular/router`  
  Para la navegación programática tras el envío exitoso.

- `sweetalert2`  
  Para mostrar notificaciones visuales al usuario.

---

## Uso

Incluye el componente en tu template:

```html
<app-forgot-password></app-forgot-password>
```

El formulario debe solicitar el correo electrónico del usuario y llamar a `onSubmit()` al enviarse.

---

## Notas

- El componente es standalone (Angular 14+).
- El manejo de errores distingue entre usuario no encontrado y otros errores genéricos.
- La retroalimentación visual se realiza mediante SweetAlert2 para mejorar la experiencia del usuario.
- Tras el envío exitoso, el usuario es redirigido automáticamente a la pantalla de login.