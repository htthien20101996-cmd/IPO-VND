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
  WAITING_DEPOSIT = 'WAITING_DEPOSIT',     // Đăng ký chờ nộp cọc
  DEPOSIT_SUBMITTED = 'DEPOSIT_SUBMITTED', // Đăng ký đã nộp cọc
  DEPOSIT_ERROR = 'DEPOSIT_ERROR',         // Nộp cọc lỗi
  DEPOSIT_UNREGISTERED = 'DEPOSIT_UNREGISTERED', // Nộp cọc chưa đăng ký
  DEPOSIT_CONFIRMED = 'DEPOSIT_CONFIRMED', // DLC xác nhận cọc
  WAITING_PAYMENT = 'WAITING_PAYMENT',     // Chờ nộp tiền
  PAYMENT_SUBMITTED = 'PAYMENT_SUBMITTED', // Đã nộp tiền
  PAYMENT_ERROR = 'PAYMENT_ERROR',         // Nộp tiền lỗi
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED', // DLC xác nhận tiền
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
  financialHighlights?: {
    revenue: string;
    profit: string;
    assets: string;
    equity: string;
    year: string;
  };
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
  referralCode?: string;
  refundBankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  depositMethod: 'STOCK_ACCOUNT' | 'BANK_TRANSFER';
  stockAccount?: string;
  status: RegistrationStatus;
  createdAt: string;
  signedAt?: string;
  depositedAt?: string;
  allocatedVolume?: number;
  allocatedPrice?: number;
  totalPaid?: number;
  refundAmount?: number;
  additionalPaymentRequired?: number;
}
