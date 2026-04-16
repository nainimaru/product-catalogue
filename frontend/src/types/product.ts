export interface KeyValue {
  key: string;
  value: string;
}

// export interface Section {
//   heading: string;
//   fields: KeyValue[];
// }

export interface Product {
  id: string;
  title: string;
  categoryId: string;
  images: string[];
  tags: KeyValue[];
  price: number;
  specifications: KeyValue[];
  description: string;
  brand: string;
  stock: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}