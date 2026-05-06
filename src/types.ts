export enum IPOType {
  STOCK = 'STOCK',
  BOND = 'BOND',
  FUND = 'FUND',
}

export enum EventType {
  AUCTION = 'AUCTION', // Đấu giá
  FIXED_PRICE = 'FIXED_PRICE', // Chào giá cố định
  BOOK_BUILDING = 'BOOK_BUILDING', // Dựng sổ
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  DEPOSITED = 'DEPOSITED',
  ALLOCATED = 'ALLOCATED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IPOEvent {
  id: string;
  issuerName: string;
  securityType: IPOType;
  eventType: EventType;
  parValue: number;
  totalVolume: number;
  minPrice: number;
  stockCode: string;
  offerType: string; // Chào bán ra công chúng/riêng lẻ...
  targetSegments: string[];
  registrationMethods: ('OFFLINE' | 'ONLINE')[];
  minVolume: number;
  maxVolume: number;
  volumeStep: number;
  priceStep: number;
  depositRate: number; // Mức đặt cọc (e.g. 0.1 for 10%)
  startTime: string;
  endTime: string;
  paymentStartTime: string;
  paymentEndTime: string;
  refundTime: string;
  description: string;
  quarterlyDocuments?: {
    title: string;
    items: IPODocument[];
  };
  monthlyDocuments?: {
    title: string;
    items: IPODocument[];
  };
}

export interface IPODocument {
  id: string;
  title: string;
  date: string;
  type: 'PDF' | 'VIDEO';
  url: string;
}

export interface Registration {
  id: string;
  eventId: string;
  volume: number;
  price: number;
  referralId?: string;
  refundBankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  depositMethod: 'STOCK_ACCOUNT' | 'BANK_TRANSFER';
  status: RegistrationStatus;
  createdAt: string;
  signedAt?: string;
  depositedAt?: string;
  allocatedVolume?: number;
  totalPaid?: number;
}
