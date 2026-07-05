export type EmployeeRole = 'baker' | 'driver';

export interface BakerReportProduct {
  product_id: number;
  product_name: string;
  planned_quantity: number;
  produced_quantity: number;
  waste_quantity?: number;
  quantity?: number;
}

export interface BakerReportBatch {
  id: number;
  date: string;
  status: string;
  planned_quantity: number;
  produced_quantity: number | null;
  actual_quantity?: number | null;
  items?: any[];
}

export interface BakerReport {
  employee_id: number;
  employee_name: string;
  batches_count: number;
  closed_batches_count: number;
  planned_quantity: number;
  produced_quantity: number;
  products: BakerReportProduct[];
  batches: BakerReportBatch[];
}

export interface DriverReportProduct {
  product_id: number;
  product_name: string;
  delivered_quantity: number;
  shortage_quantity: number;
  received_quantity?: number;
  returned_quantity?: number;
  remaining_quantity?: number;
  shortage_amount?: number;
}

export interface DriverReportDelivery {
  id: number;
  client_name: string;
  status: string;
  delivered_quantity: number;
  shortage_quantity: number;
  shortage_amount: number;
  delivery_amount: number;
  cash_collected: number;
  kaspi_collected: number;
  total_collected: number;
  debt_created: number;
  date?: string;
  total_amount?: number;
  returned_quantity?: number;
  products?: any[];
  returns?: any[];
}

export interface DriverReport {
  employee_id: number;
  employee_name: string;
  routes_count: number;
  deliveries_count: number;
  delivered_deliveries_count: number;
  delivered_quantity: number;
  shortage_quantity: number;
  shortage_amount: number;
  delivery_amount: number;
  cash_collected: number;
  kaspi_collected: number;
  total_collected: number;
  debt_created: number;
  products: DriverReportProduct[];
  deliveries: DriverReportDelivery[];
  received_quantity?: number;
  returned_quantity?: number;
}

export interface EmployeeReport {
  date_from: string;
  date_to: string;
  totals: {
    bakers_count: number;
    drivers_count: number;
    production_batches: number;
    produced_quantity: number;
    routes_count: number;
    deliveries_count: number;
    delivered_quantity: number;
    returned_quantity: number;
    delivery_amount: number;
    cash_collected: number;
    kaspi_collected: number;
    other_collected: number;
    total_collected: number;
    debt_created: number;
    shortage_quantity: number;
    shortage_amount: number;
  };
  bakers: BakerReport[];
  drivers: DriverReport[];
  filter_options: {
    employees: Array<{ id: number; name: string; role: EmployeeRole }>;
  };
}
