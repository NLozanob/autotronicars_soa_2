import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', component:  WelcomeComponent },
  //{ path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
