
"use client";

import { useMemo, useState } from "react";
import ProductsSidebar from "./ProductsSidebar";
import ProductTable from "./ProductTable";
import type {
  BranchProduct,
  ProductCategory,
  ProductType,
} from "./types";
import ProductModal from "./ProductModal";

const initialProducts: BranchProduct[] = [
  {
    id: "1",
    name: "Pickleball Paddle (Pro)",
    description: "Professional pickleball paddle",
    type: "For rent",
    category: "Rackets & Paddles",
    price: 50,
    unit: "hour",
    quantity: 10,
    trackInventory: true,
    isAvailable: true,
    imageUrl: "",
  },
  {
    id: "2",
    name: "Badminton Racket",
    description: "Standard badminton racket",
    type: "For rent",
    category: "Rackets & Paddles",
    price: 40,
    unit: "hour",
    quantity: 8,
    trackInventory: true,
    isAvailable: true,
    imageUrl: "",
  },
  {
    id: "3",
    name: "Shuttlecock (Yonex)",
    description: "Shuttlecock tube",
    type: "For sale",
    category: "Balls & Shuttlecocks",
    price: 350,
    unit: "tube",
    quantity: 15,
    trackInventory: true,
    isAvailable: true,
    imageUrl: "",
  },
  {
    id: "4",
    name: "Pickleball Balls (Set of 3)",
    description: "Outdoor pickleball balls",
    type: "For sale",
    category: "Balls & Shuttlecocks",
    price: 200,
    unit: "set",
    quantity: 20,
    trackInventory: true,
    isAvailable: true,
    imageUrl: "",
  },
  {
    id: "5",
    name: "Grip Tape",
    description: "Replacement racket grip",
    type: "For sale",
    category: "Accessories",
    price: 150,
    unit: "piece",
    quantity: 30,
    trackInventory: true,
    isAvailable: true,
    imageUrl: "",
  },
  {
    id: "6",
    name: "Sports Water Bottle",
    description: "Reusable sports water bottle",
    type: "For sale",
    category: "Accessories",
    price: 250,
    unit: "piece",
    quantity: 12,
    trackInventory: true,
    isAvailable: false,
    imageUrl: "",
  },
];

export default function ProductsPanel() {
  const [products, setProducts] = useState<BranchProduct[]>(initialProducts);
  const [activeType, setActiveType] = useState<
    "All" | ProductType
  >("All");
  const [activeCategory, setActiveCategory] = useState<
    "All" | ProductCategory
  >("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "All statuses" | "Active" | "Inactive"
  >("All statuses");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<BranchProduct | null>(null);

  const typeCounts = useMemo(
    () => ({
      All: products.length,
      "For rent": products.filter((p) => p.type === "For rent").length,
      "For sale": products.filter((p) => p.type === "For sale").length,
    }),
    [products]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    products.forEach((product) => {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
    });

    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesType =
        activeType === "All" || product.type === activeType;
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesStatus =
        status === "All statuses" ||
        (status === "Active" && product.isAvailable) ||
        (status === "Inactive" && !product.isAvailable);

      return (
        matchesType &&
        matchesCategory &&
        matchesSearch &&
        matchesStatus
      );
    });
  }, [products, activeType, activeCategory, search, status]);

  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: BranchProduct) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const saveProduct = (product: BranchProduct) => {
    setProducts((previous) => {
      const exists = previous.some((item) => item.id === product.id);

      return exists
        ? previous.map((item) => (item.id === product.id ? product : item))
        : [product, ...previous];
    });

    setModalOpen(false);
    setEditingProduct(null);
    setPage(1);
  };

  const toggleAvailability = (id: string) => {
    setProducts((previous) =>
      previous.map((product) =>
        product.id === id
          ? { ...product, isAvailable: !product.isAvailable }
          : product
      )
    );
  };

  const changeType = (value: "All" | ProductType) => {
    setActiveType(value);
    setPage(1);
  };

  const changeCategory = (value: "All" | ProductCategory) => {
    setActiveCategory(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-4">
      <ProductsSidebar
        onAddProduct={openAddModal}
        activeType={activeType}
        onTypeChange={changeType}
        activeCategory={activeCategory}
        onCategoryChange={changeCategory}
        typeCounts={typeCounts}
        categoryCounts={categoryCounts}
      />

      <ProductTable
        products={filteredProducts}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onEdit={openEditModal}
        onToggleAvailability={toggleAvailability}
        page={page}
        pageSize={6}
        onPageChange={setPage}
      />

      <ProductModal
        open={modalOpen}
        product={editingProduct}
        onClose={() => setModalOpen(false)}
        onSave={saveProduct}
      />
    </div>
  );
}
