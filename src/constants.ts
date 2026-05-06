import { IPOEvent, IPOType, EventType } from './types';

export const MOCK_IPOS: IPOEvent[] = [
  {
    id: 'ipo-001',
    issuerName: 'Tập đoàn Công nghệ Vietcap',
    stockCode: 'VCI',
    securityType: IPOType.STOCK,
    eventType: EventType.BOOK_BUILDING,
    parValue: 10000,
    totalVolume: 50000000,
    minPrice: 32000,
    offerType: 'Chào bán ra công chúng',
    targetSegments: ['Diamond', 'Gold', 'Silver'],
    registrationMethods: ['ONLINE', 'OFFLINE'],
    minVolume: 100,
    maxVolume: 1000000,
    volumeStep: 100,
    priceStep: 100,
    depositRate: 0.1,
    startTime: '2026-05-01T08:00:00Z',
    endTime: '2026-05-15T15:00:00Z',
    paymentStartTime: '2026-05-16T08:00:00Z',
    paymentEndTime: '2026-05-20T17:00:00Z',
    refundTime: '2026-05-25',
    description: 'Đợt chào bán cổ phiếu lần đầu ra công chúng của Vietcap, đơn vị hàng đầu trong lĩnh vực dịch vụ tài chính.',
    quarterlyDocuments: {
      title: 'CUỘC HỌP KẾT QUẢ KINH DOANH HÀNG QUÝ',
      items: [
        { id: 'd1', title: 'Tóm Tắt Thảo Luận KQKD Q1/2026', date: '22/04/2026', type: 'PDF', url: '#' },
        { id: 'd2', title: 'Tài Liệu Thuyết Trình KQKD Q1/2026', date: '20/04/2026', type: 'PDF', url: '#' },
        { id: 'd3', title: 'Video Cuộc Họp KDKQ Q1/2026', date: '21/04/2026', type: 'VIDEO', url: '#' },
      ]
    },
    monthlyDocuments: {
      title: 'BÁO CÁO KẾT QUẢ KINH DOANH HÀNG THÁNG',
      items: [
        { id: 'd4', title: 'Báo Cáo KQKD 3 Tháng 2026', date: '08/04/2026', type: 'PDF', url: '#' },
        { id: 'd5', title: 'Báo Cáo KQKD 2 Tháng 2026', date: '19/03/2026', type: 'PDF', url: '#' },
      ]
    }
  },
  {
    id: 'ipo-002',
    issuerName: 'Trái phiếu Xây dựng Landmark',
    stockCode: 'LND-BOND',
    securityType: IPOType.BOND,
    eventType: EventType.FIXED_PRICE,
    parValue: 100000,
    totalVolume: 1000000,
    minPrice: 100000,
    offerType: 'Chào bán riêng lẻ',
    targetSegments: ['Professional Investors'],
    registrationMethods: ['ONLINE'],
    minVolume: 1000,
    maxVolume: 50000,
    volumeStep: 100,
    priceStep: 1,
    depositRate: 1.0, // Trả đủ 100%
    startTime: '2026-05-10T09:00:00Z',
    endTime: '2026-05-25T16:00:00Z',
    paymentStartTime: '2026-05-10T09:00:00Z',
    paymentEndTime: '2026-05-25T16:30:00Z',
    refundTime: '2026-05-30',
    description: 'Trái phiếu doanh nghiệp với lãi suất hấp dẫn 12%/năm, kỳ hạn 2 năm.',
  },
  {
    id: 'ipo-003',
    issuerName: 'Công nghệ Xanh GreenTech',
    stockCode: 'GRT',
    securityType: IPOType.STOCK,
    eventType: EventType.AUCTION,
    parValue: 10000,
    totalVolume: 20000000,
    minPrice: 15000,
    offerType: 'Chào bán ra công chúng',
    targetSegments: ['Retail', 'Professional'],
    registrationMethods: ['ONLINE'],
    minVolume: 100,
    maxVolume: 100000,
    volumeStep: 10,
    priceStep: 10,
    depositRate: 0.1,
    startTime: '2026-04-01T08:00:00Z',
    endTime: '2026-04-15T15:00:00Z',
    paymentStartTime: '2026-04-16T08:00:00Z',
    paymentEndTime: '2026-04-20T17:00:00Z',
    refundTime: '2026-04-25',
    description: 'Công ty dẫn đầu về giải pháp năng lượng sạch.',
  }
];

export const APP_CONFIG = {
  STOCKS_ACCOUNT: '0101234567',
  BANK_NAME: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)',
  BANK_ACCOUNT: '12310000987654',
  ACCOUNT_HOLDER: 'CTY CP CHUNG KHOAN TRUNG UONG',
};
