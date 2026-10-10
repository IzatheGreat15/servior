
import type { IconType } from "react-icons";

export type NavigationItem = {
  label: string;
  href: string;
  icon?: IconType;
  children?: NavigationItem[];
};

export type NavigationConfig = {
  items: NavigationItem[];
};
