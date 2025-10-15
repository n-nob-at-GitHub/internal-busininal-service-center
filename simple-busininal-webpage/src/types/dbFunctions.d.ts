export type Role = { 
  id: number;
  name: string;
  description: string;
};

export type User = { 
  id: number;
  name: string?;
  mail: string;
  role: {
    id: string
    name: string
  }
};

export type MaterialIds = number[];

export type Material = { 
  id: number;
  manufacturerId: number;
  code: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  name: string;
  fileName: string?;
  isValid: boolean;
};

export type ManufacturerIds = number[];

export type Manufacturer = { 
  id: number;
  name: string;
};

export type StockIds = number[];

export type Stock = { 
  id: number;
  materialId: number;
  totalQuantity: number;
  totalAmount: number;
  unit: string;
  note: string?;
  createdBy: string;
  createdAt: DateTime;
  updatedBy: string;
  updatedAt: DateTime;
}

export type DeliverySiteIds = number[];

export type DeliverySite = {
  id: number;
  name: string;
  code: string?;
  contact: string?;
}

export type Inbound = {
  id: number;
  stockId: number;
  quantity: number;
  amount: number;
  unitPrice: number;
  unit: string;
  isValid: boolean;
  createdBy: string;
  createdAt: DateTime;
  updatedBy: string;
  updatedAt: DateTime;
}

export type Outbound = {
  id: number;
  stockId: number;
  deliverySiteId: number;
  quantity: number;
  amount: number;
  unitPrice: number;
  unit: string;
  isValid: boolean;
  createdBy: string;
  createdAt: DateTime;
  updatedBy: string;
  updatedAt: DateTime;
}

export type CondolenceTypeIds = number[];
