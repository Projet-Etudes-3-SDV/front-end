import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent {
  isDesktop: boolean = false;

  constructor(private platform: Platform) {}

  ngOnInit() {
    this.isDesktop = this.platform.is('desktop');
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}