import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { RouterLink, RouterLinkActive } from '../../node_modules/@angular/router/index';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapp';
}
