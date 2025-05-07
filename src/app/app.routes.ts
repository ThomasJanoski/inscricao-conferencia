import { Routes } from '@angular/router';
import { FormularioInscricaoComponent } from './formulario-inscricao/formulario-inscricao.component';

export const routes: Routes = [
    { path: '', component: FormularioInscricaoComponent },
    { path: '**', redirectTo: '' }
];
