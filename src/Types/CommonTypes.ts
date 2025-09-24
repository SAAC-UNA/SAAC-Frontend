export interface NavItem {
  id: string;
  label: string;
  icon: string;
  iconType?: 'svg' | 'emoji';
  href: string;
  isActive?: boolean;
  isExpandable?: boolean;
  children?: NavItem[];
}