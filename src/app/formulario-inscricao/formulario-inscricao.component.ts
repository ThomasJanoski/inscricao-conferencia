import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-formulario-inscricao',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-inscricao.component.html',
  styleUrl: './formulario-inscricao.component.css'
})
export class FormularioInscricaoComponent {
  eventos = ["TechConf 2025", "Summit de Inovação", "Angular World", "Conexão Dev"];
  modalidades = ["Presencial", "Online"];

  formulario: FormGroup;
  subscriptions: any[] = [];

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      evento: ['', Validators.required],
      modalidade: ['', Validators.required],
      dataInicio: ['', Validators.required],
      dataTermino: ['', [Validators.required, this.validarDataTermino()]],
      participantes: this.fb.array([], [this.validarParticipantes()])
    });

    this.carregarDados();
  }

  get participantes(): FormArray<FormGroup> {
    return this.formulario?.get('participantes') as FormArray<FormGroup>;
  }

  // Validador para exigir pelo menos um participante
  validarParticipantes(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if ((control as FormArray).length === 0) {
        return { semParticipantes: true };
      }
      return null;
    };
  }

  validarDataTermino(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dataInicio = this.formulario?.get('dataInicio')?.value;
      const dataTermino = control.value;

      if (dataInicio && dataTermino && dataTermino < dataInicio) {
        return { dataInvalida: true };
      }
      return null;
    };
  }

  criarParticipante(participante?: any) {
    return this.fb.group({
      nome: [participante?.nome || '', Validators.required],
      email: [participante?.email || '', [Validators.required, Validators.email]],
      cpf: [participante?.cpf || '', [Validators.required, Validators.pattern("\\d{3}.\\d{3}.\\d{3}-\\d{2}")]],
      ingresso: [participante?.ingresso || 'Padrão', Validators.required]
    });
  }

  carregarDados() {
    const dadosSalvos = localStorage.getItem('dadosFormulario');
    if (dadosSalvos) {
      const valores = JSON.parse(dadosSalvos);

      // Aplica valores principais do formulário
      this.formulario.patchValue({
        evento: valores.evento,
        modalidade: valores.modalidade,
        dataInicio: valores.dataInicio,
        dataTermino: valores.dataTermino
      });

      this.participantes.clear();

      if (valores.participantes && valores.participantes.length) {
        valores.participantes.forEach((participante: any) => {
          this.participantes.push(this.criarParticipante(participante));
        });
      }
    }

    this.monitorarAlteracoes();
  }

  monitorarAlteracoes() {
    this.formulario.valueChanges.subscribe(() => {
      this.salvarNoLocalStorage();
    });
  }

  salvarNoLocalStorage() {
    localStorage.setItem('dadosFormulario', JSON.stringify(this.formulario.value));
  }

  adicionarParticipante() {
    this.participantes.push(this.criarParticipante());
    this.salvarNoLocalStorage();
  }

  removerParticipante(index: number) {
    if (this.participantes.length > index) {
      this.participantes.removeAt(index);
      this.salvarNoLocalStorage();
    }
  }

  formatarCPF(event: any, index: number) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    const cpfFormatado = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    const participante = this.participantes.at(index);
    if (participante) {
      participante.patchValue({ cpf: cpfFormatado });
    }
  }

  enviarDados() {
    console.table(this.formulario.value);
    localStorage.removeItem('dadosFormulario');
    this.formulario.reset();
    this.participantes.clear();
  }
}