import { AppointmentService } from './../services/appointment.service';
// calendar.component.ts
import { Component, LOCALE_ID, Inject } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal, NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PlateService } from 'app/services/plate.service';
import { ServicesService } from 'app/services/services.service';
import { or } from 'ajv/dist/compile/codegen';

interface AgendamentoAutomotivo {
  id: number;
  servico: string;
  cliente: string;
  clienteTelefone: String;
  veiculo: string;
  placa: string;
  data: Date;
  duracao: number; // em minutos
  valor: number;
  status: 'confirmado' | 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: any;
  priceType: string;
  imageUrl: string;
  appliesToAllVehicles: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: number;
  companyTypeId: number;
  brands: number[];
  models: number[];
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
    clienteTelefone: '',
    placa: '',
    data: undefined,
    duracao: 0,
    valor: 0,
    status: 'confirmado'
  };
  dataAgendamento: String;
  serviceList: Service[] = [];
  selectedService: Service;
  horaAgendamento: number;
  minutoAgendamento: number;

  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  events: CalendarEvent[] = [];

  appointments: AgendamentoAutomotivo[] = [];

  agendamentosCompletos: AgendamentoAutomotivo[] = [];
  closeResult: string;
  searchTerm: string = '';

  constructor(private modalService: NgbModal,
    private calendar: NgbCalendar, private plateService: PlateService,
    private servicesService: ServicesService, private appointmentService: AppointmentService) {
    this.model = this.calendar.getToday();
    this.filtrarAgendamentos();
    this.getAppointments();
  }

  recoverServices() {
    this.servicesService.findByCompanyLogged().subscribe(
      (data) => {
        this.serviceList = data;
      }
    );
  }

  get filteredServiceList(): Service[] {
    if (!this.searchTerm) {
      // Se o termo de busca estiver vazio, retorna a lista completa
      return this.serviceList;
    }

    // Converte o termo de busca para minúsculas para uma comparação sem distinção de maiúsculas/minúsculas
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    // Filtra a lista completa, verificando se o título do serviço inclui o termo de busca
    return this.serviceList.filter(service =>
      service.title.toLowerCase().includes(lowerCaseSearchTerm)
    );
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
    this.recoverServices();
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
  excludeService() {
    this.searchTerm = '';
    this.selectedService = null;
  }

  selectService(service) {
    console.log(service)
    this.selectedService = service;
  }

  getAppointments() {
    this.appointmentService.getAppointment().subscribe(
      (data) => {
        this.agendamentosCompletos = data.map(apiAppointment => this.mapApiToLocal(apiAppointment));
        this.events = data.map(apiAppointment => this.mapEventsApiToLocal(apiAppointment))
      })
  }

  private mapApiToLocal(apiData: any): AgendamentoAutomotivo {
    return {
      id: apiData.id || 0,
      servico: apiData.serviceId || 'Serviço não informado',
      cliente: apiData.clientName || 'Cliente não informado',
      veiculo: apiData.vehicleDescription,
      clienteTelefone: apiData.clientPhone || '',
      placa: apiData.vehiclePlate || '',
      duracao: 100,
      valor: 200,
      data: apiData.confirmedDatetime ? new Date(apiData.confirmedDatetime) : undefined,
      status: 'confirmado'
    };
  }

  private mapEventsApiToLocal(apiData: any): any {
    return {
      start: apiData.confirmedDatetime ? new Date(apiData.confirmedDatetime) : undefined,
      title: apiData.clientName + ' ' + apiData.vehicleDescription,
      color: { primary: '#1e90ff', secondary: '#D1E7DD' }
    };
  }

  private mapStatus(apiStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED_BY_COMPANY': 'confirmado',
      'CONFIRMED': 'confirmado',
      'PENDING': 'pendente',
      'CANCELLED': 'cancelado',
      'COMPLETED': 'concluido',
      'IN_PROGRESS': 'em_andamento'
    };

    return statusMap[apiStatus] || 'confirmado';
  }


  createAppointment() {
    let payload = {
      clientName: this.newAppointment.cliente.toUpperCase(),
      clientPhone: this.newAppointment.clienteTelefone,
      scheduledBy: 'COMPANY',
      requestedDatetime: this.convertToInstant(),
      vehicleDescription: this.newAppointment.veiculo.toUpperCase(),
      vehiclePlate: this.newAppointment.placa.toUpperCase(),
      serviceId: this.selectedService.id
    }

    this.appointmentService.createAppointment(payload).subscribe({
      next: (response) => {
      },
      error: () => ''
    });
  }

  convertToInstant(): string {
    // Criar data local com timezone da máquina
    const dataLocal = new Date(
      parseInt(this.dataAgendamento.split('-')[0]),
      parseInt(this.dataAgendamento.split('-')[1]) - 1,
      parseInt(this.dataAgendamento.split('-')[2]),
      this.horaAgendamento,
      this.minutoAgendamento,
      0,
      0
    );

    return dataLocal.toISOString();
  }

  openModal(content: any) {
    this.recoverServices();
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

  cancelAppointment(){
    //this.appointmentService.cancelAppointment()
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