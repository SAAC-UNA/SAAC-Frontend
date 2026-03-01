export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  href: string;
  isActive?: boolean;
  isExpandable?: boolean;
  children?: NavItem[];
  onClick?: () => void;
}