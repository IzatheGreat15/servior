
export type ProductType = "For rent" | "For sale";

export type ProductCategory =
  | "Rackets & Paddles"
  | "Balls & Shuttlecocks"
  | "Accessories"
  | "Others";

export type BranchProduct = {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  category: ProductCategory;
  price: number;
  unit: string;
  quantity: number | null;
  trackInventory: boolean;
  isAvailable: boolean;
  imageUrl: string;
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Rackets & Paddles",
  "Balls & Shuttlecocks",
  "Accessories",
  "Others",
];

export const cardClass =
  "rounded-xl border border-[#e2ebe5] bg-white shadow-sm";
