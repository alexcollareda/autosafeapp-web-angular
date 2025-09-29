// calendar.component.ts
import { Component, LOCALE_ID, Inject } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal, NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PlateService } from 'app/services/plate.service';
import { ServicesService } from 'app/services/services.service';

interface AgendamentoAutomotivo {
  id: number;
  servico: string;
  cliente: string;
  veiculo: string;
  placa: string;
  data: Date;
  duracao: number; // em minutos
  valor: number;
  status: 'confirmado' | 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  locale: string = 'pt-BR';
  filtroSelecionado: string = 'proximos';
  dataSelecionada: Date | null = null;
  proximosAgendamentosFiltrados: AgendamentoAutomotivo[] = [];
  model: NgbDate | null = null;
  selectedTime = { hour: 9, minute: 0 };
  newAppointment: AgendamentoAutomotivo = {
    id: 0,
    servico: '',
    cliente: '',
    veiculo: '',
    placa: '',
    data: undefined,
    duracao: 0,
    valor: 0,
    status: 'confirmado'
  };
  dataAgendamento: String;
  servicesRecovered:null;

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  events: CalendarEvent[] = [
    {
      start: new Date(),
      end: new Date(2025, 8, 29),
      title: 'Troca de Óleo - Honda Civic',
      color: { primary: '#1e90ff', secondary: '#D1E7DD' }
    },
    {
      start: new Date(),
      title: 'Revisão Completa - Toyota Corolla',
      color: { primary: '#e3342f', secondary: '#F8D7DA' }
    },
    {
      start: new Date(2025, 8, 29),
      title: 'Alinhamento - Ford Ka',
      color: { primary: '#28a745', secondary: '#d4edda' }
    },
    {
      start: new Date(2025, 8, 29),
      title: 'Balanceamento - Volkswagen Gol',
      color: { primary: '#ffc107', secondary: '#fff3cd' }
    }
  ];

  agendamentosCompletos: AgendamentoAutomotivo[] = [
    {
      id: 1,
      servico: 'Troca de Óleo e Filtros',
      cliente: 'João Silva',
      veiculo: 'Honda Civic 2020',
      placa: 'ABC-1234',
      data: new Date(),
      duracao: 60,
      valor: 150.00,
      status: 'confirmado',
      observacoes: 'Cliente solicitou óleo sintético'
    },
    {
      id: 2,
      servico: 'Revisão dos 10.000km',
      cliente: 'Maria Santos',
      veiculo: 'Toyota Corolla 2019',
      placa: 'DEF-5678',
      data: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      duracao: 180,
      valor: 450.00,
      status: 'confirmado'
    },
    {
      id: 3,
      servico: 'Alinhamento e Balanceamento',
      cliente: 'Pedro Costa',
      veiculo: 'Ford Ka 2018',
      placa: 'GHI-9012',
      data: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
      duracao: 90,
      valor: 120.00,
      status: 'pendente'
    },
    {
      id: 4,
      servico: 'Troca de Pastilhas de Freio',
      cliente: 'Ana Lima',
      veiculo: 'Volkswagen Gol 2017',
      placa: 'JKL-3456',
      data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // depois de amanhã
      duracao: 120,
      valor: 280.00,
      status: 'confirmado'
    },
    {
      id: 5,
      servico: 'Diagnóstico Eletrônico',
      cliente: 'Carlos Mendes',
      veiculo: 'Chevrolet Onix 2021',
      placa: 'MNO-7890',
      data: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      duracao: 45,
      valor: 80.00,
      status: 'pendente'
    },
    {
      id: 6,
      servico: 'Lavagem Completa',
      cliente: 'Fernanda Oliveira',
      veiculo: 'Hyundai HB20 2020',
      placa: 'PQR-1357',
      data: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      duracao: 30,
      valor: 35.00,
      status: 'confirmado'
    },
    // Agendamentos para o dia 15/01
    {
      id: 7,
      servico: 'Revisão Completa',
      cliente: 'Roberto Silva',
      veiculo: 'Toyota Corolla 2019',
      placa: 'STU-2468',
      data: new Date(2024, 0, 15, 9, 0), // 15/01 às 09:00
      duracao: 180,
      valor: 450.00,
      status: 'confirmado'
    },
    {
      id: 8,
      servico: 'Troca de Pneus',
      cliente: 'Lucia Pereira',
      veiculo: 'Fiat Uno 2016',
      placa: 'VWX-9753',
      data: new Date(2024, 0, 15, 14, 30), // 15/01 às 14:30
      duracao: 60,
      valor: 320.00,
      status: 'pendente'
    }
  ];
  closeResult: string;

