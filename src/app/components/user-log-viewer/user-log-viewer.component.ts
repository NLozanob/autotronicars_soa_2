// Importaciones de Angular y Firebase
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, orderBy, where, getDocs, Timestamp } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Interfaz para definir la estructura de los logs de usuario
interface UserLog {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  createdAt: Timestamp;
}

// Decorador del componente Angular
@Component({
  selector: 'user-log-viewer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-log-viewer.component.html',
  styleUrls: ['./user-log-viewer.component.css']
})
export class UserLogViewerComponent implements OnInit {
  // Propiedades del componente
  userLogs: UserLog[] = []; // Todos los logs obtenidos
  filteredLogs: UserLog[] = []; // Logs filtrados según búsqueda
  searchControl = new FormControl(''); // Control para búsqueda por texto
  dateControl = new FormControl(''); // Control para filtro por fecha
  sortField: 'createdAt' | 'displayName' | 'email' = 'createdAt'; // Campo para ordenar
  sortDirection: 'asc' | 'desc' = 'desc'; // Dirección del ordenamiento
  loading = false; // Estado de carga

  constructor(private firestore: Firestore) {}

  // Inicialización del componente
  ngOnInit() {
    this.fetchAllLogs(); // Obtener todos los logs al iniciar
    // Suscripción a cambios en los controles para aplicar filtros
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.dateControl.valueChanges.subscribe(() => this.applyFilters());
  }

  // Método para obtener todos los logs de Firebase
  async fetchAllLogs() {
    this.loading = true;
    const usersLogRef = collection(this.firestore, 'users_log'); // Referencia a la colección
    const q = query(usersLogRef); // Crear query sin filtros
    const querySnapshot = await getDocs(q); // Ejecutar query
    // Mapear resultados a la interfaz UserLog
    this.userLogs = querySnapshot.docs.map(doc => ({ ...doc.data(), createdAt: doc.data()['createdAt'] }) as UserLog);
    this.applyFilters(); // Aplicar filtros iniciales
    this.loading = false;
  }

  // Método para aplicar filtros y ordenamiento
  applyFilters() {
    let logs = [...this.userLogs]; // Copia de los logs originales
    const search = this.searchControl.value?.toLowerCase() || ''; // Valor de búsqueda
    const date = this.dateControl.value; // Valor de fecha
    
    // Filtrar por texto (nombre, email o uid)
    if (search) {
      logs = logs.filter(log =>
        log.displayName?.toLowerCase().includes(search) ||
        log.email?.toLowerCase().includes(search) ||
        log.uid?.toLowerCase().includes(search)
      );
    }
    
    // Filtrar por fecha seleccionada
    if (date) {
      const selectedDate = new Date(date);
      logs = logs.filter(log => {
        if (!log.createdAt) return false;
        const logDate = log.createdAt.toDate();
        return logDate.toDateString() === selectedDate.toDateString();
      });
    }
    
    // Ordenar los resultados
    logs = logs.sort((a, b) => {
      let aValue = a[this.sortField] || '';
      let bValue = b[this.sortField] || '';
      // Manejo especial para fechas
      if (this.sortField === 'createdAt') {
        aValue = (aValue && typeof (aValue as any).toDate === 'function') ? (aValue as any).toDate() : new Date(aValue as string);
        bValue = (bValue && typeof (bValue as any).toDate === 'function') ? (bValue as any).toDate() : new Date(bValue as string);
      }
      // Comparación según dirección de ordenamiento
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.filteredLogs = logs; // Actualizar logs filtrados
  }

  // Método para cambiar el campo de ordenamiento
  setSort(field: 'createdAt' | 'displayName' | 'email') {
    if (this.sortField === field) {
      // Cambiar dirección si es el mismo campo
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Cambiar campo y resetear dirección
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters(); // Reaplicar filtros
  }

  // Método para limpiar todos los filtros
  clearFilters() {
    this.searchControl.setValue('');
    this.dateControl.setValue('');
  }
}