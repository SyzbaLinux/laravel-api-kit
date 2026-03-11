import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell, Search, User } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush  // ✅ OnPush!
})
export class HeaderComponent {
  // Icons
  readonly Bell = Bell;
  readonly Search = Search;
  readonly User = User;

  // Input from parent
  title = input<string>('Dashboard');
}