  constructor(private modalService: NgbModal,
    private calendar: NgbCalendar, private plateService: PlateService, 
    private servicesService: ServicesService) {
    this.model = this.calendar.getToday();
    this.filtrarAgendamentos();
  }

  revocerServices(){
   
  }

  onDateSelect(date: NgbDate): void {
    this.model = date;
    console.log('Data selecionada:', this.getFormattedDate());
  }

  getFormattedDate(): string {
    if (this.model) {
      const day = this.model.day.toString().padStart(2, '0');
      const month = this.model.month.toString().padStart(2, '0');
      const year = this.model.year.toString();
      return `${day}/${month}/${year}`;
    }
    return '';
  }

  abrirCalendario(datepicker: any): void {
    try {
      datepicker.open();
    } catch (error) {
      console.error('Erro ao abrir datepicker:', error);
    }
  }

  open(content, type, modalDimension) {
    if (modalDimension === 'sm' && type === 'modal_mini') {
      this.modalService.open(content, { windowClass: 'modal-mini modal-primary', size: 'sm' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
    } else if (modalDimension == undefined && type === 'Login') {
      this.modalService.open(content, { windowClass: 'modal-login modal-primary' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
    } else {
      this.modalService.open(content).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
      });
    }

  }

  findPlate() {
    if (this.newAppointment.placa && this.newAppointment.placa.length >= 6) {
      this.plateService.findPlate(this.newAppointment.placa)
        .subscribe({
          next: (data) => {
            console.log(data)
            console.log(new String(data.brand))
            this.newAppointment.veiculo = data.marca + ' ' + data.SUBMODELO + ' ' + data.ano + '/' + data.anoModelo;
          },
          error: () => {
          }
        });
    }
  }

  get dataMinima(): string {
    return new Date().toISOString().split('T')[0];
  }


  openModal(content: any) {
    if (this.dataSelecionada) {
      this.dataAgendamento = new Date(this.dataSelecionada).toISOString().split('T')[0];
    } else {
      this.dataAgendamento = new Date().toISOString().split('T')[0];;
    }
    const modalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
      // ⭐ IMPORTANTE: Configurações do modal
      windowClass: 'modal-datepicker',
      container: 'body'
    });

    modalRef.result.then((result) => {
      console.log('Modal fechado com:', result);
    }).catch((error) => {
      console.log('Modal cancelado');
    });
  }

  salvarAgendamento() {
    if (this.model) {
      const dataAgendamento = new Date(
        this.model.year,
        this.model.month - 1,
        this.model.day,
        this.selectedTime.hour,
        this.selectedTime.minute
      );
      console.log(this.dataAgendamento)
      console.log('Data do agendamento:', dataAgendamento);
      console.log('Horário:', this.selectedTime);
    }
  }

  // Função para desabilitar datas passadas
  isDisabled = (date: NgbDate, current: { month: number, year: number }) => {
    const today = this.calendar.getToday();
    return date.before(today);
  };



