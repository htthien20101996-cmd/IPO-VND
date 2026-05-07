import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MOCK_IPOS, APP_CONFIG } from './constants';
import { IPOEvent, Registration, RegistrationStatus, EventType, IPODocument } from './types';

// Components
const DocumentCard = ({ doc }: { doc: IPODocument }) => (
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

const IPOListItem = ({ ipo, onSelect }: { ipo: IPOEvent, onSelect: (ipo: IPOEvent) => void, key?: string }) => {
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
      className={`bg-white border border-gray-100 p-4 rounded-2xl mb-4 shadow-sm transition-all ${statusLabel !== "Đã kết thúc" ? 'hover:border-orange-200 cursor-pointer group' : 'opacity-70 group'}`}
    >
      <div className="flex justify-between items-start mb-2">
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
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ipo.securityType === 'STOCK' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {ipo.securityType}
        </span>
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
      
      {statusLabel !== "Đã kết thúc" && (
        <div className="mt-3 flex items-center justify-end text-orange-500 font-bold text-xs gap-1 group-hover:translate-x-1 transition-transform">
          {statusLabel === "Sắp diễn ra" ? "Xem chi tiết" : "Đăng ký ngay"} <ChevronRight size={16} />
        </div>
      )}
      
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

const SuccessScreen = ({ registration, ipo, onDone, onViewAllocation }: { registration: Registration, ipo: IPOEvent, onDone: () => void, onViewAllocation: () => void }) => {
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  
  if (!registration || !ipo) return null;

  const depositAmount = registration.volume * registration.price * ipo.depositRate;
  const isStockAccount = registration.depositMethod === 'STOCK_ACCOUNT';
  const isFullyPaid = (registration.additionalPaymentRequired || 0) === 0 && registration.status === RegistrationStatus.COMPLETED;

  const steps = [
    { label: 'Đăng ký thành công', status: 'completed', desc: 'Hệ thống đã tiếp nhận hồ sơ hợp lệ' },
    { label: 'Xác nhận chữ ký số', status: 'completed', desc: 'Đã hoàn tất ký hợp đồng điện tử' },
    { label: 'Nộp tiền cọc', status: registration.status === RegistrationStatus.DEPOSITED || isStockAccount || registration.status === RegistrationStatus.COMPLETED || registration.status === RegistrationStatus.ALLOCATED ? 'completed' : 'active', desc: isStockAccount ? 'Tự động trích nợ từ tài khoản chứng khoán' : 'Vui lòng hoàn tất chuyển khoản' },
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
            {registration.referralCode && (
              <div className="absolute top-0 right-0 p-1">
                <div className="bg-white/20 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-bl-lg backdrop-blur-sm">
                  Ref: {registration.referralCode}
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

export default function App() {
  const [currentStep, setCurrentStep] = useState<'home' | 'details' | 'form' | 'review' | 'sign' | 'payment' | 'success' | 'profile' | 'allocation_details' | 'remaining_payment'>('home');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [selectedIpo, setSelectedIpo] = useState<IPOEvent | null>(null);
  const [formData, setFormData] = useState<Partial<Registration>>({
    volume: 100,
    price: 32000,
    depositMethod: 'STOCK_ACCOUNT',
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
      status: RegistrationStatus.COMPLETED,
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
      status: RegistrationStatus.ALLOCATED,
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
      status: RegistrationStatus.ALLOCATED,
      createdAt: '2026-04-25T10:00:00Z',
      allocatedVolume: 1000,
      allocatedPrice: 32000,
      totalPaid: 3200000,
      additionalPaymentRequired: 28800000,
    }
  ]);
  const [profileSearch, setProfileSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending_payment'>('all');
  const [expandedQuarterly, setExpandedQuarterly] = useState(false);
  const [expandedMonthly, setExpandedMonthly] = useState(false);
  const [expandedRefundInfo, setExpandedRefundInfo] = useState(false);

  const handleSelectIpo = (ipo: IPOEvent) => {
    setSelectedIpo(ipo);
    setFormData({
       volume: ipo.minVolume,
       price: ipo.minPrice,
       depositMethod: 'STOCK_ACCOUNT',
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
        status: RegistrationStatus.PENDING,
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
      status: RegistrationStatus.DEPOSITED,
      createdAt: new Date().toISOString(),
      signedAt: new Date().toISOString(),
      depositedAt: new Date().toISOString(),
    };
    setRegistrations([...registrations, newReg]);
    setCurrentStep('success');
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'home':
        const pendingPaymentCount = registrations.filter(r => (r.additionalPaymentRequired || 0) > 0).length;
        
        return (
          <div className="py-2">
             {pendingPaymentCount > 0 && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={() => {
                   setActiveTab('pending_payment');
                   setCurrentStep('profile');
                 }}
                 className="mb-6 bg-gradient-to-r from-orange-600 to-orange-500 p-4 rounded-3xl shadow-lg shadow-orange-100 flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition-all"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                     <AlertCircle size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1">Cảnh báo thanh toán</p>
                     <p className="text-sm font-black text-white leading-tight">Bạn có {pendingPaymentCount} lệnh chờ nộp tiền</p>
                   </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                   <ChevronRight size={20} />
                 </div>
               </motion.div>
             )}
             
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Các sự kiện IPO hiện có</h2>
             {MOCK_IPOS.map(ipo => (
               <IPOListItem key={ipo.id} ipo={ipo} onSelect={handleSelectIpo} />
             ))}
          </div>
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

        const displayRegs = activeTab === 'all' ? filteredRegs : filteredRegs.filter(r => (r.additionalPaymentRequired || 0) > 0);

        return (
          <div className="py-4 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Danh sách sổ lệnh IPO</h2>
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
                                    reg.status === RegistrationStatus.COMPLETED ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                  }`}>
                                    {reg.status}
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
                                    status: RegistrationStatus.ALLOCATED,
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
                    onChange={(e) => {
                      const val = e.target.value.replace(/\./g, '');
                      if (!isNaN(Number(val))) {
                        setFormData({...formData, price: Number(val)});
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Nhập giá"
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

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Mã giới thiệu (nếu có)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={formData.referralId || ''}
                    onChange={(e) => setFormData({...formData, referralId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase placeholder:text-gray-300"
                    placeholder="NHẬP MÃ CUSTID"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Nhập mã nhân viên hoặc mã người giới thiệu để được hỗ trợ tốt nhất.</p>
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
            </div>

            <div className="mt-auto pt-6">
              <button 
                onClick={goToReview}
                disabled={!formData.volume || !formData.price || !formData.refundBankInfo?.bankName || !formData.refundBankInfo?.accountNumber || !formData.refundBankInfo?.accountName}
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
                  {formData.referralCode && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Mã giới thiệu:</span>
                      <span className="font-bold text-orange-600">{formData.referralCode}</span>
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
  
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center mb-8 hover:border-orange-200 transition-colors">
                <div className="w-48 h-48 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 p-2 shadow-inner relative">
                  <QrCode size={140} className="text-gray-900" />
                  <div className="absolute inset-0 bg-orange-600/5 opacity-0 hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <Search className="text-orange-600" size={32} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                  Quét mã QR để tự động điền <br /> thông tin & nội dung <span className="text-orange-600">THANHTOAN</span>
                </p>
              </div>
  
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
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
              </div>
  
              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => {
                    const updatedReg: Registration = { ...selectedReg, additionalPaymentRequired: 0, status: RegistrationStatus.COMPLETED };
                    setRegistrations(registrations.map(r => r.id === selectedReg.id ? updatedReg : r));
                    setSelectedReg(updatedReg);
                    setCurrentStep('success');
                  }}
                  className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
                >
                  Xác nhận tôi đã chuyển khoản
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
