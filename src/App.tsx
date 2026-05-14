import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  AlertCircle,
  Check,
  FileCheck,
  QrCode,
  CheckCircle2,
  Bell,
  PlayCircle,
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MOCK_IPOS, APP_CONFIG, MOCK_BANK_ACCOUNTS } from './constants';
import { IPOEvent, Registration, RegistrationStatus, EventType, IPODocument } from './types';
import { fetchStockMarketData, MarketData } from './services/geminiService';
import { 
  X,
  RefreshCw,
  TrendingUp, 
  BarChart3, 
  Activity, 
  Globe, 
  ExternalLink,
  Loader2
} from 'lucide-react';

const STATUS_DEFINITIONS = {
  [RegistrationStatus.WAITING_DEPOSIT]: { label: 'Đăng ký chờ nộp cọc', color: 'bg-yellow-50 text-yellow-600', desc: 'Đã đăng ký mua nhưng chưa nộp cọc', stage: 'I. Giai đoạn nộp cọc' },
  [RegistrationStatus.DEPOSIT_SUBMITTED]: { label: 'Đăng ký đã nộp cọc', color: 'bg-blue-50 text-blue-600', desc: 'Đã đăng ký mua và nộp cọc thành công, chờ xác nhận của DLC', stage: 'I. Giai đoạn nộp cọc' },
  [RegistrationStatus.DEPOSIT_ERROR]: { label: 'Nộp cọc lỗi', color: 'bg-red-50 text-red-600', desc: 'Đã đăng ký mua nhưng giao dịch cọc lỗi / chưa khớp', stage: 'I. Giai đoạn nộp cọc' },
  [RegistrationStatus.DEPOSIT_UNREGISTERED]: { label: 'Nộp cọc chưa đăng ký', color: 'bg-gray-50 text-gray-500', desc: 'Đã nộp cọc nhưng chưa có đăng ký mua hợp lệ', stage: 'I. Giai đoạn nộp cọc' },
  [RegistrationStatus.DEPOSIT_CONFIRMED]: { label: 'DLC xác nhận cọc', color: 'bg-emerald-50 text-emerald-600', desc: 'DLC xác nhận đăng ký mua và tiền cọc hợp lệ', stage: 'I. Giai đoạn nộp cọc' },
  [RegistrationStatus.WAITING_PAYMENT]: { label: 'Chờ nộp tiền', color: 'bg-orange-50 text-orange-600', desc: 'Đã đủ điều kiện thanh toán nhưng chưa nộp tiền', stage: 'II. Giai đoạn nộp tiền' },
  [RegistrationStatus.PAYMENT_SUBMITTED]: { label: 'Đã nộp tiền', color: 'bg-indigo-50 text-indigo-600', desc: 'Ghi nhận nộp tiền thành công, chờ xác nhận DLC', stage: 'II. Giai đoạn nộp tiền' },
  [RegistrationStatus.PAYMENT_ERROR]: { label: 'Nộp tiền lỗi', color: 'bg-rose-50 text-rose-600', desc: 'Có phát sinh giao dịch nhưng lỗi / chưa khớp', stage: 'II. Giai đoạn nộp tiền' },
  [RegistrationStatus.PAYMENT_CONFIRMED]: { label: 'DLC xác nhận tiền', color: 'bg-emerald-100 text-emerald-800', desc: 'ĐLC xác nhận thanh toán hợp lệ', stage: 'II. Giai đoạn nộp tiền' },
  [RegistrationStatus.CANCELLED]: { label: 'Đã hủy', color: 'bg-gray-200 text-gray-600', desc: 'Hồ sơ đã bị hủy', stage: 'Khác' },
};

