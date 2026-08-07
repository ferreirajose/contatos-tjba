import { ChangeDetectionStrategy, Component } from '@angular/core';

interface MenuItem {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly menuItems: readonly MenuItem[] = [
    { label: 'Ouvidoria', href: '#ouvidoria' },
    { label: 'Portal TJBA', href: 'https://www.tjba.jus.br' },
    { label: 'Posso ajudar', href: '#posso-ajudar' },
    { label: 'Tutorial', href: '#tutorial' },
    { label: 'Notícias', href: '#noticias' },
  ];

  protected readonly menuId = 'primary-navigation';
  protected menuOpen = false;

  protected toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  protected closeMenu(): void {
    this.menuOpen = false;
  }
}
