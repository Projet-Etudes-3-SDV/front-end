import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isDesktop: boolean = false;

  constructor(
    private platform: Platform
  ) {}

  ngOnInit() {
    this.isDesktop = this.platform.is('desktop');
  }
}