  onDayClicked(clickInfo: any): void {
    console.log('=== DEBUG CLICK INFO ===');
    console.log('Objeto completo:', clickInfo);
    console.log('Tipo:', typeof clickInfo);
    console.log('Keys:', Object.keys(clickInfo));

    // Extrair dados de forma segura
    const date = clickInfo?.day?.date || clickInfo;
    const events = clickInfo?.sourceEvent || [];

    console.log('Data extraída:', date);
    console.log('Events extraídos:', events);
    console.log('Events é array?', Array.isArray(events));

    this.dataSelecionada = date;
    this.filtroSelecionado = 'dia_especifico';
    this.filtrarAgendamentos();

    if (Array.isArray(events) && events.length > 0) {
      this.activeDayIsOpen = !this.activeDayIsOpen;
    } else {
      this.activeDayIsOpen = false;
    }
  }

  onEventClicked(event: any): void {
    console.log('Evento clicado:', event);
  }

  filtrarAgendamentos(): void {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    switch (this.filtroSelecionado) {
      case 'dia_especifico':
        if (this.dataSelecionada) {
          this.proximosAgendamentosFiltrados = this.agendamentosCompletos.filter(
            ag => this.isSameDay(ag.data, this.dataSelecionada!)
          ).sort((a, b) => a.data.getTime() - b.data.getTime());
        }
        break;
      case 'hoje':
        this.proximosAgendamentosFiltrados = this.agendamentosCompletos.filter(
          ag => this.isSameDay(ag.data, hoje)
        ).sort((a, b) => a.data.getTime() - b.data.getTime());
        break;
      case 'semana':
        const fimSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
        this.proximosAgendamentosFiltrados = this.agendamentosCompletos.filter(
          ag => ag.data >= hoje && ag.data <= fimSemana
        ).sort((a, b) => a.data.getTime() - b.data.getTime());
        break;
      case 'mes':
        const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
        this.proximosAgendamentosFiltrados = this.agendamentosCompletos.filter(
          ag => ag.data >= hoje && ag.data <= fimMes
        ).sort((a, b) => a.data.getTime() - b.data.getTime());
        break;
      default: // 'proximos'
        this.proximosAgendamentosFiltrados = this.agendamentosCompletos
          .filter(ag => ag.data >= agora)
          .sort((a, b) => a.data.getTime() - b.data.getTime())
          .slice(0, 10); // Limitar aos próximos 10
    }
  }

  voltarParaProximos(): void {
    this.filtroSelecionado = 'proximos';
    this.dataSelecionada = null;
    this.filtrarAgendamentos();
  }

  isToday(data: Date): boolean {
    const hoje = new Date();
    return this.isSameDay(data, hoje);
  }

  isUrgent(data: Date): boolean {
    const agora = new Date();
    const diffHoras = (data.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diffHoras <= 2 && diffHoras >= 0;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmado': 'Confirmado',
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'confirmado': '✅',
      'pendente': '⏳',
      'em_andamento': '🔧',
      'concluido': '✔️',
      'cancelado': '❌'
    };
    return iconMap[status] || '📋';
  }

  getDuracaoFormatada(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0 && mins > 0) {
      return `${horas}h ${mins}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${mins}min`;
    }
  }

  trackByAgendamento(index: number, agendamento: AgendamentoAutomotivo): number {
    return agendamento.id;
  }

  editarAgendamento(agendamento: AgendamentoAutomotivo): void {
    console.log('Editar agendamento:', agendamento);
    // Implementar lógica de edição
  }

  cancelarAgendamento(agendamento: AgendamentoAutomotivo): void {
    console.log('Cancelar agendamento:', agendamento);
    // Implementar lógica de cancelamento
  }

  iniciarServico(agendamento: AgendamentoAutomotivo): void {
    agendamento.status = 'em_andamento';
    console.log('Iniciando serviço:', agendamento);
  }

  concluirServico(agendamento: AgendamentoAutomotivo): void {
    agendamento.status = 'concluido';
    console.log('Concluindo serviço:', agendamento);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }
}