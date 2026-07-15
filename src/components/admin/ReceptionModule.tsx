import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Plus,
  Search,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  Wrench,
  X,
  Phone,
  Tag,
  Sparkles,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { OrderStatusView, WoStatus } from "../../types/workOrder.types";
import { Booth, Service } from "../../types/order.types";
import { simActions } from "../../lib/supabase/client";
import { SERVICES_CATALOG, ADDONS_CATALOG } from "../../lib/services";

interface ReceptionModuleProps {
  orders: OrderStatusView[];
  booths: Booth[];
  staff: any[];
}

export default function ReceptionModule({ orders, booths, staff }: ReceptionModuleProps) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderStatusView | null>(null);
  const [showDispatchDrawer, setShowDispatchDrawer] = useState(false);
  
  // Quick Dispatch state
  const [selectedWoId, setSelectedWoId] = useState<string | null>(null);
  const [dispatchBoothId, setDispatchBoothId] = useState("");
  const [dispatchTechId, setDispatchTechId] = useState("");

  // Check-In Form State
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [segment, setSegment] = useState<'sedan' | 'suv' | 'truck'>('sedan');
  const [selectedPkg, setSelectedPkg] = useState<Service>(SERVICES_CATALOG[1]); // Default W1
  const [selectedAddons, setSelectedAddons] = useState<Service[]>([]);
  const [condition, setCondition] = useState<string>("Sạch sẽ bình thường");
  const [customEta, setCustomEta] = useState("30"); // Estimated minutes
  const [searchQuery, setSearchQuery] = useState("");

  // Customer Notes/Complaint States
  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState<"standard" | "complaint" | "technical">("standard");
  const [alertTelegramSent, setAlertTelegramSent] = useState(false);

  // Search filter
  const filteredOrders = orders.filter(
    o =>
      o.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.includes(searchQuery)) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAddon = (addon: Service) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  // Auto-fill customer from database if phone matches
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const existingCust = simActions.getCustomers().find(c => c.phone === val);
    if (existingCust) {
      setName(existingCust.name);
      setPlate(existingCust.licensePlate || "");
    }
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate) return;

    const subtotal = selectedPkg.price + selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const total = subtotal; // No discount initially

    const res = simActions.createOrder({
      customerPhone: phone || undefined,
      customerName: name || undefined,
      licensePlate: plate.toUpperCase(),
      vehicleSegment: segment,
      packageCode: selectedPkg.code,
      subtotal,
      discount: 0,
      total,
    });

    // Reset Form
    setPhone("");
    setName("");
    setPlate("");
    setSegment("sedan");
    setSelectedPkg(SERVICES_CATALOG[1]);
    setSelectedAddons([]);
    setCondition("Sạch sẽ bình thường");
    setCustomEta("30");
    setShowCheckInModal(false);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWoId && dispatchTechId && dispatchBoothId) {
      simActions.assignWorkOrder(selectedWoId, dispatchTechId, dispatchBoothId);
      setSelectedWoId(null);
      setDispatchBoothId("");
      setDispatchTechId("");
      setShowDispatchDrawer(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !noteText) return;

    // Simulate note attachment or direct UI feedback
    if (noteTag === "complaint") {
      setAlertTelegramSent(true);
      setTimeout(() => setAlertTelegramSent(false), 5000);
    }

    // Reset
    setNoteText("");
  };

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & QUICK CHECKIN BUTTON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black font-display text-matte-black uppercase tracking-tight">TIẾP NHẬN & ĐIỀU PHỐI (RECEPTION DESK)</h1>
          <p className="text-mid-gray text-xs mt-1 font-sans">
            Thực hiện check-in xe cực nhanh (dưới 45s) và phân bổ công việc tối ưu cho kỹ thuật viên
          </p>
        </div>

        <button
          onClick={() => setShowCheckInModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-green hover:bg-brand-green-hover text-matte-black text-xs font-extrabold font-display uppercase transition shadow-md shadow-brand-green/15 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          TIẾP NHẬN XE MỚI (CHECK-IN)
        </button>
      </div>

      {/* TELEGRAM ALERTS SIMULATION */}
      {alertTelegramSent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-red-500 text-white p-4.5 rounded-2xl flex items-start gap-3 shadow-lg"
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0 animate-bounce mt-0.5" />
          <div>
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider">⚠️ CẢNH BÁO TELEGRAM ĐÃ BẮN KHẨN CẤP</h4>
            <p className="text-xs opacity-90 mt-0.5 font-sans">
              Hệ thống WASSUP OS vừa kích hoạt Webhook và bắn thông tin khiếu nại của xe <strong>{selectedOrder?.licensePlate}</strong> trực tiếp tới Master Admin: <em>"Khiếu nại: {noteText}"</em>.
            </p>
          </div>
        </motion.div>
      )}

      {/* SECTION: YÊU CẦU XIN GIA HẠN THỜI GIAN (ETA EXTENSIONS EMERGENCY) */}
      {orders.some(o => o.etaExtensionRequest?.status === 'pending') && (
        <div className="bg-red-50 border-2 border-red-500/30 p-5 rounded-2xl shadow-md space-y-3 animate-pulse-slow">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5 text-red-600 animate-bounce" />
            <h3 className="text-sm font-black font-display tracking-wider uppercase">
              🚨 CẢNH BÁO KHẨN: YÊU CẦU XIN GIA HẠN THI CÔNG (ETA REQUESTS)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.filter(o => o.etaExtensionRequest?.status === 'pending').map(wo => (
              <div key={wo.id} className="bg-white border border-red-200 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-red-600 tracking-wider bg-red-100 px-2 py-0.5 rounded">
                      {wo.licensePlate}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase font-sans font-bold">
                      ({wo.vehicleSegment})
                    </span>
                  </div>
                  <div className="text-[11px] text-matte-black font-sans">
                    KTV: <strong>{wo.technicianName}</strong> ({wo.boothName})
                  </div>
                  <div className="text-[10px] text-stone-500 font-sans">
                    Lý do: <span className="italic text-red-600 font-semibold">"{wo.etaExtensionRequest?.reason}"</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-800">
                    Thời gian xin thêm: <span className="text-amber-600 text-xs font-black font-display">+{wo.etaExtensionRequest?.minutes} Phút</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => simActions.resolveEtaExtension(wo.id, 'approve')}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] font-display uppercase tracking-wider cursor-pointer border-0 shadow-sm"
                  >
                    👍 ĐỒNG Ý
                  </button>
                  <button
                    onClick={() => simActions.resolveEtaExtension(wo.id, 'reject')}
                    className="px-3.5 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-extrabold text-[10px] font-display uppercase tracking-wider cursor-pointer border-0"
                  >
                    👎 TỪ CHỐI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KIOSK WAITING LOUNGE & AUTO-DISPATCH PANEL */}
      {orders.filter(o => o.status === 'queued').length > 0 ? (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-brand-green/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-green"></span>
              </span>
              <div>
                <h3 className="font-display text-sm font-black uppercase text-brand-green tracking-wide">
                  SẢNH CHỜ KIOSK TỰ PHỤC VỤ ({orders.filter(o => o.status === 'queued').length} XE ĐANG CHỜ)
                </h3>
                <p className="text-gray-400 text-[10px] font-sans mt-0.5">
                  Xe vừa check-in tự phục vụ tại Kiosk. Chọn buồng trống và KTV để phân phối thi công tức thì
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 text-xs">
              <span className="text-[10px] font-mono px-2 py-1 bg-slate-850 rounded-lg text-brand-green border border-slate-700 font-bold uppercase">
                Buồng trống: {booths.filter(b => b.status === 'idle').map(b => b.name).join(', ') || 'HẾT BUỒNG TRỐNG'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(o => o.status === 'queued').map((wo) => {
              const elementIdBooth = `booth-select-${wo.id}`;
              const elementIdTech = `tech-select-${wo.id}`;
              return (
                <div key={wo.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between gap-3 relative hover:border-brand-green/40 transition">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">Kiosk Order Check-In</span>
                      <span className="text-[10px] font-mono text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full font-extrabold uppercase">
                        {wo.packageCode}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black font-mono text-white tracking-wider">{wo.licensePlate}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">({wo.vehicleSegment})</span>
                    </div>
                    
                    <div className="text-[10px] text-gray-400 font-sans mt-1">
                      Khách: <strong className="text-white">{wo.customerName || 'Khách vãng lai'}</strong> {wo.customerPhone ? `(${wo.customerPhone})` : ''}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="flex gap-2">
                      <select
                        id={elementIdBooth}
                        defaultValue=""
                        className="flex-1 bg-slate-900 border border-slate-800 text-white text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-green"
                      >
                        <option value="">Chọn buồng rỗi...</option>
                        {booths.map(b => (
                          <option key={b.id} value={b.id} disabled={b.status === 'busy'}>
                            {b.name} {b.status === 'busy' ? '(Bận)' : '(Trống)'}
                          </option>
                        ))}
                      </select>

                      <select
                        id={elementIdTech}
                        defaultValue=""
                        className="flex-1 bg-slate-900 border border-slate-800 text-white text-[11px] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-green"
                      >
                        <option value="">Chọn KTV...</option>
                        {staff.filter(s => s.role === 'technician').map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const boothSelect = document.getElementById(elementIdBooth) as HTMLSelectElement;
                        const techSelect = document.getElementById(elementIdTech) as HTMLSelectElement;
                        const bId = boothSelect?.value;
                        const tId = techSelect?.value;
                        if (!bId || !tId) {
                          alert("Vui lòng chọn cả buồng rửa trống và kỹ thuật viên phụ trách để phân công!");
                          return;
                        }
                        simActions.assignWorkOrder(wo.id, tId, bId);
                      }}
                      className="w-full py-2 bg-brand-green hover:bg-brand-green-hover text-matte-black text-[11px] font-extrabold uppercase font-display rounded-lg transition-colors cursor-pointer border-0"
                    >
                      XẾP VÀO BUỒNG THI CÔNG ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#fdfdfd] border border-stone-200 p-4.5 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-extrabold text-matte-black block uppercase tracking-wide text-[11px]">SẢNH CHỜ KIOSK RỖI</span>
              <span className="text-mid-gray text-[10px] font-sans">
                Tất cả các xe check-in từ Kiosk tự phục vụ đều đã được xếp vào các buồng rửa thành công.
              </span>
            </div>
          </div>
          
          <span className="text-[10px] font-mono text-mid-gray uppercase bg-stone-100 px-2.5 py-1 rounded-lg">
            Awaiting Check-in
          </span>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-forest-green" />
              DANH SÁCH LỆNH VẬN HÀNH TRONG NGÀY
            </h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-mid-gray" />
              <input
                type="text"
                placeholder="Tìm biển số, tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green placeholder-mid-gray"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-warm-white text-mid-gray border-b border-[#e5e5e5]">
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold">Biển Số Xe</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold">Khách Hàng</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold">Gói Dịch Vụ</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold">KTV gán</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold">Buồng</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold">Trạng Thái</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] font-extrabold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-mid-gray font-sans text-sm">
                        Chưa có lệnh rửa xe nào phù hợp. Tạo đơn mới để bắt đầu!
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((wo) => (
                      <tr
                        key={wo.id}
                        onClick={() => setSelectedOrder(wo)}
                        className={`hover:bg-warm-white/50 transition-colors cursor-pointer ${
                          selectedOrder?.id === wo.id ? "bg-brand-green-light" : ""
                        }`}
                      >
                        <td className="p-4 font-extrabold text-matte-black tracking-wider text-sm font-mono">{wo.licensePlate}</td>
                        <td className="p-4 font-bold text-matte-black">
                          <div>{wo.customerName}</div>
                          <div className="text-[10px] text-mid-gray font-normal">{wo.customerPhone || "Khách vãng lai"}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-green text-matte-black font-extrabold text-[10px] font-sans">
                            {wo.packageCode}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-matte-black">
                          {wo.technicianName ? (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-forest-green" /> {wo.technicianName}
                            </span>
                          ) : (
                            <span className="text-amber-600 italic font-bold">Chưa phân công</span>
                          )}
                        </td>
                        <td className="p-4 text-forest-green font-extrabold">{wo.boothName || "—"}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                              wo.status === 'done'
                                ? "bg-brand-green text-matte-black border-brand-green"
                                : wo.status === 'quality_check'
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : wo.status === 'rework'
                                    ? "bg-red-100 text-red-700 border-red-200 animate-pulse"
                                    : wo.status === 'in_progress'
                                      ? "bg-brand-green-light text-forest-green border-brand-green/20"
                                      : "bg-gray-100 text-mid-gray border-gray-200"
                            }`}
                          >
                            {wo.status === 'queued' ? 'Chờ phân buồng' : wo.status === 'assigned' ? 'Đã gán' : wo.status === 'in_progress' ? 'Đang rửa' : wo.status === 'quality_check' ? 'QC Check' : wo.status === 'rework' ? 'Rework' : wo.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {wo.status === 'queued' ? (
                            <button
                              onClick={() => {
                                setSelectedWoId(wo.id);
                                setDispatchBoothId(booths.find(b => b.status === 'idle')?.id || "");
                                setDispatchTechId(staff.find(s => s.role === 'technician')?.id || "");
                                setShowDispatchDrawer(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green-hover text-matte-black font-extrabold font-display transition text-[10px] tracking-wide cursor-pointer shadow-sm"
                            >
                              ĐIỀU PHỐI (DISPATCH)
                            </button>
                          ) : (
                            <span className="text-[10px] text-mid-gray italic">Đang vận hành...</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DETAILS PANEL & NOTES */}
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-forest-green" />
            CHI TIẾT LỆNH & GHI CHÚ
          </h2>

          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-sm space-y-4">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-[#e5e5e5] pb-3">
                  <div>
                    <span className="text-[10px] font-sans font-extrabold text-mid-gray block uppercase">Biển Số Xe</span>
                    <span className="text-xl font-black font-mono text-matte-black tracking-widest">{selectedOrder.licensePlate}</span>
                  </div>
                  <span className="text-xs font-black text-forest-green bg-brand-green-light px-2.5 py-1 rounded-full border border-brand-green/20">
                    {selectedOrder.status === 'queued' ? 'Chờ phân buồng' : selectedOrder.status === 'assigned' ? 'Đã gán' : selectedOrder.status === 'in_progress' ? 'Đang rửa' : selectedOrder.status === 'quality_check' ? 'QC Check' : selectedOrder.status === 'rework' ? 'Rework' : selectedOrder.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans text-mid-gray">
                  <div className="flex justify-between">
                    <span>Khách hàng:</span>
                    <span className="text-matte-black font-bold">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số điện thoại:</span>
                    <span className="text-matte-black font-mono">{selectedOrder.customerPhone || "Khách vãng lai"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dịch vụ chính:</span>
                    <span className="text-forest-green font-bold">{selectedOrder.packageCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phân khúc:</span>
                    <span className="text-matte-black font-medium uppercase">{selectedOrder.vehicleSegment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng tiền:</span>
                    <span className="text-matte-black font-bold">{formatVnd(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* NOTE FORMS */}
                <form onSubmit={handleAddNote} className="border-t border-[#e5e5e5] pt-4 space-y-3">
                  <span className="font-display text-[10px] font-black text-matte-black uppercase block">THÊM DÒNG NHẬT KÝ GHI CHÚ</span>
                  
                  <div className="flex gap-1.5 bg-warm-white p-1 rounded-lg border border-[#e5e5e5] text-[10px] font-bold font-sans">
                    <button
                      type="button"
                      onClick={() => setNoteTag("standard")}
                      className={`flex-1 py-1 rounded text-center transition ${
                        noteTag === "standard" ? "bg-white text-matte-black shadow-sm" : "text-mid-gray"
                      }`}
                    >
                      Bình thường
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteTag("technical")}
                      className={`flex-1 py-1 rounded text-center transition ${
                        noteTag === "technical" ? "bg-white text-matte-black shadow-sm" : "text-mid-gray"
                      }`}
                    >
                      Kỹ thuật
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteTag("complaint")}
                      className={`flex-1 py-1 rounded text-center transition ${
                        noteTag === "complaint" ? "bg-red-500 text-white shadow-sm" : "text-mid-gray"
                      }`}
                    >
                      Khiếu nại
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      required
                      placeholder="Nhập ghi chú chi tiết..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full h-16 bg-white border border-[#e5e5e5] rounded-xl p-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-matte-black hover:bg-matte-black/90 text-white font-extrabold text-xs font-display transition shadow-md uppercase cursor-pointer"
                  >
                    XÁC NHẬN GHI GHI CHÚ
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#e5e5e5] rounded-xl bg-warm-white">
                <Activity className="h-6 w-6 text-mid-gray mb-2" />
                <span className="text-xs text-matte-black font-extrabold font-display uppercase">BÀN ĐIỀU PHỐI ĐANG RỖI</span>
                <span className="text-[10px] text-mid-gray mt-1 max-w-[200px] font-sans">
                  Nhấp chọn một dòng xe tại bảng danh sách để xem chi tiết lịch trình, ETA, và cấu hình ghi chú kỹ thuật.
                </span>
              </div>
            )}
          </div>

          {/* TRẠNG THÁI HOẠT ĐỘNG CÁC BUỒNG (WASH BAY ACTIVITIES) */}
          <div className="bg-white border border-[#e5e5e5] p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-display text-xs font-black text-matte-black uppercase flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-[#A2C62C]" />
              TRẠNG THÁI &amp; ĐIỀU KHIỂN BUỒNG THI CÔNG
            </h3>
            
            <div className="space-y-3">
              {booths.map(b => {
                // Find order currently in this booth (not 'done')
                const activeWo = orders.find(o => o.boothId === b.id && o.status !== 'done');
                
                return (
                  <div key={b.id} className="p-4 bg-warm-white border border-stone-200 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-matte-black text-xs">{b.name}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          b.status === 'idle' 
                            ? "bg-emerald-500 animate-pulse" 
                            : b.status === 'busy' 
                              ? "bg-amber-500" 
                              : "bg-red-500"
                        }`} />
                      </div>
                      
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        b.status === 'idle' 
                          ? "bg-emerald-100 text-emerald-800" 
                          : b.status === 'busy' 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-red-100 text-red-800"
                      }`}>
                        {b.status === 'idle' ? 'Trống' : b.status === 'busy' ? 'Đang hoạt động' : 'Bảo trì'}
                      </span>
                    </div>
                    
                    {activeWo ? (
                      <div className="space-y-2 mt-1.5 pt-2 border-t border-stone-200 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-mid-gray">Xe:</span>
                          <span className="font-extrabold text-slate-950 font-mono tracking-wider">{activeWo.licensePlate}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-mid-gray">Gói dịch vụ:</span>
                          <span className="font-extrabold text-forest-green">{activeWo.packageCode}</span>
                        </div>
                        {activeWo.technicianName && (
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-mid-gray">KTV Phụ trách:</span>
                            <span className="font-semibold text-matte-black">{activeWo.technicianName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-mid-gray">Trạng thái:</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                            activeWo.status === 'assigned' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            activeWo.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                            activeWo.status === 'quality_check' ? 'bg-purple-50 text-purple-700 border border-purple-150' :
                            activeWo.status === 'rework' ? 'bg-red-50 text-red-700 border border-red-200 animate-bounce' :
                            'bg-stone-50 text-stone-700'
                          }`}>
                            {activeWo.status === 'assigned' ? 'Đã gán (Chờ)' :
                             activeWo.status === 'in_progress' ? 'Đang rửa xe' :
                             activeWo.status === 'quality_check' ? 'Chờ duyệt QC' :
                             activeWo.status === 'rework' ? 'Rework (Sửa lỗi)' : activeWo.status}
                          </span>
                        </div>

                        {/* Quick Controller Actions */}
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {activeWo.status === 'assigned' && (
                            <button
                              onClick={() => {
                                simActions.updateWorkOrderStatus(activeWo.id, 'in_progress', undefined, 'web', 'Bắt đầu từ sảnh đón');
                              }}
                              className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-[10px] uppercase transition tracking-wider cursor-pointer border-0 shadow-sm"
                            >
                              ▶ Bắt đầu thi công
                            </button>
                          )}
                          {activeWo.status === 'in_progress' && (
                            <button
                              onClick={() => {
                                simActions.updateWorkOrderStatus(activeWo.id, 'quality_check', undefined, 'web', 'Yêu cầu kiểm định chất lượng');
                              }}
                              className="w-full py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg text-[10px] uppercase transition tracking-wider cursor-pointer border-0 shadow-sm"
                            >
                              🔍 Kiểm định QC Check
                            </button>
                          )}
                          {activeWo.status === 'quality_check' && (
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <button
                                onClick={() => {
                                  simActions.updateWorkOrderStatus(activeWo.id, 'done', undefined, 'web', 'Hoàn thành QC - Xuất xưởng');
                                }}
                                className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[10px] uppercase transition tracking-wider cursor-pointer border-0 shadow-sm text-center"
                              >
                                ✓ Đạt QC
                              </button>
                              <button
                                onClick={() => {
                                  simActions.updateWorkOrderStatus(activeWo.id, 'rework', undefined, 'web', 'Yêu cầu thi công lại do lỗi');
                                }}
                                className="py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-[10px] uppercase transition tracking-wider cursor-pointer border-0 shadow-sm text-center"
                              >
                                ✗ Lỗi (Làm lại)
                              </button>
                            </div>
                          )}
                          {activeWo.status === 'rework' && (
                            <button
                              onClick={() => {
                                simActions.updateWorkOrderStatus(activeWo.id, 'in_progress', undefined, 'web', 'Bắt đầu khắc phục lỗi (Rework)');
                              }}
                              className="w-full py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-[10px] uppercase transition tracking-wider cursor-pointer border-0 shadow-sm"
                            >
                              🔄 Bắt đầu làm lại
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-600 font-semibold font-sans mt-1">Sẵn sàng đón xe vào</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH DRAWERS (MODAL) */}
      {showDispatchDrawer && (
        <div className="fixed inset-0 bg-matte-black/50 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-white border-l border-[#e5e5e5] w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 mb-6">
                <h3 className="font-display text-base font-black text-matte-black uppercase">ĐIỀU PHỐI LỆNH WASH BAY</h3>
                <button onClick={() => setShowDispatchDrawer(false)} className="text-mid-gray hover:text-matte-black transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleDispatchSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Gán Buồng Thi Công (Wash Bay)
                  </label>
                  <select
                    required
                    value={dispatchBoothId}
                    onChange={(e) => setDispatchBoothId(e.target.value)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-3 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  >
                    <option value="">Chọn buồng rỗi...</option>
                    {booths.map(b => (
                      <option key={b.id} value={b.id} disabled={b.status === 'busy'}>
                        {b.name} {b.status === 'busy' ? '(Đầy - Busy)' : '(Trống - Ready)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Gán Kỹ Thuật Viên Chuyên Trách
                  </label>
                  <select
                    required
                    value={dispatchTechId}
                    onChange={(e) => setDispatchTechId(e.target.value)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-3 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  >
                    <option value="">Chọn KTV ca làm...</option>
                    {staff.filter(s => s.role === 'technician').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-matte-black font-extrabold tracking-wider text-xs font-display transition shadow-md uppercase cursor-pointer"
                >
                  XÁC NHẬN GÁN & CHUYỂN BUỒNG
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-IN MODAL */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-matte-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e5e5e5] w-full max-w-xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCheckInModal(false)}
              className="absolute top-4 right-4 text-mid-gray hover:text-matte-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-4 mb-4">
              <Sparkles className="h-5 w-5 text-forest-green" />
              <h3 className="text-lg font-extrabold font-display tracking-wider text-matte-black uppercase">
                TIẾP NHẬN XE MỚI TRỰC TIẾP
              </h3>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans text-mid-gray uppercase font-extrabold flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0901234567..."
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans text-mid-gray uppercase font-extrabold flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Tên Khách Hàng
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên khách hàng..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans text-mid-gray uppercase font-extrabold flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" /> Biển Số Xe
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập biển số (ví dụ: 30A-999.99)..."
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 font-mono text-xs text-matte-black focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                    Phân Khúc Xe
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value as any)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV / Crossover</option>
                    <option value="truck">Bán tải / Xe tải</option>
                  </select>
                </div>
              </div>

              {/* Service package selection */}
              <div className="space-y-2">
                <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                  Chọn Gói Dịch Vụ Chính
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SERVICES_CATALOG.slice(0, 3).map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-3 border rounded-xl text-left flex flex-col justify-between gap-1 transition-all ${
                        selectedPkg.id === pkg.id
                          ? "bg-brand-green-light border-2 border-brand-green text-matte-black"
                          : "bg-white border-[#e5e5e5] text-mid-gray hover:border-[#bcbcbc]"
                      }`}
                    >
                      <span className="font-extrabold text-[10px] tracking-wider uppercase font-mono">{pkg.code}</span>
                      <h4 className="font-display font-bold text-[11px] text-matte-black uppercase tracking-tight leading-tight mt-1">{pkg.name}</h4>
                      <span className="font-mono text-[10px] text-forest-green font-extrabold block mt-1">{formatVnd(pkg.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons Selection */}
              <div className="space-y-2">
                <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                  Dịch Vụ Bổ Trợ (Add-ons)
                </label>
                <div className="space-y-2">
                  {ADDONS_CATALOG.map((addon) => {
                    const isChecked = selectedAddons.find(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={`w-full p-2.5 border rounded-xl text-left flex items-center justify-between transition-all ${
                          isChecked ? "bg-brand-green-light border-brand-green text-matte-black" : "bg-white border-[#e5e5e5]"
                        }`}
                      >
                        <div className="text-left">
                          <h4 className="font-display font-extrabold text-[11px] text-matte-black">{addon.name}</h4>
                          <span className="text-[10px] text-mid-gray leading-tight block">{addon.description}</span>
                        </div>
                        <span className="font-mono text-xs font-black text-forest-green">+{formatVnd(addon.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                    Tình Trạng Xe Lúc Nhận
                  </label>
                  <input
                    type="text"
                    required
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                    ETA Dự Kiến (phút)
                  </label>
                  <input
                    type="number"
                    required
                    value={customEta}
                    onChange={(e) => setCustomEta(e.target.value)}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-mid-gray hover:bg-warm-white transition text-xs font-extrabold font-display uppercase cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-brand-green hover:bg-brand-green-hover text-matte-black font-extrabold tracking-wider text-xs font-display transition shadow-md uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  HOÀN TẤT CHECK-IN <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
