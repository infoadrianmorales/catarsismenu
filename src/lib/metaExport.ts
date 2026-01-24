/**
 * Meta (Facebook) Custom Audiences Export Utilities
 * Generates CSV files compatible with Meta Ads Manager for customer uploads
 */

export interface CustomerForExport {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export interface OrderStatus {
  customer_id: string;
  status: string;
}

export type ExportFilter = 'all' | 'paid' | 'open_process';

/**
 * Normalizes a Venezuelan phone number to E.164 format (+58...)
 * Examples:
 *   04241234567    → +584241234567
 *   +584241234567  → +584241234567
 *   584241234567   → +584241234567
 *   0424-123-4567  → +584241234567
 *   424 123 4567   → +584241234567
 */
export const normalizePhoneToE164 = (phone: string): string => {
  // Remove all non-numeric characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Remove leading + if present for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 0, it's a local Venezuelan number - remove the 0 and add 58
  if (cleaned.startsWith('0')) {
    cleaned = '58' + cleaned.substring(1);
  }
  
  // If doesn't start with 58, assume it's a local number missing the country code
  if (!cleaned.startsWith('58')) {
    // If it's 10 digits starting with 4, it's likely a Venezuelan mobile without 0
    if (cleaned.length === 10 && cleaned.startsWith('4')) {
      cleaned = '58' + cleaned;
    }
  }
  
  return '+' + cleaned;
};

/**
 * Normalizes email for Meta (lowercase, trimmed)
 */
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Normalizes name for Meta (lowercase, trimmed)
 */
export const normalizeName = (name: string): string => {
  return name.toLowerCase().trim();
};

/**
 * Filters customers based on their order history
 */
export const filterCustomersByOrderStatus = (
  customers: CustomerForExport[],
  orders: OrderStatus[],
  filter: ExportFilter
): CustomerForExport[] => {
  if (filter === 'all') {
    return customers;
  }

  // Group orders by customer
  const customerOrdersMap = new Map<string, string[]>();
  orders.forEach(order => {
    const existing = customerOrdersMap.get(order.customer_id) || [];
    existing.push(order.status);
    customerOrdersMap.set(order.customer_id, existing);
  });

  return customers.filter(customer => {
    const statuses = customerOrdersMap.get(customer.id) || [];
    
    if (filter === 'paid') {
      // Has at least one PAID or DELIVERED order
      return statuses.some(s => s === 'PAID' || s === 'DELIVERED');
    }
    
    if (filter === 'open_process') {
      // Has orders but none are PAID or DELIVERED
      const hasPaid = statuses.some(s => s === 'PAID' || s === 'DELIVERED');
      const hasOrders = statuses.length > 0;
      return hasOrders && !hasPaid;
    }
    
    return true;
  });
};

/**
 * Generates CSV content for Meta Custom Audiences
 * Columns: email, phone, fn, ln, country
 */
export const generateMetaCSV = (customers: CustomerForExport[]): string => {
  const headers = ['email', 'phone', 'fn', 'ln', 'country'];
  
  const rows = customers.map(customer => [
    normalizeEmail(customer.email),
    normalizePhoneToE164(customer.phone),
    normalizeName(customer.first_name),
    normalizeName(customer.last_name),
    'VE'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

/**
 * Downloads a CSV file with the given content
 */
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Main export function - generates and downloads Meta-compatible CSV
 */
export const exportCustomersForMeta = (
  customers: CustomerForExport[],
  orders: OrderStatus[],
  filter: ExportFilter = 'all'
): { success: boolean; count: number; filename: string } => {
  const filteredCustomers = filterCustomersByOrderStatus(customers, orders, filter);
  
  if (filteredCustomers.length === 0) {
    return { success: false, count: 0, filename: '' };
  }
  
  const csvContent = generateMetaCSV(filteredCustomers);
  const date = new Date().toISOString().split('T')[0];
  const filterSuffix = filter === 'all' ? '' : `-${filter}`;
  const filename = `catarsis-clientes${filterSuffix}-${date}.csv`;
  
  downloadCSV(csvContent, filename);
  
  return { success: true, count: filteredCustomers.length, filename };
};
