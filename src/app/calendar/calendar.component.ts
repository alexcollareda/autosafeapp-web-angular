import { AppointmentService } from './../services/appointment.service';
import { Component, LOCALE_ID, Inject, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { NgbModal, NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { PlateService } from 'app/services/plate.service';
import { ServicesService } from 'app/services/services.service';
import { firstValueFrom } from 'rxjs'; 

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
  status: string;
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
export class CalendarComponent implements OnInit{
  horasDisponiveis: number[] = Array.from({ length: 23 }, (_, i) => i + 1); // 1 até 23
  minutosDisponiveis: number[] = [0, 15, 30, 45];
  alertMessage: string = '';
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

  agendamentosCompletos: AgendamentoAutomotivo[] = [];
  closeResult: string;
  searchTerm: string = '';
  appointmentToCancel = null;

  constructor(private modalService: NgbModal,
    private calendar: NgbCalendar, private plateService: PlateService,
    private servicesService: ServicesService, private appointmentService: AppointmentService) {
    this.model = this.calendar.getToday();


  }

    ngOnInit(): void {
    // Chama o método assíncrono
    this.initData();
  }

  async initData(): Promise<void> {
    try {
      this.serviceList = await firstValueFrom(this.servicesService.findByCompanyLogged());
      console.log('Lista de serviços recuperada:', this.serviceList);

      this.performDependentActions();

    } catch (error) {
      console.error('Erro ao recuperar os serviços:', error);
      // Trate o erro, talvez mostre uma mensagem para o usuário
    } finally {
    }
  }

   performDependentActions(): void {
    this.getAppointments();
    
  }

  recoverServices() {
    this.servicesService.findByCompanyLogged().subscribe(
      (data) => {
        this.serviceList = data;
      }
    );
  }

  getNameService(idService) {
    console.log('buscando servicos' + idService);
    console.log(this.serviceList);
    const service = this.serviceList.find(s => s.id === idService);
    return service ? service.title : undefined;
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
        this.filtrarAgendamentos();
      })
  }

  private mapApiToLocal(apiData: any): AgendamentoAutomotivo {
    return {
      id: apiData.id || 0,
      servico: this.getNameService(apiData.serviceId) || 'Serviço não informado',
      cliente: apiData.clientName || 'Cliente não informado',
      veiculo: apiData.vehicleDescription,
      clienteTelefone: apiData.clientPhone || '',
      placa: apiData.vehiclePlate || '',
      duracao: 100,
      valor: 200,
      data: apiData.confirmedDatetime ? new Date(apiData.confirmedDatetime) : null,
      status: this.mapStatus(apiData.status)
    };
  }

  private mapEventsApiToLocal(apiData: any): any {
    return {
      start: apiData.confirmedDatetime ? new Date(apiData.confirmedDatetime) : null,
      title: apiData.clientName + ' ' + apiData.vehicleDescription,
      color: { primary: '#1e90ff', secondary: '#D1E7DD' }
    };
  }

  private mapStatus(apiStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED_BY_COMPANY': 'confirmado',
      'APPROVED_BY_COMPANY': 'confirmado',
      'CONFIRMED': 'confirmado',
      'PENDING': 'pendente',
      'CANCELLED': 'cancelado',
      'CANCELED_BY_COMPANY': 'cancelado',
      'CANCELED_BY_CLIENT': 'cancelado',
      'COMPLETED': 'concluido',
      'IN_PROGRESS': 'em_andamento'
    };

    return statusMap[apiStatus] || 'confirmado';
  }


  createAppointment(closeModal: any) {
  this.alertMessage = '';
   setTimeout(() => this.alertMessage=null, 7000);

  if (!this.newAppointment.cliente || this.newAppointment.cliente.trim() === '') {
    this.alertMessage = 'O nome do cliente é obrigatório.';
    return;
  }

  if (!this.newAppointment.clienteTelefone || this.newAppointment.clienteTelefone.trim() === '') {
    this.alertMessage = 'O telefone do cliente é obrigatório.';
    return;
  }
  if (!this.newAppointment.placa || this.newAppointment.placa.trim() === '') {
    this.alertMessage = 'A placa do veículo é obrigatória.';
    return;
  }

  const placaRegex = /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/;
  const placaFormatada = this.newAppointment.placa.toUpperCase();

  if (!placaRegex.test(placaFormatada)) {
    this.alertMessage = 'A placa informada não é válida.';
    return;
  }

  if (!this.newAppointment.veiculo || this.newAppointment.veiculo.trim() === '') {
    this.alertMessage = 'Placa inválida ou não encontrada na base.';
    return;
  }

  if (!this.selectedService) {
    this.alertMessage = 'Selecione um serviço para o agendamento.';
    return;
  }

  if (!this.dataAgendamento) {
    this.alertMessage = 'A data do agendamento é obrigatória.';
    return;
  }

  const dataSelecionada = new Date(this.dataAgendamento + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (dataSelecionada < hoje) {
    this.alertMessage = 'A data do agendamento não pode ser anterior à data atual.';
    return;
  }

  if (this.horaAgendamento == null || this.minutoAgendamento == null) {
    this.alertMessage = 'O horário deve ser informado.';
    return;
  }
  if (this.horaAgendamento < 0 || this.horaAgendamento > 23) {
  this.alertMessage = 'A hora deve estar entre 00 e 23.';
  return;
}

  let payload = {
    clientName: this.newAppointment.cliente.toUpperCase(),
    clientPhone: this.newAppointment.clienteTelefone,
    scheduledBy: 'COMPANY',
    requestedDatetime: this.convertToInstant(),
    vehicleDescription: this.newAppointment.veiculo.toUpperCase(),
    vehiclePlate: this.newAppointment.placa.toUpperCase(),
    serviceId: this.selectedService.id
  };

  this.appointmentService.createAppointment(payload).subscribe({
    next: () => {
      this.alertMessage = '';
      this.initData(); 
      closeModal('save'); 
    },
    error: () => {
      this.alertMessage = 'Erro ao salvar agendamento. Tente novamente.';
    }
  });
}

  convertToInstant(): string {
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
    this.newAppointment = {
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

  this.horaAgendamento = null;
  this.minutoAgendamento = null;
  this.selectedService = null;
  this.searchTerm = '';
  this.alertMessage = '';

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

  openConfirmationModal(content: any, appointmentToCancel: any) {
    this.appointmentToCancel = appointmentToCancel;
    const modalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: false,
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
    const date = clickInfo?.day?.date || clickInfo;
    const events = clickInfo?.sourceEvent || [];

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
    const agora =new Date(Date.now() - (30 * 60 * 1000));
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

  cancelAppointment() {
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

  trackByAgendamento(index: number, agendamento: AgendamentoAutomotivo): number {
    return agendamento.id;
  }

  editarAgendamento(agendamento: AgendamentoAutomotivo): void {
    console.log('Editar agendamento:', agendamento);
    // Implementar lógica de edição
  }

  cancelarAgendamento(agendamento: AgendamentoAutomotivo): void {
    console.log('Cancelar agendamento:', agendamento);
    this.appointmentService.cancelAppointment(agendamento.id, { message: 'Cancelado pela Empresa' }).subscribe();
    this.initData();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }
}