// Components
const DocumentCard = ({ doc }: { doc: IPODocument, key?: string }) => (
  <div className="bg-white border border-gray-100 rounded-lg p-2 flex items-center gap-2 hover:border-blue-200 transition-all cursor-pointer">
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${doc.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
      {doc.type === 'PDF' ? (
        <FileText size={16} />
      ) : (
        <PlayCircle size={18} />
      )}
    </div>
    <div className="flex-1 overflow-hidden">
      <h4 className="text-[9px] font-bold text-gray-800 truncate leading-tight mb-0.5">{doc.title}</h4>
      <p className="text-[8px] text-gray-400 font-medium">{doc.date}</p>
    </div>
  </div>
);

const RegistrationStepper = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {[1, 2, 3, 4].map((step) => (
      <React.Fragment key={step}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          currentStep >= step ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'
        }`}>
          {step}
        </div>
        {step < 4 && <div className={`h-1 w-6 rounded-full transition-all ${currentStep > step ? 'bg-orange-600' : 'bg-gray-100'}`} />}
      </React.Fragment>
    ))}
  </div>
);

const MobileFrame = ({ children, title, onBack, rightAction }: { 
  children: React.ReactNode, 
  title: string, 
  onBack?: () => void, 
  rightAction?: React.ReactNode
}) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100 p-0 sm:p-4 font-sans">
    <div className="w-full max-w-[430px] h-[932px] bg-white shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[3rem] border-[8px] border-gray-900">
      {/* Dynamic Notch/Header bar */}
      <div className="h-10 bg-white flex items-center justify-between px-8 text-xs font-bold shrink-0">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <div className="w-4 h-4 bg-black rounded-full" />
          <div className="w-4 h-4 bg-black rounded-full" />
          <div className="w-10 h-4 bg-black rounded-full" />
        </div>
      </div>
      
      {/* App Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 shrink-0 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95">
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
          )}
          <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">{title}</h1>
        </div>
        {rightAction}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 h-full scroll-smooth">
        {children}
      </div>
    </div>
  </div>
);

const IPOListItem = ({ ipo, onSelect, onInfo }: { ipo: IPOEvent, onSelect: (ipo: IPOEvent) => void, onInfo: (ipo: IPOEvent) => void, key?: string }) => {
  const currentTime = new Date('2026-05-06T04:31:11Z').getTime();
  const startTime = new Date(ipo.startTime).getTime();
  const endTime = new Date(ipo.endTime).getTime();

  let statusLabel = "Sắp diễn ra";
  let statusColor = "bg-blue-50 text-blue-600";
  
  if (currentTime > endTime) {
    statusLabel = "Đã kết thúc";
    statusColor = "bg-gray-100 text-gray-500";
  } else if (currentTime >= startTime) {
    statusLabel = "Đang diễn ra";
    statusColor = "bg-green-50 text-green-600";
  }

  return (
    <motion.div 
      whileTap={statusLabel !== "Đã kết thúc" ? { scale: 0.98 } : {}}
      onClick={() => statusLabel !== "Đã kết thúc" && onSelect(ipo)}
      className={`bg-white border border-gray-100 p-4 rounded-2xl mb-4 shadow-sm transition-all relative ${statusLabel !== "Đã kết thúc" ? 'hover:border-orange-200 cursor-pointer group' : 'opacity-70 group'}`}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onInfo(ipo);
        }}
        className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all z-10"
      >
        <Info size={20} />
      </button>

      <div className="flex justify-between items-start mb-2 pr-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor}`}>
               {statusLabel}
             </span>
             <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase">
               {ipo.stockCode}
             </span>
          </div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-orange-600 transition-colors uppercase">{ipo.issuerName}</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
            {statusLabel === "Đang diễn ra" 
              ? `Thời gian: ${new Date(ipo.startTime).toLocaleDateString('vi-VN')} - ${new Date(ipo.endTime).toLocaleDateString('vi-VN')}`
              : statusLabel === "Đã kết thúc"
                ? `Kết thúc: ${new Date(ipo.endTime).toLocaleDateString('vi-VN')}`
                : `Bắt đầu: ${new Date(ipo.startTime).toLocaleDateString('vi-VN')}`
            }
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 py-3 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Giá khởi điểm</p>
          <p className="text-sm font-bold text-gray-800">{ipo.minPrice.toLocaleString()} đ</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Khối lượng tối thiểu</p>
          <p className="text-sm font-bold text-gray-800">{ipo.minVolume.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ipo.securityType === 'STOCK' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {ipo.securityType}
        </span>
        {statusLabel !== "Đã kết thúc" && (
          <div className="flex items-center text-orange-500 font-bold text-xs gap-1 group-hover:translate-x-1 transition-transform">
            {statusLabel === "Sắp diễn ra" ? "Xem chi tiết" : "Đăng ký ngay"} <ChevronRight size={16} />
          </div>
        )}
      </div>
      
      {statusLabel === "Đã kết thúc" && (
        <div className="mt-3 py-3 px-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mua thành công</span>
            <span className="text-sm font-black text-emerald-600">{(ipo.totalVolume / 1000).toLocaleString()} <span className="text-[10px] font-bold">CP</span></span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={16} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const AllocationDetailsScreen = ({ 
  registration, 
  ipo, 
  onBack, 
  onPay 
}: { 
  registration: Registration, 
  ipo: IPOEvent, 
  onBack: () => void,
  onPay: () => void 
}) => {
  if (!registration || !ipo) return null;
  const isAllocated = registration.allocatedVolume !== undefined;
  const hasAllocation = (registration.allocatedVolume || 0) > 0;
  const allocatedValue = (registration.allocatedVolume || 0) * (registration.allocatedPrice || registration.price);
  
  return (
    <div className="py-6 flex flex-col h-full overflow-y-auto">
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-8 ring-white ${
          !isAllocated ? 'bg-blue-100 text-blue-600' : 
          hasAllocation ? 'bg-emerald-100 text-emerald-600' : 
          'bg-gray-100 text-gray-400'
        }`}>
          {!isAllocated ? <Bell size={48} className="animate-bounce" /> : hasAllocation ? <CheckCircle2 size={48} /> : <Info size={48} />}
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Chi tiết phân bổ</h2>
        <p className="text-sm font-bold text-orange-600 uppercase mt-1 tracking-widest">{ipo.issuerName}</p>
      </div>

      <div className={`rounded-3xl p-8 mb-6 border-2 border-dashed transition-all relative overflow-hidden group ${
        !isAllocated ? 'bg-blue-50 border-blue-200' : 
        hasAllocation ? 'bg-emerald-50 border-emerald-200' : 
        'bg-gray-50 border-gray-200'
      }`}>
        <motion.div 
          initial={{ rotate: 0, opacity: 0.05 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-16 -right-16 w-64 h-64 bg-current rounded-full pointer-events-none" 
        />
        <div className="text-center relative z-10">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Giai đoạn 6: Kết quả thầu & Quyết toán</p>
          
          {/* Phase 6 Step Tracker */}
          <div className="flex justify-between items-center mb-6 px-4">
             {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${s <= (isAllocated ? 4 : 2) ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {s < (isAllocated ? 4 : 2) ? <Check size={12} strokeWidth={3} /> : s}
                   </div>
                   {s < 5 && <div className={`w-6 h-0.5 ${s < (isAllocated ? 4 : 2) ? 'bg-orange-600' : 'bg-gray-200'}`} />}
                </div>
             ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <h3 className={`text-4xl font-black uppercase tracking-tighter ${
              !isAllocated ? 'text-blue-600' : 
              hasAllocation ? 'text-emerald-600' : 
              'text-gray-500'
            }`}>
              {!isAllocated ? 'Đang xử lý' : hasAllocation ? 'Phân bổ khớp' : 'Không trúng'}
            </h3>
            <div className={`h-1.5 w-12 rounded-full ${
              !isAllocated ? 'bg-blue-500' : 
              hasAllocation ? 'bg-emerald-500' : 
              'bg-gray-400'
            }`} />
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 flex flex-col justify-center">
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Tổng đăng ký</p>
               <p className="text-lg font-black text-gray-900">{registration.volume.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase">CP</span></p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 flex flex-col justify-center">
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Giá đặt thầu</p>
               <p className="text-lg font-black text-gray-900">{registration.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-bold uppercase">đ</span></p>
            </div>

            {isAllocated && hasAllocation ? (
              <>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 border border-emerald-100 shadow-sm transition-all hover:shadow-emerald-100/80 hover:scale-[1.02]">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Số lượng khớp</p>
                     <p className="text-2xl font-black text-emerald-600 leading-none">{registration.allocatedVolume?.toLocaleString()} <span className="text-[10px] uppercase align-middle text-gray-400 font-bold">CP</span></p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 border border-emerald-100 shadow-sm transition-all hover:shadow-emerald-100/80 hover:scale-[1.02]">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Tỷ lệ phân bổ</p>
                     <p className="text-2xl font-black text-emerald-600 leading-none">{((registration.allocatedVolume || 0) / registration.volume * 100).toFixed(1)}<span className="text-[10px] uppercase align-middle text-gray-400 font-bold">%</span></p>
                  </div>
                </div>
                
                <div className="col-span-2 bg-emerald-600/5 rounded-2xl p-4 border border-emerald-100 flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-1">Giá khớp thực tế</p>
                    <p className="text-lg font-black text-emerald-700">{(registration.allocatedPrice || registration.price).toLocaleString()} <span className="text-[10px] font-bold">đ / CP</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-1">Tổng giá trị khớp</p>
                    <p className="text-lg font-black text-emerald-700">{allocatedValue.toLocaleString()} <span className="text-[10px] font-bold">VNĐ</span></p>
                  </div>
                </div>
              </>
            ) : isAllocated && !hasAllocation ? (
              <div className="col-span-2 py-6 text-center bg-white/40 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Lệnh không trúng thầu</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Tiền cọc sẽ được hoàn trả 100%</p>
              </div>
            ) : (
              <div className="col-span-2 py-6 flex flex-col items-center justify-center bg-white/40 rounded-3xl border border-dashed border-blue-200">
                <div className="flex gap-1.5 mb-3">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest text-center leading-relaxed">
                  Đang phân tích tỷ lệ khớp <br/>
                  <span className="text-gray-400 text-[8px] font-bold">Vui lòng đợi kết quả thầu...</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-xl shadow-gray-100/50 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/20 rounded-full -mr-16 -mt-16" />
        <h4 className="text-[11px] font-black text-gray-900 uppercase mb-6 tracking-[0.2em] flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
            <QrCode size={18} />
          </div>
          Nghĩa vụ tài chính & Quyết toán
        </h4>
        <div className="space-y-4 relative z-10">
          {/* Summary Breakdown Table */}
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Phân tích chênh lệch Quyết toán</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-bold">(A) Tiền cọc đã nộp</span>
                <span className="font-black text-blue-600">{(registration.totalPaid || 0).toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-bold">(B) Giá trị khớp thực tế</span>
                <span className="font-black text-orange-600">{allocatedValue.toLocaleString()} VNĐ</span>
              </div>
              <div className="h-px bg-gray-200 border-dashed" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-900 uppercase">Chênh lệch (A - B)</span>
                <span className={`text-sm font-black ${(registration.totalPaid || 0) - allocatedValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {((registration.totalPaid || 0) - allocatedValue).toLocaleString()} VNĐ
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm pt-2 group">
            <div className="flex flex-col">
              <span className="text-blue-600 font-black uppercase tracking-widest text-[9px] mb-0.5">Tiền cọc đã nộp (10%) - (A)</span>
              <span className="font-medium text-gray-400 text-[10px] italic">Số tiền đã bị tạm ngưng/khấu trừ</span>
            </div>
            <span className="font-black text-gray-900 text-lg">{(registration.totalPaid || 0).toLocaleString()} <span className="text-[10px] font-bold text-gray-400">VNĐ</span></span>
          </div>
          
          {isAllocated && (
            <div className="flex justify-between items-center text-sm group">
              <div className="flex flex-col">
                <span className="text-orange-600 font-black uppercase tracking-widest text-[9px] mb-0.5">Giá trị phân bổ thực tế - (B)</span>
                <span className="font-medium text-gray-400 text-[10px] italic">{registration.allocatedVolume?.toLocaleString()} CP x {(registration.allocatedPrice || registration.price).toLocaleString()} VNĐ</span>
              </div>
              <span className="font-black text-gray-900 text-lg">{allocatedValue.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">VNĐ</span></span>
            </div>
          )}
          
          <div className="h-px bg-gray-50 flex items-center justify-center my-2">
            <div className="bg-white px-4 py-1 border border-gray-100 rounded-full">
               <ChevronDown size={14} className="text-gray-300" />
            </div>
          </div>
          
          {!isAllocated ? (
             <div className="text-center py-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] animate-pulse">Đang quyết toán chênh lệch (A - B)...</p>
             </div>
          ) : registration.refundAmount ? (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2rem] p-6 shadow-2xl shadow-emerald-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">Tiền hoàn trả (A - B)</span>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white relative z-10 flex items-baseline gap-2">
                +{registration.refundAmount.toLocaleString()} 
                <span className="text-sm font-bold opacity-80 uppercase">VNĐ</span>
              </div>
              <div className="text-[9px] text-white font-bold uppercase mt-4 leading-relaxed relative z-10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                Tự động hoàn về tài khoản NH đăng ký
              </div>
            </div>
          ) : registration.additionalPaymentRequired ? (
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2rem] p-6 shadow-2xl shadow-orange-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">Cần nộp thêm (B - A)</span>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle size={20} className="text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-white relative z-10 flex items-baseline gap-2">
                {registration.additionalPaymentRequired.toLocaleString()} 
                <span className="text-sm font-bold opacity-80 uppercase">VNĐ</span>
              </div>
              <div className="text-[9px] text-white font-bold uppercase mt-4 leading-relaxed relative z-10 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                 Hạn thanh toán: {new Date(ipo.paymentEndTime).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-900 rounded-3xl shadow-xl border border-white/10">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Quyết toán cân bằng</span>
              <p className="text-[9px] text-white/40 font-bold uppercase mt-1">Đã hoàn tất nghĩa vụ tài chính</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {(registration.additionalPaymentRequired || 0) > 0 && (
          <button 
            onClick={onPay}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all uppercase tracking-widest text-sm active:scale-95"
          >
            Thanh toán phần còn lại ngay
          </button>
        )}
        <button 
          onClick={onBack}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-black transition-all uppercase tracking-[0.2em] text-sm active:scale-95"
        >
          Danh sách sổ lệnh IPO
        </button>
      </div>
    </div>
  );
};

const SuccessScreen = ({ registration, ipo, onDone, onViewAllocation, onUpdateMethod }: { registration: Registration, ipo: IPOEvent, onDone: () => void, onViewAllocation: () => void, onUpdateMethod: (id: string, method: 'STOCK_ACCOUNT' | 'BANK_TRANSFER') => void }) => {
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const [showQR, setShowQR] = useState(registration.depositMethod === 'BANK_TRANSFER');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!registration || !ipo) return null;

  const depositAmount = registration.volume * registration.price * ipo.depositRate;
  const isStockAccount = registration.depositMethod === 'STOCK_ACCOUNT';
  const isFullyPaid = (registration.additionalPaymentRequired || 0) === 0 && (registration.status === RegistrationStatus.PAYMENT_CONFIRMED || registration.status === RegistrationStatus.PAYMENT_SUBMITTED);

  const canSwitchMethod = !isFullyPaid && [RegistrationStatus.WAITING_DEPOSIT, RegistrationStatus.DEPOSIT_SUBMITTED, RegistrationStatus.DEPOSIT_ERROR].includes(registration.status);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    { label: 'Đăng ký thành công', status: 'completed', desc: 'Hệ thống đã tiếp nhận hồ sơ hợp lệ' },
    { label: 'Xác nhận chữ ký số', status: 'completed', desc: 'Đã hoàn tất ký hợp đồng điện tử' },
    { label: 'Nộp tiền cọc', status: [RegistrationStatus.DEPOSIT_SUBMITTED, RegistrationStatus.DEPOSIT_CONFIRMED, RegistrationStatus.WAITING_PAYMENT, RegistrationStatus.PAYMENT_SUBMITTED, RegistrationStatus.PAYMENT_CONFIRMED].includes(registration.status) || isStockAccount ? 'completed' : 'active', desc: isStockAccount ? 'Tự động trích nợ từ tài khoản chứng khoán' : 'Vui lòng hoàn tất chuyển khoản' },
    { label: 'Kết quả phân bổ', status: registration.allocatedVolume !== undefined ? 'completed' : 'upcoming', desc: registration.allocatedVolume !== undefined ? 'Đã có kết quả phân bổ chính thức' : 'Thông báo sau khi kết thúc đợt đăng ký' },
    { label: 'Nộp tiền mua', status: (registration.additionalPaymentRequired || 0) > 0 ? 'active' : (isFullyPaid ? 'completed' : 'upcoming'), desc: (registration.additionalPaymentRequired || 0) > 0 ? 'Quý khách vui lòng nộp thêm phần tiền chênh lệch' : 'Thanh toán dựa trên số lượng được phân bổ thực tế' },
    { label: 'Hoàn tất sở hữu', status: isFullyPaid ? 'active' : 'upcoming', desc: isFullyPaid ? 'Đang tiến hành chốt quyền sở hữu' : 'Chốt quyền và ghi nhận sở hữu' },
  ];

  return (
    <div className="py-6 flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div 
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-inner"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          {isFullyPaid ? 'Đã thanh toán xong' : 'Hồ sơ đã gửi'}
        </h2>
        <p className="text-sm font-bold text-orange-600 uppercase mt-1 tracking-widest">{ipo.issuerName}</p>
        <p className="text-gray-500 mt-2 text-xs max-w-[280px] leading-relaxed">
          {isFullyPaid 
            ? "Hệ thống đã ghi nhận thanh toán hoàn tất. Mã chứng khoán sẽ được cập nhật vào danh mục của bạn khi kết thúc đợt phát hành."
            : isStockAccount 
              ? "Yêu cầu đã được tiếp nhận. Tiền cọc sẽ được hệ thống trích tự động từ tài khoản chứng khoán của bạn."
              : "Yêu cầu đã được tiếp nhận. Hồ sơ sẽ hoàn tất ngay sau khi hệ thống ghi nhận tiền cọc của bạn."
          }
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-[10px] font-black text-orange-600 uppercase mb-4 tracking-widest text-center">Tóm tắt xác nhận</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-white/60 rounded-2xl border border-orange-100/50">
            <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">Số lượng</span>
            <span className="text-sm font-black text-gray-900">
              {isFullyPaid ? (registration.allocatedVolume || registration.volume).toLocaleString() : registration.volume.toLocaleString()} <span className="text-[10px]">CP</span>
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white/60 rounded-2xl border border-orange-100/50">
            <span className="text-[9px] font-bold text-gray-400 uppercase mb-1">Giá thanh toán</span>
            <span className="text-sm font-black text-gray-900">
              {(isFullyPaid ? (registration.allocatedPrice || registration.price) : registration.price).toLocaleString()} <span className="text-[10px]">đ</span>
            </span>
          </div>
          
          <div className="col-span-2 flex flex-col items-center p-4 bg-orange-600 rounded-2xl shadow-lg shadow-orange-100 relative overflow-hidden">
            <span className="text-[10px] font-bold text-white/70 uppercase mb-1">
              {isFullyPaid ? 'Tổng giá trị đầu tư' : 'Tổng tiền đặt cọc'}
            </span>
            <span className="text-xl font-black text-white">
              {isFullyPaid 
                ? ((registration.allocatedVolume || 0) * (registration.allocatedPrice || registration.price)).toLocaleString()
                : depositAmount.toLocaleString()} VNĐ
            </span>
            {registration.referralId && (
              <div className="absolute top-0 right-0 p-1">
                <div className="bg-white/20 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-bl-lg backdrop-blur-sm">
                  Ref: {registration.referralId}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm transition-all mb-8">
        <button 
          onClick={() => setIsProgressExpanded(!isProgressExpanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={18} className="text-orange-500" />
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-wider">Tiến độ hồ sơ</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
              {steps.filter(s => s.status === 'completed').length}/{steps.length}
            </span>
            {isProgressExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </button>

        <AnimatePresence>
          {isProgressExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2">
                <div className="space-y-8 relative ml-2">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100" />
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative z-10">
                      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-gray-50 flex-shrink-0 ${
                        step.status === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                        step.status === 'active' ? 'bg-orange-500 text-white animate-pulse shadow-lg shadow-orange-100' :
                        'bg-gray-200 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${
                          step.status === 'completed' ? 'text-gray-900' :
                          step.status === 'active' ? 'text-orange-600' :
                          'text-gray-400'
                        }`}>{step.label}</span>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-1">{step.desc}</p>
                        {step.status === 'active' && !isStockAccount && (
                          <div className="mt-2 bg-orange-50 p-2 rounded-lg border border-orange-100/50">
                            <p className="text-[9px] text-orange-700 font-bold">Vui lòng hoàn tất nộp tiền cọc để hồ sơ được phê duyệt chính thức.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isProgressExpanded && (
          <div className="px-6 pb-4">
            <div className="flex gap-1">
              {steps.map((step, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${step.status === 'completed' ? 'bg-green-500' : step.status === 'active' ? 'bg-orange-500' : 'bg-gray-200'}`} />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Click để xem chi tiết các bước tiếp theo</p>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button 
          onClick={onViewAllocation}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          Xem chi tiết phân bổ
        </button>
        <button 
          onClick={onDone}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all"
        >
          Trở về màn hình chính
        </button>
      </div>
    </div>
  );
};

const CompanyInfoScreen = ({ ipo, onBack, onRegister }: { ipo: IPOEvent, onBack: () => void, onRegister: () => void }) => {
  const [expandedQuarterly, setExpandedQuarterly] = useState(true);
  const [expandedMonthly, setExpandedMonthly] = useState(true);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  const handleFetchMarketData = async () => {
    setIsLoadingMarket(true);
    const data = await fetchStockMarketData(ipo.stockCode);
    setMarketData(data);
    setIsLoadingMarket(false);
  };

  return (
    <div className="py-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
             <Info size={28} />
           </div>
           <div>
             <h2 className="text-xl font-black text-gray-900 leading-tight uppercase">{ipo.issuerName}</h2>
             <span className="text-xs font-bold text-gray-400 tracking-widest">MÃ CHỨNG KHOÁN: {ipo.stockCode}</span>
           </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
          "{ipo.description}"
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            Thông tin niêm yết (Sân bãi)
          </h3>
          <button 
            onClick={handleFetchMarketData}
            disabled={isLoadingMarket}
            className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50"
          >
            {isLoadingMarket ? <Loader2 size={12} className="animate-spin" /> : <Activity size={12} />}
            {marketData ? 'Cập nhật' : 'Lấy dữ liệu sàn'}
          </button>
        </div>

        <AnimatePresence>
          {marketData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl mb-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe size={120} />
              </div>
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Giá hiện tại (VNĐ)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{marketData.price}</span>
                    <span className={`text-sm font-bold ${marketData.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {marketData.change} ({marketData.changePercent})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Khối lượng</p>
                  <p className="text-lg font-black">{marketData.volume}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 border-t border-white/10 pt-6 mb-6">
                <div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vốn hóa thị trường</p>
                  <p className="text-xs font-black uppercase">{marketData.marketCap}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Chỉ số P/E</p>
                  <p className="text-xs font-black uppercase">{marketData.peRatio}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tỷ suất cổ tức</p>
                  <p className="text-xs font-black uppercase">{marketData.dividendYield}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">52 Tuần (H/L)</p>
                  <p className="text-xs font-black uppercase">{marketData.high52w} / {marketData.low52w}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <TrendingUp size={10} />
                  Nhận định thị trường
                </p>
                <p className="text-[11px] font-medium leading-relaxed italic opacity-90">
                  {marketData.summary}
                </p>
              </div>

              <div className="mt-4 flex justify-center">
                <a href={`https://banggia.cafef.vn/stock/${ipo.stockCode}`} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-blue-400 flex items-center gap-1 hover:underline">
                  Xem chi tiết trên sàn chứng khoán <ExternalLink size={10} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {ipo.financialHighlights && (
        <div className="mb-8">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
            Chỉ số tài chính năm {ipo.financialHighlights.year}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Doanh thu', value: ipo.financialHighlights.revenue, color: 'text-blue-600' },
              { label: 'Lợi nhuận', value: ipo.financialHighlights.profit, color: 'text-emerald-600' },
              { label: 'Tổng tài sản', value: ipo.financialHighlights.assets, color: 'text-orange-600' },
              { label: 'Vốn CSH', value: ipo.financialHighlights.equity, color: 'text-indigo-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
          Báo cáo & Tài liệu
        </h3>

        {ipo.quarterlyDocuments && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedQuarterly(!expandedQuarterly)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{ipo.quarterlyDocuments.title}</h4>
              {expandedQuarterly ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            <AnimatePresence>
              {expandedQuarterly && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-gray-50/30 px-4 pb-4"
                >
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {ipo.quarterlyDocuments.items.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {ipo.monthlyDocuments && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedMonthly(!expandedMonthly)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{ipo.monthlyDocuments.title}</h4>
              {expandedMonthly ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            <AnimatePresence>
              {expandedMonthly && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-gray-50/30 px-4 pb-4"
                >
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {ipo.monthlyDocuments.items.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-auto flex gap-3">
        <button 
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          Quay lại
        </button>
        <button 
          onClick={onRegister}
          className="flex-[2] bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          Tiến hành đăng ký ngay
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<'home' | 'details' | 'form' | 'review' | 'sign' | 'payment' | 'success' | 'profile' | 'allocation_details' | 'remaining_payment' | 'company_info'>('home');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [selectedIpo, setSelectedIpo] = useState<IPOEvent | null>(null);
  const [infoIpo, setInfoIpo] = useState<IPOEvent | null>(null);
  const [formData, setFormData] = useState<Partial<Registration>>({
    volume: 100,
    price: 32000,
    depositMethod: 'STOCK_ACCOUNT',
    stockAccount: '0123456789',
    refundBankInfo: {
      bankName: '',
      accountNumber: '',
      accountName: ''
    }
  });
  const [registrations, setRegistrations] = useState<Registration[]>([
    {
      id: 'reg-001',
      eventId: 'ipo-001',
      volume: 5000,
      price: 32000,
      depositMethod: 'STOCK_ACCOUNT',
      status: RegistrationStatus.PAYMENT_CONFIRMED,
      createdAt: '2026-04-15T08:00:00Z',
      allocatedVolume: 4200,
      allocatedPrice: 32000,
      totalPaid: 160000000,
      refundAmount: 25600000,
    },
    {
      id: 'reg-002',
      eventId: 'ipo-003',
      volume: 10000,
      price: 15500,
      depositMethod: 'BANK_TRANSFER',
      status: RegistrationStatus.PAYMENT_CONFIRMED,
      createdAt: '2026-04-20T09:00:00Z',
      allocatedVolume: 0,
      allocatedPrice: 0,
      totalPaid: 15500000,
      refundAmount: 15500000,
    },
    {
      id: 'reg-003',
      eventId: 'ipo-001',
      volume: 1000,
      price: 32000,
      depositMethod: 'BANK_TRANSFER',
      status: RegistrationStatus.WAITING_PAYMENT,
      createdAt: '2026-04-25T10:00:00Z',
      allocatedVolume: 1000,
      allocatedPrice: 32000,
      totalPaid: 3200000,
      additionalPaymentRequired: 28800000,
    },
    {
      id: 'reg-004',
      eventId: 'ipo-002',
      volume: 2000,
      price: 10000,
      depositMethod: 'STOCK_ACCOUNT',
      status: RegistrationStatus.WAITING_DEPOSIT,
      createdAt: '2026-05-01T09:30:00Z',
    },
    {
      id: 'reg-005',
      eventId: 'ipo-004',
      volume: 5000,
      price: 35000,
      depositMethod: 'BANK_TRANSFER',
      status: RegistrationStatus.DEPOSIT_SUBMITTED,
      createdAt: '2026-05-02T14:20:00Z',
    },
    {
      id: 'reg-006',
      eventId: 'ipo-005',
      volume: 3000,
      price: 25000,
      depositMethod: 'STOCK_ACCOUNT',
      status: RegistrationStatus.DEPOSIT_CONFIRMED,
      createdAt: '2026-05-03T11:00:00Z',
    }
  ]);
  const [profileSearch, setProfileSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending_payment'>('all');
  const [expandedQuarterly, setExpandedQuarterly] = useState(false);
  const [expandedMonthly, setExpandedMonthly] = useState(false);
  const [expandedRefundInfo, setExpandedRefundInfo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'manual' | 'account'>('qr');
  const [showStatusHelp, setShowStatusHelp] = useState(false);

  const handleSelectIpo = (ipo: IPOEvent) => {
    setSelectedIpo(ipo);
    setFormData({
       volume: ipo.minVolume,
       price: ipo.minPrice,
       depositMethod: 'STOCK_ACCOUNT',
       stockAccount: '0123456789',
       refundBankInfo: {
         bankName: '',
         accountNumber: '',
         accountName: ''
       }
    });
    setCurrentStep('details');
  };

  const currentRegistration = useMemo(() => {
    return registrations.find(r => r.eventId === selectedIpo?.id);
  }, [registrations, selectedIpo]);

  const goToForm = () => setCurrentStep('form');
  const goToReview = () => setCurrentStep('review');
  const goToSign = () => setCurrentStep('sign');
  
    const handleSign = () => {
    if (formData.depositMethod === 'STOCK_ACCOUNT') {
      const newReg: Registration = {
        id: Math.random().toString(36).substr(2, 9),
        eventId: selectedIpo!.id,
        volume: formData.volume!,
        price: formData.price!,
        depositMethod: formData.depositMethod!,
        status: RegistrationStatus.WAITING_DEPOSIT,
        createdAt: new Date().toISOString(),
        signedAt: new Date().toISOString(),
      };
      setRegistrations([...registrations, newReg]);
      setCurrentStep('success');
    } else {
      setCurrentStep('payment');
    }
  };

  const handlePaymentConfirm = () => {
    const newReg: Registration = {
      id: Math.random().toString(36).substr(2, 9),
      eventId: selectedIpo!.id,
      volume: formData.volume!,
      price: formData.price!,
      depositMethod: formData.depositMethod!,
      status: RegistrationStatus.DEPOSIT_SUBMITTED,
      createdAt: new Date().toISOString(),
      signedAt: new Date().toISOString(),
      depositedAt: new Date().toISOString(),
    };
    setRegistrations([...registrations, newReg]);
    setCurrentStep('success');
  };

  const handleInfoOpen = (ipo: IPOEvent) => {
    setInfoIpo(ipo);
    setCurrentStep('company_info');
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'home':
        const pendingPaymentCount = registrations.filter(r => (r.additionalPaymentRequired || 0) > 0).length;
        
        return (
          <div className="py-2">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Chào mừng bạn</p>
                  <h2 className="text-xl font-black text-gray-900 uppercase">IPO Catalog</h2>
                </div>
                <button 
                  onClick={() => setShowStatusHelp(!showStatusHelp)}
                  className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100 hover:bg-orange-100 transition-all"
                  title="Giải thích trạng thái"
                >
                  <Info size={20} />
                </button>
             </div>

             <AnimatePresence>
                {showStatusHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-gray-900 text-white rounded-3xl p-6 overflow-hidden relative border border-white/5 shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                          <Info size={18} />
                        </div>
                        Ý nghĩa các trạng thái
                      </h3>
                      
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <div className="w-1 h-3 bg-orange-500 rounded-full" />
                             I. Giai đoạn nộp cọc
                          </h4>
                          <div className="space-y-4">
                             {Object.entries(STATUS_DEFINITIONS).filter(([_, def]) => def.stage === 'I. Giai đoạn nộp cọc').map(([key, def]) => (
                               <div key={key} className="flex gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${def.color.split(' ')[0]}`} />
                                  <div className="flex-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{def.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase opacity-80">{def.desc}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <div className="w-1 h-3 bg-blue-500 rounded-full" />
                             II. Giai đoạn nộp tiền
                          </h4>
                          <div className="space-y-4">
                             {Object.entries(STATUS_DEFINITIONS).filter(([_, def]) => def.stage === 'II. Giai đoạn nộp tiền').map(([key, def]) => (
                               <div key={key} className="flex gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${def.color.split(' ')[0]}`} />
                                  <div className="flex-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{def.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase opacity-80">{def.desc}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowStatusHelp(false)}
                        className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all font-mono"
                      >
                        Đã hiểu
                      </button>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>

             {pendingPaymentCount > 0 && (
               <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                     <AlertCircle size={14} />
                     Hành động cần xử lý ({pendingPaymentCount})
                   </h2>
                 </div>
                 <div className="space-y-3">
                   {registrations.filter(r => r.status === RegistrationStatus.WAITING_PAYMENT).map(reg => {
                     const ipo = MOCK_IPOS.find(i => i.id === reg.eventId);
                     return (
                       <motion.div 
                         key={reg.id}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => {
                           setSelectedReg(reg);
                           setSelectedIpo(ipo!);
                           setCurrentStep('allocation_details');
                         }}
                         className="bg-orange-600 rounded-3xl p-4 shadow-lg shadow-orange-100 flex items-center justify-between cursor-pointer group border border-orange-500"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                             <QrCode size={20} />
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Chờ nộp tiền mua</p>
                             <p className="text-sm font-black text-white leading-tight">{ipo?.stockCode} - {ipo?.issuerName}</p>
                           </div>
                         </div>
                         <div className="bg-white text-orange-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-orange-50 transition-colors">
                           Nộp ngay
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
               </div>
             )}

             {registrations.filter(r => r.status === RegistrationStatus.WAITING_DEPOSIT).length > 0 && (
               <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] flex items-center gap-2">
                     <AlertCircle size={14} />
                     Chờ nộp cọc ({registrations.filter(r => r.status === RegistrationStatus.WAITING_DEPOSIT).length})
                   </h2>
                 </div>
                 <div className="space-y-3">
                   {registrations.filter(r => r.status === RegistrationStatus.WAITING_DEPOSIT).map(reg => {
                     const ipo = MOCK_IPOS.find(i => i.id === reg.eventId);
                     return (
                       <motion.div 
                         key={reg.id}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => {
                           setSelectedReg(reg);
                           setSelectedIpo(ipo!);
                           setCurrentStep('success'); // Show progress/details
                         }}
                         className="bg-white border-2 border-yellow-400 rounded-3xl p-4 shadow-sm flex items-center justify-between cursor-pointer group"
                       >
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                             <History size={20} />
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest leading-none mb-1">Chờ nộp tiền cọc</p>
                             <p className="text-sm font-black text-gray-900 leading-tight">{ipo?.stockCode} - {ipo?.issuerName}</p>
                           </div>
                         </div>
                         <div className="text-yellow-600 p-1 group-hover:translate-x-1 transition-transform">
                           <ChevronRight size={20} />
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
               </div>
             )}
             
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Các sự kiện IPO hiện có</h2>
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Live</span>
               </div>
             </div>

             <div className="space-y-4">
               {MOCK_IPOS.map(ipo => (
                 <IPOListItem key={ipo.id} ipo={ipo} onSelect={handleSelectIpo} onInfo={handleInfoOpen} />
               ))}
             </div>
          </div>
        );

      case 'company_info':
        return (
          <CompanyInfoScreen 
            ipo={infoIpo!} 
            onBack={() => setCurrentStep('home')} 
            onRegister={() => {
              handleSelectIpo(infoIpo!);
            }} 
          />
        );

      case 'profile':
        const filteredRegs = registrations.filter(reg => {
          const ipo = MOCK_IPOS.find(i => i.id === reg.eventId);
          const searchLower = profileSearch.toLowerCase();
          return (
            ipo?.issuerName.toLowerCase().includes(searchLower) ||
            ipo?.stockCode.toLowerCase().includes(searchLower) ||
            reg.id.toLowerCase().includes(searchLower)
          );
        });

        const sortedRegs = [...filteredRegs].sort((a, b) => {
          // Prioritize WAITING_PAYMENT
          if (a.status === RegistrationStatus.WAITING_PAYMENT && b.status !== RegistrationStatus.WAITING_PAYMENT) return -1;
          if (a.status !== RegistrationStatus.WAITING_PAYMENT && b.status === RegistrationStatus.WAITING_PAYMENT) return 1;
          
          // Secondary prioritize WAITING_DEPOSIT
          if (a.status === RegistrationStatus.WAITING_DEPOSIT && b.status !== RegistrationStatus.WAITING_DEPOSIT) return -1;
          if (a.status !== RegistrationStatus.WAITING_DEPOSIT && b.status === RegistrationStatus.WAITING_DEPOSIT) return 1;

          // Default sort by createdAt
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        const displayRegs = activeTab === 'all' ? sortedRegs : sortedRegs.filter(r => (r.additionalPaymentRequired || 0) > 0);

        return (
          <div className="py-4 h-full flex flex-col">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Danh sách sổ lệnh IPO</h2>
                <button 
                  onClick={() => setShowStatusHelp(!showStatusHelp)}
                  className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-all"
                >
                  <Info size={14} />
                  Giải thích trạng thái
                </button>
              </div>

              <AnimatePresence>
                {showStatusHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-gray-900 text-white rounded-3xl p-6 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                          <Info size={18} />
                        </div>
                        Ý nghĩa các trạng thái
                      </h3>
                      
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <div className="w-1 h-3 bg-orange-500 rounded-full" />
                             I. Giai đoạn nộp cọc
                          </h4>
                          <div className="space-y-4">
                             {Object.entries(STATUS_DEFINITIONS).filter(([_, def]) => def.stage === 'I. Giai đoạn nộp cọc').map(([key, def]) => (
                               <div key={key} className="flex gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${def.color.split(' ')[0]}`} />
                                  <div className="flex-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{def.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase opacity-80">{def.desc}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <div className="w-1 h-3 bg-blue-500 rounded-full" />
                             II. Giai đoạn nộp tiền
                          </h4>
                          <div className="space-y-4">
                             {Object.entries(STATUS_DEFINITIONS).filter(([_, def]) => def.stage === 'II. Giai đoạn nộp tiền').map(([key, def]) => (
                               <div key={key} className="flex gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${def.color.split(' ')[0]}`} />
                                  <div className="flex-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{def.label}</p>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase opacity-80">{def.desc}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowStatusHelp(false)}
                        className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                      >
                        Đóng giải thích
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${activeTab === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setActiveTab('pending_payment')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${activeTab === 'pending_payment' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  Chờ thanh toán ({filteredRegs.filter(r => (r.additionalPaymentRequired || 0) > 0).length})
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text"
                  value={profileSearch}
                  onChange={(e) => setProfileSearch(e.target.value)}
                  placeholder="Tìm theo mã chứng khoán hoặc tên KH..."
                  className="w-full bg-gray-100 border border-transparent rounded-2xl py-4 px-12 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
                />
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {displayRegs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-50 text-center px-6">
                  {activeTab === 'all' ? 'Không tìm thấy kết quả' : 'Không có lệnh nào đang chờ thanh toán'}
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                {displayRegs.map(reg => {
                  const ipo = MOCK_IPOS.find(i => i.id === reg.eventId);
                  const isAllocated = reg.allocatedVolume !== undefined;
                  const hasAllocation = (reg.allocatedVolume || 0) > 0;
                  
                  return (
                        <div key={reg.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          {isAllocated && (
                            <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${hasAllocation ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                              {hasAllocation ? 'Đã phân bổ' : 'Không trúng lẻ'}
                            </div>
                          )}

                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${hasAllocation ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                              <FileCheck size={24} />
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black text-white bg-blue-600 px-2 py-0.5 rounded uppercase tracking-widest">
                                    {ipo?.stockCode}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                                    STATUS_DEFINITIONS[reg.status]?.color || 'bg-gray-50 text-gray-400'
                                  }`}>
                                    {STATUS_DEFINITIONS[reg.status]?.label || reg.status}
                                  </span>
                               </div>
                               <h4 className="font-black text-gray-900 leading-tight uppercase tracking-tight">{ipo?.issuerName}</h4>
                               <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Ngày đăng ký: {new Date(reg.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Số lượng đăng ký</p>
                              <p className="font-black text-gray-900 text-lg">{reg.volume.toLocaleString()} <span className="text-xs">CP</span></p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Giá đăng ký</p>
                              <p className="font-black text-gray-900 text-lg">{reg.price.toLocaleString()} <span className="text-xs">đ</span></p>
                            </div>
                          </div>

                          {isAllocated && (
                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-4">
                              <h5 className="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                                <Info size={14} />
                                Kết quả phân bổ chi tiết
                              </h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white/60 p-2 rounded-xl">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase">SL Phân bổ:</span>
                                  <span className={`text-sm font-black ${hasAllocation ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {reg.allocatedVolume?.toLocaleString() || 0} CP
                                  </span>
                                </div>
                                
                                {reg.refundAmount ? (
                                  <div className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/30">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Tiền hoàn lại:</span>
                                    <span className="text-sm font-black text-emerald-700">
                                      {reg.refundAmount.toLocaleString()} đ
                                    </span>
                                  </div>
                                ) : reg.additionalPaymentRequired ? (
                                  <div className="flex justify-between items-center bg-red-50/50 p-2 rounded-xl border border-red-100/30">
                                    <span className="text-[10px] font-bold text-red-600 uppercase">Nộp thêm:</span>
                                    <span className="text-sm font-black text-red-700">
                                      {reg.additionalPaymentRequired.toLocaleString()} đ
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Trạng thái:</span>
                                    <span className="text-[10px] font-bold text-gray-500">Đã quyết toán</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const ipo = MOCK_IPOS.find(i => i.id === reg.eventId);
                                if (ipo) {
                                  setSelectedIpo(ipo);
                                  setSelectedReg(reg);
                                  setCurrentStep('allocation_details');
                                }
                              }}
                              className="flex-1 mb-3 py-4 bg-orange-50 hover:bg-orange-100 rounded-2xl text-[10px] font-black text-orange-600 transition-all uppercase tracking-[0.2em] border border-orange-100"
                            >
                              Phân bổ & Thanh toán
                            </button>
                            
                            {!isAllocated && (
                              <button 
                                onClick={() => {
                                  const updatedReg: Registration = {
                                    ...reg,
                                    status: RegistrationStatus.WAITING_PAYMENT,
                                    allocatedVolume: Math.floor(reg.volume * 0.8),
                                    allocatedPrice: reg.price,
                                    totalPaid: reg.volume * reg.price * 0.1,
                                    additionalPaymentRequired: (Math.floor(reg.volume * 0.8) * reg.price) - (reg.volume * reg.price * 0.1)
                                  };
                                  setRegistrations(registrations.map(r => r.id === reg.id ? updatedReg : r));
                                  alert('Đã giả lập phân bổ thành công!');
                                }}
                                className="px-4 mb-3 bg-gray-900 rounded-2xl text-white flex items-center justify-center transition-all active:scale-95"
                                title="Giả lập phân bổ"
                              >
                                <PlayCircle size={18} />
                              </button>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              setSelectedReg(reg);
                              setSelectedIpo(ipo!);
                              setCurrentStep('success');
                            }}
                            className="w-full py-4 bg-gray-50 hover:bg-blue-50 rounded-2xl text-[10px] font-black text-gray-400 hover:text-blue-600 transition-all uppercase tracking-[0.2em] border border-gray-100"
                          >
                            Chi tiết tiến độ & hồ sơ
                          </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'details':
        if (!selectedIpo) return null;
        return (
          <div className="py-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                <FileCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 uppercase">{selectedIpo.issuerName}</h2>
              <p className="text-sm text-gray-500 mt-1">{selectedIpo.offerType}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                 <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                   <Info size={16} className="text-blue-500" />
                   Thông tin đợt phát hành
                 </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Hình thức</span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedIpo.eventType === EventType.AUCTION ? 'Đấu giá' : 
                     selectedIpo.eventType === EventType.BOOK_BUILDING ? 'Dựng sổ' : 'Giá cố định'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Mệnh giá</span>
                  <span className="text-sm font-bold text-gray-900">{selectedIpo.parValue.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Số lượng chào bán</span>
                  <span className="text-sm font-bold text-gray-900">{selectedIpo.totalVolume.toLocaleString()} CP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Giá khởi điểm</span>
                  <span className="text-sm font-bold text-orange-600">{selectedIpo.minPrice.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Bước giá</span>
                  <span className="text-sm font-bold text-gray-900">{selectedIpo.priceStep.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Bước khối lượng</span>
                  <span className="text-sm font-bold text-gray-900">{selectedIpo.volumeStep.toLocaleString()} CP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tỷ lệ đặt cọc</span>
                  <span className="text-sm font-bold text-gray-900">{(selectedIpo.depositRate * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4">
              <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Thời gian đăng ký & đặt cọc</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-orange-600 font-bold">BẮT ĐẦU</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedIpo.startTime).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="w-px h-8 bg-orange-200" />
                <div className="flex-1">
                  <p className="text-[10px] text-orange-600 font-bold">KẾT THÚC</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedIpo.endTime).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Lịch trình thanh toán & Hoàn cọc</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] text-blue-600 font-bold uppercase">Thời gian nộp tiền mua</p>
                   <p className="text-xs font-bold text-gray-900">
                     {new Date(selectedIpo.paymentStartTime).toLocaleDateString('vi-VN')} - {new Date(selectedIpo.paymentEndTime).toLocaleDateString('vi-VN')}
                   </p>
                </div>
                <div className="h-px bg-blue-100 w-full" />
                <div className="flex justify-between items-center">
                   <p className="text-[10px] text-blue-600 font-bold uppercase">Thời gian hoàn cọc</p>
                   <p className="text-xs font-bold text-gray-900">
                     Dự kiến {new Date(selectedIpo.refundTime).toLocaleDateString('vi-VN')}
                   </p>
                </div>
              </div>
            </div>

            <button 
              onClick={goToForm}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all text-lg"
            >
              Đăng ký mua
            </button>
          </div>
        );

      case 'form':
        if (!selectedIpo) return null;
        return (
          <div className="py-4 h-full flex flex-col">
            <RegistrationStepper currentStep={1} />
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1 text-center">Thông tin đăng ký</h2>
            
            <div className="space-y-5 mb-8 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Hình thức thanh toán cọc</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFormData({...formData, depositMethod: 'STOCK_ACCOUNT'})}
                    className={`p-3 rounded-xl border-2 text-[10px] font-bold flex flex-col items-center gap-2 transition-all ${
                      formData.depositMethod === 'STOCK_ACCOUNT' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    TK Chứng khoán
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, depositMethod: 'BANK_TRANSFER'})}
                    className={`p-3 rounded-xl border-2 text-[10px] font-bold flex flex-col items-center gap-2 transition-all ${
                      formData.depositMethod === 'BANK_TRANSFER' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    Chuyển khoản NH
                  </button>
                </div>
              </div>

              {/* Security Account Selection */}
              {formData.depositMethod === 'STOCK_ACCOUNT' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Số tài khoản chứng khoán</label>
                  <div className="relative group">
                    <select 
                      value={formData.stockAccount}
                      onChange={(e) => setFormData({...formData, stockAccount: e.target.value})}
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="0123456789">0123456789</option>
                      <option value="9876543210">9876543210</option>
                      <option value="1122334455">1122334455</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium">Chọn tài khoản chứng khoán 10 số của bạn để thực hiện phân bổ</p>
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Số lượng đăng ký</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData.volume?.toLocaleString('vi-VN') || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\./g, '');
                      if (!isNaN(Number(val))) {
                        setFormData({...formData, volume: Number(val)});
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="VD: 100"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">Cổ phiếu</div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Tối thiểu: {selectedIpo.minVolume.toLocaleString()} - Tối đa: {selectedIpo.maxVolume.toLocaleString()} - Bước: {selectedIpo.volumeStep} CP</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Giá đăng ký (VNĐ)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData.price?.toLocaleString('vi-VN') || ''}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-4 font-bold text-lg text-gray-500 focus:outline-none cursor-not-allowed transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 uppercase">VNĐ</div>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-[10px] text-gray-400 font-medium">Giá tối thiểu: {selectedIpo.minPrice.toLocaleString()} đ</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase">Bước giá: {selectedIpo.priceStep.toLocaleString()} đ</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase">Tổng giá trị đăng ký</span>
                  <span className="text-lg font-bold text-gray-900">{((formData.volume || 0) * (formData.price || 0)).toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Tiền cọc cần nộp ({(selectedIpo.depositRate * 100).toFixed(0)}%)</span>
                  <span className="text-lg font-bold text-orange-600">{((formData.volume || 0) * (formData.price || 0) * selectedIpo.depositRate).toLocaleString()} đ</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedRefundInfo(!expandedRefundInfo)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h4 className="text-xs font-black text-gray-900 uppercase flex items-center gap-2">
                     <div className="w-1 h-3 bg-orange-500 rounded-full" />
                     Thông tin nhận tiền hoàn cọc
                  </h4>
                  {expandedRefundInfo ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                
                <AnimatePresence>
                  {expandedRefundInfo && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Chọn tài khoản lưu sẵn</label>
                          <div className="relative group">
                            <select 
                              onChange={(e) => {
                                const selected = MOCK_BANK_ACCOUNTS.find(a => a.accountNumber === e.target.value);
                                if (selected) {
                                  setFormData({
                                    ...formData, 
                                    refundBankInfo: {
                                      bankName: selected.bankName,
                                      accountNumber: selected.accountNumber,
                                      accountName: selected.accountName
                                    }
                                  });
                                }
                              }}
                              className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                              value={formData.refundBankInfo?.accountNumber || ''}
                            >
                              <option value="" disabled>--- Chọn tài khoản ---</option>
                              {MOCK_BANK_ACCOUNTS.map((acc, idx) => (
                                <option key={idx} value={acc.accountNumber}>
                                  {acc.bankName} - {acc.accountNumber}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>

                        <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-gray-100"></div>
                          <span className="flex-shrink mx-4 text-[8px] font-bold text-gray-300 uppercase tracking-widest">Hoặc nhập thủ công</span>
                          <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Ngân hàng</label>
                          <input 
                            type="text"
                            value={formData.refundBankInfo?.bankName || ''}
                            onChange={(e) => setFormData({...formData, refundBankInfo: {...formData.refundBankInfo!, bankName: e.target.value}})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                            placeholder="VD: BIDV, Vietcombank..."
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Số tài khoản</label>
                          <input 
                            type="text"
                            value={formData.refundBankInfo?.accountNumber || ''}
                            onChange={(e) => setFormData({...formData, refundBankInfo: {...formData.refundBankInfo!, accountNumber: e.target.value}})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                            placeholder="Nhập số tài khoản"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Tên chủ tài khoản</label>
                          <input 
                            type="text"
                            value={formData.refundBankInfo?.accountName || ''}
                            onChange={(e) => setFormData({...formData, refundBankInfo: {...formData.refundBankInfo!, accountName: e.target.value.toUpperCase()}})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase"
                            placeholder="VD: NGUYEN VAN A"
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 leading-relaxed italic">* Số tiền cọc dư hoặc tiền không khớp lệnh sẽ được hoàn về tài khoản này theo lịch trình.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!expandedRefundInfo && (
                  <div className="px-5 pb-3">
                     <p className="text-[10px] text-gray-400 font-medium truncate">
                       {formData.refundBankInfo?.bankName || 'Chưa chọn NH'} - {formData.refundBankInfo?.accountNumber || 'Chưa nhập STK'}
                     </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Mã giới thiệu (CUSTID)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData.referralId || ''}
                    onChange={(e) => setFormData({...formData, referralId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase placeholder:text-gray-300"
                    placeholder="NHẬP MÃ GIỚI THIỆU"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium px-1">Nhập mã nhân viên hoặc mã người giới thiệu (nếu có) để được hỗ trợ tốt nhất.</p>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button 
                onClick={goToReview}
                disabled={!formData.volume || !formData.price || (formData.depositMethod === 'STOCK_ACCOUNT' && formData.stockAccount?.length !== 10) || !formData.refundBankInfo?.bankName || !formData.refundBankInfo?.accountNumber || !formData.refundBankInfo?.accountName}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all text-lg disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        );

      case 'review':
        if (!selectedIpo) return null;
        return (
          <div className="py-4 h-full flex flex-col overflow-y-auto">
            <RegistrationStepper currentStep={2} />
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-3">
                <Info size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Xác nhận thông tin hồ sơ</h2>
              <div className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổ chức phát hành</div>
              <p className="text-lg font-black text-orange-600 uppercase tracking-tight">{selectedIpo.issuerName}</p>
              <p className="text-[10px] text-gray-500 mt-1">Quý khách vui lòng rà soát kỹ các thông tin dưới đây</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-black text-orange-600 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-orange-500 rounded-full" />
                  Thông tin đăng ký
                </h4>
                <div className="space-y-2">
                  {formData.depositMethod === 'STOCK_ACCOUNT' && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">TK phân bổ CK:</span>
                      <span className="font-bold text-gray-900">{formData.stockAccount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Mã Chứng Khoán:</span>
                    <span className="font-bold text-gray-900">{selectedIpo?.stockCode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Số lượng đăng ký:</span>
                    <span className="font-bold text-gray-900">{formData.volume?.toLocaleString()} CP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Giá đăng ký:</span>
                    <span className="font-bold text-gray-900">{formData.price?.toLocaleString()} VNĐ</span>
                  </div>
                  {formData.referralId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Mã giới thiệu:</span>
                      <span className="font-bold text-orange-600 uppercase">{formData.referralId}</span>
                    </div>
                  )}
                  <div className="h-px bg-orange-100 my-1" />
                  <div className="flex justify-between items-center bg-white/50 p-2 rounded-lg border border-orange-100/50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Tiền cọc dự kiến ({(selectedIpo!.depositRate * 100)}%):</span>
                    <span className="text-sm font-black text-orange-600">{((formData.volume || 0) * (formData.price || 0) * selectedIpo!.depositRate).toLocaleString()} VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-gray-400 rounded-full" />
                  Phương thức thanh toán cọc
                </h4>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100">
                     {formData.depositMethod === 'STOCK_ACCOUNT' ? <FileText size={16} className="text-blue-500" /> : <QrCode size={16} className="text-orange-500" />}
                   </div>
                   <span className="text-xs font-bold text-gray-700">
                     {formData.depositMethod === 'STOCK_ACCOUNT' ? 'Trích nợ từ tài khoản chứng khoán' : 'Chuyển khoản vào tài khoản phong tỏa'}
                   </span>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <div className="w-1 h-3 bg-gray-400 rounded-full" />
                  TK nhận tiền hoàn cọc
                </h4>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-800">{formData.refundBankInfo?.bankName}</p>
                  <div className="flex justify-between text-[11px]">
                     <span className="text-gray-500">Số tài khoản:</span>
                     <span className="font-bold">{formData.refundBankInfo?.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                     <span className="text-gray-500">Chủ tài khoản:</span>
                     <span className="font-bold uppercase">{formData.refundBankInfo?.accountName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <button 
                onClick={goToSign}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all text-lg"
              >
                Xác nhận thông tin
              </button>
              <button 
                onClick={() => setCurrentStep('form')}
                className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                Quay lại chỉnh sửa
              </button>
            </div>
          </div>
        );

      case 'sign':
        return (
          <div className="py-4 h-full flex flex-col overflow-y-auto">
            <RegistrationStepper currentStep={3} />
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-4">
                <FileCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ký hồ sơ đăng ký</h2>
              <p className="text-sm text-gray-500 mt-2 italic px-4">
                Bằng việc thực hiện chữ ký số, quý khách cam kết các thông tin đã khai báo là chính xác.
              </p>
            </div>

            <div className="bg-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative mb-12 shadow-inner">
                <div className="w-full h-48 bg-white shadow-lg flex items-center justify-center relative touch-none rounded-2xl">
                  <motion.div 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    className="w-3/4"
                  >
                    <svg viewBox="0 0 100 40" className="w-full">
                      <motion.path 
                        d="M10,20 C30,5 50,35 90,15" 
                        fill="none" 
                        stroke="blue" 
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </svg>
                  </motion.div>
                </div>
                <p className="mt-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] text-center">Ký tên điện tử tại đây</p>
            </div>

            <div className="space-y-3 mt-auto">
              <button 
                onClick={handleSign}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all text-lg"
              >
                Ký và hoàn tất
              </button>
              <button 
                onClick={() => setCurrentStep('review')}
                className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                Quay lại xem thông tin
              </button>
            </div>
          </div>
        );

      case 'payment':
        if (!selectedIpo) return null;
        const depositAmount = (formData.volume || 0) * (formData.price || 0) * selectedIpo.depositRate;
        
        return (
          <div className="py-4 h-full flex flex-col overflow-y-auto">
            <RegistrationStepper currentStep={4} />
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Nộp tiền đặt cọc</h2>
              <p className="text-sm text-gray-500 mt-1">Vui lòng nộp số tiền cọc để hoàn tất hồ sơ</p>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-3xl p-5 mb-6">
              <h4 className="text-[10px] font-black text-orange-600 uppercase mb-4 tracking-widest text-center">CHI TIẾT LỆNH THANH TOÁN</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Mã Chứng Khoán:</span>
                  <span className="font-bold text-gray-900">{selectedIpo.stockCode}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Số lượng:</span>
                  <span className="font-bold text-gray-900">{formData.volume?.toLocaleString()} CP</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Giá:</span>
                  <span className="font-bold text-gray-900">{formData.price?.toLocaleString()} VNĐ</span>
                </div>
                <div className="h-px bg-orange-100 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase">Tiền cọc cần nộp:</span>
                  <span className="text-lg font-black text-orange-600">{depositAmount.toLocaleString()} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-orange-500 rounded-3xl p-6 mb-8 flex flex-col items-center">
              <p className="text-[10px] font-black text-orange-600 uppercase mb-4 tracking-widest bg-orange-50 px-4 py-1 rounded-full border border-orange-100">TÀI KHOẢN PHONG TỎA NHẬN TIỀN</p>
              
              <div className="bg-white p-4 rounded-2xl shadow-xl mb-6 ring-4 ring-orange-50">
                <QrCode size={180} className="text-gray-900" />
              </div>

              <div className="w-full space-y-3 bg-gray-50 p-4 rounded-2xl text-xs font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-gray-900">{APP_CONFIG.ACCOUNT_HOLDER}</span>
                </div>
                <div className="flex justify-between items-center group/item hover:bg-white transition-colors p-1 rounded">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{APP_CONFIG.BANK_ACCOUNT}</span>
                    <button className="text-orange-500 hover:text-orange-600">
                      <FileText size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Ngân hàng:</span>
                  <span className="font-bold text-gray-900 text-right max-w-[150px]">{APP_CONFIG.BANK_NAME}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={handlePaymentConfirm}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                Tôi đã nộp tiền
              </button>
              <p className="text-center text-[10px] text-gray-400 px-4 leading-relaxed">Sau khi nộp tiền thành công, hệ thống sẽ tự động cập nhật trạng thái hồ sơ của bạn trong vòng 5-10 phút.</p>
            </div>
          </div>
        );

      case 'allocation_details':
        if (!selectedReg || !selectedIpo) return null;
        return (
          <AllocationDetailsScreen 
            registration={selectedReg} 
            ipo={selectedIpo} 
            onBack={() => setCurrentStep('profile')} 
            onPay={() => setCurrentStep('remaining_payment')}
          />
        );

      case 'remaining_payment':
          if (!selectedIpo || !selectedReg) return null;
          const remainingAmount = selectedReg.additionalPaymentRequired || 0;
          const allocatedVal = (selectedReg.allocatedVolume || 0) * (selectedReg.allocatedPrice || selectedIpo.minPrice);
          const paidCọc = selectedReg.totalPaid || 0;
          
          return (
            <div className="py-4 h-full flex flex-col overflow-y-auto">
              <div className="text-center mb-8">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Thanh toán nộp thêm</h2>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang chờ hoàn tất nghĩa vụ tài chính</p>
                </div>
              </div>
  
              <div className="bg-orange-600 rounded-3xl p-8 mb-8 text-center shadow-xl shadow-orange-100 relative overflow-hidden group">
                <motion.div 
                  initial={{ rotate: 0, opacity: 0.1 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-16 -right-16 w-48 h-48 bg-white rounded-full pointer-events-none" 
                />
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 relative z-10 italic">Nộp thêm = {allocatedVal.toLocaleString()} - {paidCọc.toLocaleString()}</p>
                <div className="flex flex-col items-center relative z-10">
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Số tiền cần nộp chính xác</p>
                  <h3 className="text-3xl font-black text-white">{remainingAmount.toLocaleString()} VNĐ</h3>
                </div>
              </div>

              {/* Payment Method Toggle */}
              <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                <button 
                  onClick={() => setPaymentMethod('account')}
                  className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'account' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>TK Chứng khoán</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'qr' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400'
                  }`}
                >
                  <QrCode size={16} />
                  <span>Mã QR</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('manual')}
                  className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 ${
                    paymentMethod === 'manual' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400'
                  }`}
                >
                  <FileText size={16} />
                  <span>Chuyển khoản</span>
                </button>
              </div>
  
              {paymentMethod === 'account' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase">Trích nợ tự động</h4>
                      <p className="text-[9px] text-gray-500 font-medium leading-none mt-1 uppercase tracking-wider">Tài khoản: {selectedReg.stockAccount || '0123456789'}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed mb-6 italic">
                    Hệ thống sẽ tự động hoàn tất thanh toán {remainingAmount.toLocaleString()} VNĐ bằng số dư trong tài khoản chứng khoán của bạn. 
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-blue-50">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Số dư khả dụng ước tính</p>
                    <p className="text-sm font-black text-emerald-600">{(remainingAmount * 1.5).toLocaleString()} VNĐ</p>
                  </div>
                </motion.div>
              ) : paymentMethod === 'qr' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center mb-8 hover:border-orange-200 transition-colors"
                >
                  <div className="w-48 h-48 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 p-2 shadow-inner relative">
                    <QrCode size={140} className="text-gray-900" />
                    <div className="absolute inset-0 bg-orange-600/5 opacity-0 hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <Search className="text-orange-600" size={32} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                    Quét mã QR để tự động điền <br /> thông tin & nội dung <span className="text-orange-600">THANHTOAN</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm"
                >
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest border-b border-gray-200 pb-3 flex items-center gap-2 font-mono">
                    <FileText size={14} className="text-orange-500" />
                    Chi tiết tài khoản nộp tiền
                  </h4>
                  <div className="space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ngân hàng hưởng</p>
                        <p className="text-sm font-black text-gray-900 tracking-tight">BIDV - CN TP.HCM</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                         <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Số tài khoản</p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                        <p className="text-sm font-black text-orange-600 tracking-widest">12010006789456</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('12010006789456');
                            alert('Đã sao chép số tài khoản');
                          }}
                          className="text-orange-500 hover:text-orange-600 active:scale-90 transition-all p-1"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tên tài khoản</p>
                      <p className="text-sm font-black text-gray-900 tracking-tight uppercase underline decoration-orange-200 decoration-2">VIETCAP SECURITIES - IPO {selectedIpo.stockCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 italic">Nội dung chuyển khoản (bắt buộc)</p>
                      <div className="flex gap-2">
                        <p className="flex-1 text-[11px] font-black text-blue-600 bg-blue-50 p-4 rounded-xl border border-blue-100 leading-tight select-all">
                          IPO_{selectedIpo.stockCode}_{selectedReg.id.slice(-6).toUpperCase()}_THANHTOAN
                        </p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`IPO_${selectedIpo.stockCode}_${selectedReg.id.slice(-6).toUpperCase()}_THANHTOAN`);
                            alert('Đã sao chép nội dung');
                          }}
                          className="text-blue-500 hover:text-blue-600 active:scale-90 transition-all self-center px-2"
                        >
                          <FileText size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
  
              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => {
                    const updatedReg: Registration = { 
                      ...selectedReg, 
                      additionalPaymentRequired: 0, 
                      status: RegistrationStatus.PAYMENT_SUBMITTED,
                      depositMethod: paymentMethod === 'account' ? 'STOCK_ACCOUNT' : 'BANK_TRANSFER'
                    };
                    setRegistrations(registrations.map(r => r.id === selectedReg.id ? updatedReg : r));
                    setSelectedReg(updatedReg);
                    setCurrentStep('success');
                  }}
                  className={`w-full py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-sm ${
                    paymentMethod === 'account' ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-orange-600 shadow-orange-100 hover:bg-orange-700'
                  } text-white`}
                >
                  {paymentMethod === 'account' ? 'Nộp tiền từ TK Chứng khoán' : 'Xác nhận tôi đã chuyển khoản'}
                </button>
                <button 
                  onClick={() => setCurrentStep('allocation_details')}
                  className="w-full py-4 text-gray-400 font-bold hover:bg-gray-100 rounded-xl transition-all text-[10px] uppercase tracking-widest"
                >
                  Quay lại kết quả phân bổ
                </button>
              </div>
            </div>
          );

      case 'success':
        const completedReg = selectedReg || registrations[registrations.length - 1];
        if (!completedReg || !selectedIpo) return null;
        
        return (
          <SuccessScreen 
            registration={completedReg} 
            ipo={selectedIpo} 
            onDone={() => setCurrentStep('home')} 
            onViewAllocation={() => {
              setSelectedReg(completedReg);
              setCurrentStep('allocation_details');
            }}
            onUpdateMethod={(id, method) => {
              const updatedRegs = registrations.map(r => r.id === id ? { ...r, depositMethod: method } : r);
              setRegistrations(updatedRegs);
              const updatedReg = updatedRegs.find(r => r.id === id);
              if (updatedReg) {
                setSelectedReg(updatedReg);
              }
            }}
          />
        );

      case 'company_info':
        if (!infoIpo) return null;
        return (
          <CompanyInfoScreen 
            ipo={infoIpo} 
            onBack={() => setCurrentStep('home')} 
            onRegister={() => {
              handleSelectIpo(infoIpo);
            }} 
          />
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 'home': return 'Danh mục IPO';
      case 'profile': return 'Danh sách sổ lệnh IPO';
      case 'details': return 'Thông tin IPO';
      case 'company_info': return 'Hồ sơ doanh nghiệp';
      case 'form': return 'Đăng ký mua';
      case 'review': return 'Xác nhận';
      case 'allocation_details': return 'Kết quả phân bổ';
      case 'remaining_payment': return 'Thanh toán nộp thêm';
      case 'sign': return 'Ký hồ sơ';
      case 'payment': return 'Thanh toán';
      case 'success': return 'Hoàn thành';
      default: return 'IPO';
    }
  };

  const handleBack = () => {
    if (currentStep === 'details') setCurrentStep('home');
    if (currentStep === 'company_info') setCurrentStep('home');
    if (currentStep === 'form') setCurrentStep('details');
    if (currentStep === 'review') setCurrentStep('form');
    if (currentStep === 'sign') setCurrentStep('review');
    if (currentStep === 'allocation_details') setCurrentStep('profile');
    if (currentStep === 'remaining_payment') setCurrentStep('allocation_details');
    if (currentStep === 'payment') setCurrentStep('sign');
  };

  return (
    <MobileFrame 
      title={getTitle()} 
      onBack={currentStep === 'home' || currentStep === 'success' || currentStep === 'profile' ? undefined : handleBack}
      rightAction={currentStep === 'home' && <History className="text-gray-400" size={24} onClick={() => setCurrentStep('profile')} />}
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={currentStep}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.2 }}
           className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </MobileFrame>
  );
}
