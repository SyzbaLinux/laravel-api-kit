import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  X,
  Menu,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-angular';



interface MenuItem {
  label: string;
  route: string;
  icon: any;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  // Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FileText = FileText;
  readonly CreditCard = CreditCard;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly X = X;
  readonly Menu = Menu;
  readonly User = User;
  readonly ArrowRight = ArrowRight;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  // Menu items
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'User Management', route: '/user-management', icon: Users },
    { label: 'Reports', route: '/reports', icon: FileText },
    { label: 'Finance', route: '/finance', icon: CreditCard },
    { label: 'Settings', route: '/settings', icon: Settings }
  ];

  // Sidebar state
  isCollapsed = false;
  isMobileMenuOpen = false;

  // User data - TODO: replace with actual auth service
  userName = signal<string>('User');
  userEmail = signal<string>('user@school.edu');
  userRole = signal<string>('admin');

  logoutClicked = output<void>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogout() {
    this.logoutClicked.emit();
  }
}