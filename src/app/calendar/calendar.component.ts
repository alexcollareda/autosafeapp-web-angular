import { Component, LOCALE_ID, Inject } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-agenda',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  locale: string = 'pt-BR';
  
  events: CalendarEvent[] = [
    {
      start: new Date(),
      title: 'Reunião de Projeto',
      color: { primary: '#1e90ff', secondary: '#D1E7DD' }
    },
    {
      start: new Date(2024, 0, 15), // 15 de Janeiro
      title: 'Apresentação Cliente',
      color: { primary: '#e3342f', secondary: '#F8D7DA' }
    },
    {
      start: new Date(2024, 0, 20), // 20 de Janeiro
      title: 'Workshop Técnico',
      color: { primary: '#28a745', secondary: '#d4edda' }
    }
  ];

  onDayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log('Data clicada:', date);
    console.log('Eventos do dia:', events);
    
    if (events.length > 0) {
      this.activeDayIsOpen = !this.activeDayIsOpen;
    } else {
      this.activeDayIsOpen = false;
    }
  }

  onEventClicked(event: any): void {
    console.log('Evento clicado:', event);
  }
}