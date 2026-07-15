import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sliders,
  RotateCcw,
  Zap,
  Power,
  Shield,
  Clock,
  Database,
  Droplet,
  Bell,
  DollarSign,
  HelpCircle,
  Check,
  X,
  ChevronLeft,
  UserCheck,
  History,
  Calendar,
  AlertTriangle,
  FileText,
  Users,
  Key,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Lock,
  Unlock,
  Search,
  Printer,
  Bot,
  RefreshCw,
  Layers,
  Sparkles,
  UserMinus,
  Send,
  HardDrive
} from "lucide-react";
import { simActions } from "../../lib/supabase/client";

// Module configurations (Module 0 to Module 7)
const MODULE_KEYS = [
  { id: "mod0", key: "settings", name: "Module 0: Cài đặt hệ thống" },
  { id: "mod1", key: "dashboard", name: "Module 1: Dashboard điều phối" },
  { id: "mod2", key: "reception", name: "Module 2: Tiếp nhận & Kiosk" },
  { id: "mod3", key: "ktv", name: "Module 3: Buồng rửa KTV" },
  { id: "mod4", key: "pos", name: "Module 4: POS & Hóa đơn" },
  { id: "mod5", key: "services", name: "Module 5: Gói dịch vụ & BOM" },
  { id: "mod6", key: "inventory", name: "Module 6: Kho & Hao phí" },
  { id: "mod7", key: "staff", name: "Module 7: Nhân sự & Audit log" }
];

const PERMISSION_TYPES = [
  { key: "C", name: "Create (Thêm)" },
  { key: "R", name: "Read (Xem)" },
  { key: "U", name: "Update (Sửa)" },
  { key: "D", name: "Delete (Xóa)" }
];

interface SettingsModuleProps {
  rolePermissions?: Record<string, string[]>; // fallback
  onPermissionsChange?: (newPerms: Record<string, string[]>) => void;
}

export default function SettingsModule({ rolePermissions, onPermissionsChange }: SettingsModuleProps) {
  // Navigation for 5 Sub-Menus
  const [activeSubMenu, setActiveSubMenu] = useState<"general" | "rbac" | "configs" | "integration" | "audit">("general");

  // User Role Switcher for high fidelity testing
  const [userRole, setUserRole] = useState<"master_admin" | "manager">("master_admin");

  // Local state for toast alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ---------------------------------------------------------
  // SUB-MENU 1: GENERAL PROFILE STATES
  // ---------------------------------------------------------
  const [stationId, setStationId] = useState(() => localStorage.getItem("wassup_station_id") || "WASSUP_TÂN_BÌNH_01");
  const [stationName, setStationName] = useState(() => localStorage.getItem("wassup_station_name") || "WASSUP Station - Chi Nhánh 1");
  const [stationAddress, setStationAddress] = useState(() => localStorage.getItem("wassup_station_address") || "120 Hoàng Hoa Thám, Phường 12, Quận Tân Bình, TP. Hồ Chí Minh");
  const [stationPhone, setStationPhone] = useState(() => localStorage.getItem("wassup_station_phone") || "0909 888 999");
  const [stationEmail, setStationEmail] = useState(() => localStorage.getItem("wassup_station_email") || "cn1@wassup.com.vn");
  const [openTime, setOpenTime] = useState(() => localStorage.getItem("wassup_open_time") || "07:00");
  const [closeTime, setCloseTime] = useState(() => localStorage.getItem("wassup_close_time") || "21:00");

  // ---------------------------------------------------------
  // SUB-MENU 2: USER & PHÂN QUYỀN (STAFF & RBAC MATRIX)
  // ---------------------------------------------------------
  const [staffList, setStaffList] = useState<any[]>(() => {
    return simActions.getStaff();
  });
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState<"master_admin" | "manager" | "technician" | "accountant">("manager");
  
  // Matrix permissions: Structure: Record<Role, Record<ModuleKey, Array<"C"|"R"|"U"|"D">>>
  const [matrixPermissions, setMatrixPermissions] = useState<Record<string, Record<string, string[]>>>(() => {
    const saved = localStorage.getItem("wassup_rbac_matrix_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default initial Matrix Permissions
    return {
      master_admin: {
        settings: ["C", "R", "U", "D"],
        dashboard: ["C", "R", "U", "D"],
        reception: ["C", "R", "U", "D"],
        ktv: ["C", "R", "U", "D"],
        pos: ["C", "R", "U", "D"],
        services: ["C", "R", "U", "D"],
        inventory: ["C", "R", "U", "D"],
        staff: ["C", "R", "U", "D"]
      },
      manager: {
        settings: ["R", "U"],
        dashboard: ["C", "R", "U", "D"],
        reception: ["C", "R", "U"],
        ktv: ["C", "R", "U", "D"],
        pos: ["C", "R", "U"],
        services: ["C", "R", "U"],
        inventory: ["C", "R", "U"],
        staff: ["R"]
      },
      technician: {
        settings: [],
        dashboard: ["R"],
        reception: [],
        ktv: ["R", "U"],
        pos: [],
        services: ["R"],
        inventory: ["R", "U"],
        staff: []
      },
      accountant: {
        settings: [],
        dashboard: ["R"],
        reception: ["R"],
        ktv: [],
        pos: ["C", "R", "U"],
        services: ["R"],
        inventory: ["C", "R", "U"],
        staff: ["R"]
      }
    };
  });

  // Modal forms for adding / editing staff
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);

  const [staffForm, setStaffForm] = useState({
    name: "",
    phone: "",
    role: "technician" as "master_admin" | "manager" | "technician" | "accountant",
    pin: "123456",
    telegramChatId: ""
  });

  // ---------------------------------------------------------
  // SUB-MENU 3: CONTROL TOWER STATES (REVENUE, SURCHARGES, STOCK WARNING, LIMITS)
  // ---------------------------------------------------------
  const [dailyTarget, setDailyTarget] = useState(() => Number(localStorage.getItem("wassup_daily_target")) || 50000000);
  const [warningLevel, setWarningLevel] = useState(() => Number(localStorage.getItem("wassup_warning_level")) || 35000000);
  const [redThreshold, setRedThreshold] = useState(() => Number(localStorage.getItem("wassup_red_threshold")) || 4404000);
  
  const [surcharges, setSurcharges] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("wassup_vehicle_surcharges");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { sedan: 0, suv: 50000, luxury: 100000, electric: 30000 };
  });

  const [spendingLimits, setSpendingLimits] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("wassup_role_spending_limits");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { master_admin: 999999999, manager: 20000000, accountant: 10000000, technician: 1000000 };
  });

  const [lowStockWarning, setLowStockWarning] = useState(() => Number(localStorage.getItem("wassup_low_stock_threshold")) || 10);

  // ---------------------------------------------------------
  // SUB-MENU 4: DEVICE INTEGRATION STATES
  // ---------------------------------------------------------
  const [telegramToken, setTelegramToken] = useState(() => localStorage.getItem("wassup_telegram_token") || "7284910239:AAH_wassup_test_token_8829");
  const [telegramGroupChatId, setTelegramGroupChatId] = useState(() => localStorage.getItem("wassup_telegram_group_id") || "-10029384710");
  const [telegramConnected, setTelegramConnected] = useState(true);

  const [kioskTerminalIp, setKioskTerminalIp] = useState(() => localStorage.getItem("wassup_kiosk_ip") || "192.168.1.155");
  const [kioskPort, setKioskPort] = useState(() => localStorage.getItem("wassup_kiosk_port") || "3001");
  const [kioskSecret, setKioskSecret] = useState(() => localStorage.getItem("wassup_kiosk_secret") || "kiosk_wassup_secure_99182");

  const [printerWidth, setPrinterWidth] = useState(() => localStorage.getItem("wassup_printer_width") || "80");
  const [autoPrintTicket, setAutoPrintTicket] = useState(() => localStorage.getItem("wassup_auto_print") !== "false");

  const [s3Bucket, setS3Bucket] = useState(() => localStorage.getItem("wassup_s3_bucket") || "wassup-ops-backups");
  const [s3Region, setS3Region] = useState(() => localStorage.getItem("wassup_s3_region") || "ap-southeast-1");

  // ---------------------------------------------------------
  // SUB-MENU 5: AUDIT TRAIL LOG STATES
  // ---------------------------------------------------------
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchAuditQuery, setSearchAuditQuery] = useState("");
  const [auditFilterActor, setAuditFilterActor] = useState("all");
  const [auditFilterModule, setAuditFilterModule] = useState("all");
  const [auditFilterType, setAuditFilterType] = useState("all");

  // Initialize & Load Audit Logs
  useEffect(() => {
    const stored = localStorage.getItem("wassup_rbac_audit_logs");
    if (stored) {
      try {
        setAuditLogs(JSON.parse(stored));
      } catch (e) {
        setAuditLogs([]);
      }
    } else {
      // Seed Initial Logs
      const initialLogs = [
        {
          id: "log_initial",
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          actor: "Trần Minh Quân (Admin)",
          module: "settings",
          type: "SYSTEM",
          details: "Cấu hình thành công môi trường trạm WASSUP Tân Bình 01."
        },
        {
          id: "log_seed_1",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          actor: "Nguyễn Văn Hùng (Manager)",
          module: "services",
          type: "UPDATE",
          details: "Cập nhật đơn giá Gói Tiêu Chuẩn W1 lên 150,000 VND."
        },
        {
          id: "log_seed_2",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          actor: "Trần Minh Quân (Admin)",
          module: "staff",
          type: "CREATE",
          details: "Cấp mới tài khoản Kỹ thuật viên Lê Hoàng Nam (PIN: 182930)."
        }
      ];
      setAuditLogs(initialLogs);
      localStorage.setItem("wassup_rbac_audit_logs", JSON.stringify(initialLogs));
    }
  }, []);

  // Helper to add audit logs
  const addAuditLogEntry = (moduleKey: string, type: "CREATE" | "UPDATE" | "DELETE" | "SYSTEM", details: string) => {
    const newLog = {
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      actor: userRole === "master_admin" ? "Trần Minh Quân (Admin)" : "Nguyễn Văn Hùng (Manager)",
      module: moduleKey,
      type,
      details
    };
    const updated = [newLog, ...auditLogs].slice(0, 100); // Keep last 100
    setAuditLogs(updated);
    localStorage.setItem("wassup_rbac_audit_logs", JSON.stringify(updated));
  };

  // ---------------------------------------------------------
  // SAVE ACTIONS
  // ---------------------------------------------------------

  // Save General Profile Info
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("wassup_station_id", stationId.toUpperCase().trim());
    localStorage.setItem("wassup_station_name", stationName);
    localStorage.setItem("wassup_station_address", stationAddress);
    localStorage.setItem("wassup_station_phone", stationPhone);
    localStorage.setItem("wassup_station_email", stationEmail);
    localStorage.setItem("wassup_open_time", openTime);
    localStorage.setItem("wassup_close_time", closeTime);

    addAuditLogEntry("settings", "UPDATE", `Cập nhật thông tin chung trạm: ${stationName} (${stationId})`);
    showToast("Đã lưu thông tin cấu hình trạm thành công!");
  };

  // Save Matrix RBAC Permissions
  const handleToggleMatrixPermission = (moduleKey: string, perm: string) => {
    setMatrixPermissions(prev => {
      const currentRolePerms = prev[selectedRoleForMatrix] || {};
      const currentModulePerms = currentRolePerms[moduleKey] || [];
      let updatedModulePerms: string[];

      if (currentModulePerms.includes(perm)) {
        updatedModulePerms = currentModulePerms.filter(p => p !== perm);
      } else {
        updatedModulePerms = [...currentModulePerms, perm];
      }

      const updated = {
        ...prev,
        [selectedRoleForMatrix]: {
          ...currentRolePerms,
          [moduleKey]: updatedModulePerms
        }
      };

      localStorage.setItem("wassup_rbac_matrix_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveRbacMatrix = () => {
    addAuditLogEntry("staff", "UPDATE", `Cập nhật ma trận phân quyền hệ thống cho nhóm: ${selectedRoleForMatrix}`);
    showToast(`Đã áp dụng cấu hình ma trận phân quyền cho vai trò ${selectedRoleForMatrix.toUpperCase()}`);
    
    // Sync to legacy rolePermissions callback if provided
    if (onPermissionsChange) {
      // Map the array format for compat
      const compatPerms: Record<string, string[]> = {};
      Object.entries(matrixPermissions).forEach(([role, modules]) => {
        compatPerms[role] = Object.entries(modules)
          .filter(([_, perms]) => perms.includes("R")) // Read access means allowed in legacy simple array
          .map(([modKey]) => modKey);
      });
      onPermissionsChange(compatPerms);
    }
  };

  // Create Staff Member
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.phone) {
      showToast("Vui lòng nhập đầy đủ thông tin nhân sự!");
      return;
    }

    const newStaffObj = simActions.addStaff({
      name: staffForm.name,
      phone: staffForm.phone,
      role: staffForm.role,
      pin: staffForm.pin || "123456"
    });

    if (newStaffObj) {
      // Add extra simulation fields like telegram synchronization
      if (staffForm.telegramChatId) {
        localStorage.setItem(`wassup_staff_tg_${newStaffObj.id}`, staffForm.telegramChatId);
      }
      setStaffList(simActions.getStaff());
      addAuditLogEntry("staff", "CREATE", `Cấp tài khoản mới cho: ${staffForm.name} (${staffForm.role})`);
      showToast(`Đã thêm nhân sự ${staffForm.name} thành công!`);
      setShowAddStaffModal(false);
      setStaffForm({ name: "", phone: "", role: "technician", pin: "123456", telegramChatId: "" });
    }
  };

  // Open Edit Staff
  const handleOpenEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    const savedTg = localStorage.getItem(`wassup_staff_tg_${staff.id}`) || "";
    setStaffForm({
      name: staff.name,
      phone: staff.phone,
      role: staff.role,
      pin: staff.pin || "123456",
      telegramChatId: savedTg
    });
    setShowEditStaffModal(true);
  };

  // Edit Staff Member
  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    const updated = simActions.updateStaff(selectedStaff.id, {
      name: staffForm.name,
      phone: staffForm.phone,
      role: staffForm.role,
      pin: staffForm.pin
    });

    if (updated) {
      if (staffForm.telegramChatId) {
        localStorage.setItem(`wassup_staff_tg_${selectedStaff.id}`, staffForm.telegramChatId);
      } else {
        localStorage.removeItem(`wassup_staff_tg_${selectedStaff.id}`);
      }
      setStaffList(simActions.getStaff());
      addAuditLogEntry("staff", "UPDATE", `Cập nhật hồ sơ tài khoản nhân sự: ${staffForm.name}`);
      showToast(`Đã cập nhật tài khoản ${staffForm.name}!`);
      setShowEditStaffModal(false);
      setSelectedStaff(null);
    }
  };

  // Toggle staff lock status
  const handleToggleStaffStatus = (staff: any) => {
    const targetStatus = staff.status === "blocked" ? "active" : "blocked";
    const updated = simActions.updateStaff(staff.id, { status: targetStatus });
    if (updated) {
      setStaffList(simActions.getStaff());
      addAuditLogEntry("staff", "UPDATE", `${targetStatus === "blocked" ? "Khóa" : "Kích hoạt lại"} tài khoản nhân sự ${staff.name}`);
      showToast(`Đã cập nhật trạng thái tài khoản cho ${staff.name}`);
    }
  };

  // Save Control Tower (Surcharges, limits, thresholds, stock alert)
  const handleSaveControlTower = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("wassup_daily_target", String(dailyTarget));
    localStorage.setItem("wassup_warning_level", String(warningLevel));
    localStorage.setItem("wassup_red_threshold", String(redThreshold));
    localStorage.setItem("wassup_vehicle_surcharges", JSON.stringify(surcharges));
    localStorage.setItem("wassup_role_spending_limits", JSON.stringify(spendingLimits));
    localStorage.setItem("wassup_low_stock_threshold", String(lowStockWarning));

    // Update simulation engine
    simActions.updateThresholds(Number(dailyTarget), Number(warningLevel));

    addAuditLogEntry("settings", "UPDATE", "Cập nhật bảng định mức tài chính, phụ phí dòng xe & hạn mức chi phí.");
    showToast("Đã cập nhật toàn bộ cấu hình định mức quản trị thành công!");
  };

  // Save Device Integrations
  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("wassup_telegram_token", telegramToken);
    localStorage.setItem("wassup_telegram_group_id", telegramGroupChatId);
    localStorage.setItem("wassup_kiosk_ip", kioskTerminalIp);
    localStorage.setItem("wassup_kiosk_port", kioskPort);
    localStorage.setItem("wassup_kiosk_secret", kioskSecret);
    localStorage.setItem("wassup_printer_width", printerWidth);
    localStorage.setItem("wassup_auto_print", String(autoPrintTicket));
    localStorage.setItem("wassup_s3_bucket", s3Bucket);
    localStorage.setItem("wassup_s3_region", s3Region);

    addAuditLogEntry("settings", "UPDATE", "Cấu hình cổng kết nối thiết bị ngoại vi và Telegram Webhook API.");
    showToast("Đã lưu cấu hình kết nối thiết bị ngoại vi thành công!");
  };

  // Simulate backup recovery
  const handleSimulateRestore = () => {
    const confirm = window.confirm("Hệ thống sẽ tải lại bản sao lưu gần nhất từ Cloud Storage và thiết lập lại các mục cấu hình. Xác nhận?");
    if (confirm) {
      addAuditLogEntry("settings", "SYSTEM", "Kích hoạt cơ chế khôi phục dữ liệu thảm họa (Disaster Recovery) từ AWS S3.");
      showToast("Khôi phục bản sao lưu dữ liệu thành công!");
    }
  };

  // Simulate Telegram test connection
  const handleTestTelegramConnection = () => {
    showToast("⚡ Đang gửi tín hiệu Ping tới Telegram Bot Server...");
    setTimeout(() => {
      setTelegramConnected(true);
      showToast("✅ Kết nối Telegram Bot thành công! Đã gửi tin nhắn test đến Group.");
    }, 1500);
  };

  // Helper formatting currency
  const formatVnd = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
                          log.actor.toLowerCase().includes(searchAuditQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (auditFilterActor !== "all") {
      if (auditFilterActor === "admin" && !log.actor.includes("Admin")) return false;
      if (auditFilterActor === "manager" && !log.actor.includes("Manager")) return false;
      if (auditFilterActor === "system" && !log.actor.includes("SYSTEM")) return false;
    }

    if (auditFilterModule !== "all" && log.module !== auditFilterModule) return false;
    if (auditFilterType !== "all" && log.type !== auditFilterType) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER BAR & SIMULATED ROLE SELECTOR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#A2C62C]" />
        <div className="pl-3">
          <h1 className="text-2xl font-black font-display text-matte-black uppercase tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-forest-green" />
            CÀI ĐẶT HỆ THỐNG VÀ QUY CHUẨN VẬN HÀNH
          </h1>
          <p className="text-mid-gray text-xs font-sans mt-0.5">
            Quản trị viên tối cao thiết lập cấu hình định mức tài chính, định tuyến phân quyền (RBAC) và tích hợp thiết bị phần cứng.
          </p>
        </div>

        {/* Simulator Role Selector */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">VAI TRÒ THỬ NGHIỆM</span>
            <span className="text-xs font-bold text-slate-800 font-sans">
              {userRole === "master_admin" ? "👑 Master Admin" : "💼 Manager"}
            </span>
          </div>
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => setUserRole("master_admin")}
              className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${
                userRole === "master_admin" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ADMIN
            </button>
            <button
              onClick={() => setUserRole("manager")}
              className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${
                userRole === "manager" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              QUẢN LÝ
            </button>
          </div>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-matte-black text-brand-green px-5 py-3.5 rounded-xl border border-brand-green/30 shadow-2xl flex items-center gap-3 font-sans text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-brand-green animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUB-MENU TABS */}
      <div className="flex flex-wrap border-b border-stone-200 gap-1.5 bg-gray-50/50 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveSubMenu("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-extrabold text-xs tracking-wider uppercase transition duration-150 ${
            activeSubMenu === "general"
              ? "bg-white text-forest-green shadow-xs border border-gray-200"
              : "text-mid-gray hover:text-matte-black hover:bg-white/50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Thông tin chung
        </button>
        <button
          onClick={() => setActiveSubMenu("rbac")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-extrabold text-xs tracking-wider uppercase transition duration-150 ${
            activeSubMenu === "rbac"
              ? "bg-white text-forest-green shadow-xs border border-gray-200"
              : "text-mid-gray hover:text-matte-black hover:bg-white/50"
          }`}
        >
          <Users className="h-4 w-4" />
          User & Phân quyền
        </button>
        <button
          onClick={() => setActiveSubMenu("configs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-extrabold text-xs tracking-wider uppercase transition duration-150 ${
            activeSubMenu === "configs"
              ? "bg-white text-forest-green shadow-xs border border-gray-200"
              : "text-mid-gray hover:text-matte-black hover:bg-white/50"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Cấu hình tổng hợp
        </button>
        <button
          onClick={() => setActiveSubMenu("integration")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-extrabold text-xs tracking-wider uppercase transition duration-150 ${
            activeSubMenu === "integration"
              ? "bg-white text-forest-green shadow-xs border border-gray-200"
              : "text-mid-gray hover:text-matte-black hover:bg-white/50"
          }`}
        >
          <Bot className="h-4 w-4" />
          Tích hợp thiết bị
        </button>
        <button
          onClick={() => setActiveSubMenu("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-extrabold text-xs tracking-wider uppercase transition duration-150 ${
            activeSubMenu === "audit"
              ? "bg-white text-forest-green shadow-xs border border-gray-200"
              : "text-mid-gray hover:text-matte-black hover:bg-white/50"
          }`}
        >
          <History className="h-4 w-4" />
          Audit log
        </button>
      </div>

      {/* -------------------------------------------------------------
          SUB-MENU 1: GENERAL PROFILE
          ------------------------------------------------------------- */}
      {activeSubMenu === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-[#e5e5e5] pb-3">
            <h3 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
              <Building2 className="h-5 w-5 text-forest-green" />
              THÔNG TIN VÀ KHUNG GIỜ VẬN HÀNH TRẠM
            </h3>
            <p className="text-[11px] text-mid-gray font-sans mt-0.5">Cấu hình các thông số pháp lý và giờ đóng mở cửa hiển thị trên biên nhận thanh toán.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-extrabold text-mid-gray uppercase">Mã Trạm (Station ID)</label>
              <input
                type="text"
                required
                value={stationId}
                onChange={(e) => setStationId(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 font-mono font-bold text-matte-black focus:outline-none focus:border-forest-green"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-extrabold text-mid-gray uppercase">Tên Chi Nhánh / Trạm Vận Hành</label>
              <input
                type="text"
                required
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 font-sans font-semibold text-matte-black focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-extrabold text-mid-gray uppercase">Địa chỉ vật lý</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 text-mid-gray h-4 w-4" />
              <input
                type="text"
                required
                value={stationAddress}
                onChange={(e) => setStationAddress(e.target.value)}
                className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-matte-black focus:outline-none focus:border-forest-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-extrabold text-mid-gray uppercase">Hotline chăm sóc khách hàng</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 text-mid-gray h-4 w-4" />
                <input
                  type="text"
                  required
                  value={stationPhone}
                  onChange={(e) => setStationPhone(e.target.value)}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-matte-black focus:outline-none focus:border-forest-green"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-extrabold text-mid-gray uppercase">Email liên hệ vận hành</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-mid-gray h-4 w-4" />
                <input
                  type="email"
                  required
                  value={stationEmail}
                  onChange={(e) => setStationEmail(e.target.value)}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-matte-black focus:outline-none focus:border-forest-green"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5 text-xs">
            <span className="font-bold text-matte-black block mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-amber-500" />
              Khung giờ hoạt động của trạm (Operating Hours)
            </span>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase">Giờ mở cửa</label>
                <input
                  type="time"
                  required
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 font-mono font-bold text-matte-black focus:outline-none focus:border-forest-green"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase">Giờ đóng cửa</label>
                <input
                  type="time"
                  required
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 font-mono font-bold text-matte-black focus:outline-none focus:border-forest-green"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-matte-black hover:bg-gray-900 text-white font-extrabold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer"
            >
              Lưu cấu hình chung
            </button>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------
          SUB-MENU 2: USER & PHÂN QUYỀN
          ------------------------------------------------------------- */}
      {activeSubMenu === "rbac" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Staff directory on the left */}
          <div className="lg:col-span-5 bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xs font-black font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-purple-600" />
                DANH SÁCH NHÂN SỰ VẬN HÀNH ({staffList.length})
              </h3>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-mid-gray transition flex items-center gap-1 text-[10px] font-black uppercase"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm
              </button>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {staffList.map((st) => {
                const tgId = localStorage.getItem(`wassup_staff_tg_${st.id}`);
                return (
                  <div key={st.id} className="p-3 bg-gray-50/50 border border-gray-200/60 rounded-xl flex items-center justify-between gap-3 hover:border-gray-300 transition-all">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-matte-black truncate">{st.name}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          st.role === "master_admin" ? "bg-purple-100 text-purple-800" :
                          st.role === "manager" ? "bg-blue-100 text-blue-800" :
                          st.role === "technician" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {st.role === "master_admin" ? "Admin" : st.role === "manager" ? "Quản lý" : st.role === "technician" ? "KTV" : "Kế toán"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-mid-gray font-mono">
                        <span>☎️ {st.phone}</span>
                        <span>🔑 PIN: {st.pin || "123456"}</span>
                      </div>
                      
                      {/* Telegram Connection Tracker Badge */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${tgId ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                        <span className="text-[9px] text-mid-gray font-sans">
                          {tgId ? `Connected Telegram (ID: ${tgId})` : "No Telegram Synced"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditStaff(st)}
                        className="p-1.5 text-mid-gray hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                        title="Sửa"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStaffStatus(st)}
                        className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          st.status === "blocked"
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                        }`}
                      >
                        {st.status === "blocked" ? "Locked" : "Active"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RBAC Permission Matrix on the right */}
          <div className="lg:col-span-7 bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-sm space-y-5">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-black font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-purple-600" />
                  MA TRẬN PHÂN QUYỀN CHỨC NĂNG (RBAC GRID v2.3)
                </h3>
                <p className="text-[10px] text-mid-gray font-sans">Cấu hình 4 nhóm quyền (CRUD) trên cả 8 phân hệ cốt lõi.</p>
              </div>

              {/* Matrix Role Selector */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
                {["manager", "technician", "accountant"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRoleForMatrix(role as any)}
                    className={`px-2.5 py-1 rounded-md transition capitalize cursor-pointer ${
                      selectedRoleForMatrix === role ? "bg-white text-matte-black shadow-3xs font-black" : "text-mid-gray"
                    }`}
                  >
                    {role === "manager" ? "Quản lý" : role === "technician" ? "KTV" : "Kế toán"}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-gray-50 text-mid-gray font-bold text-[10px] uppercase border-b border-gray-200">
                    <th className="p-3">Phân Hệ Hệ Thống (8 Modules)</th>
                    {PERMISSION_TYPES.map(p => (
                      <th key={p.key} className="p-3 text-center" title={p.name}>
                        {p.key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MODULE_KEYS.map((mod) => {
                    const activePerms = matrixPermissions[selectedRoleForMatrix]?.[mod.key] || [];
                    return (
                      <tr key={mod.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-3 font-semibold text-matte-black text-xs">
                          {mod.name}
                        </td>
                        {PERMISSION_TYPES.map(p => {
                          const hasPerm = activePerms.includes(p.key);
                          return (
                            <td key={p.key} className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleMatrixPermission(mod.key, p.key)}
                                className={`h-6 w-10 rounded-md border font-black text-[10px] inline-flex items-center justify-center transition-all cursor-pointer ${
                                  hasPerm
                                    ? "bg-purple-600 text-white border-purple-600 shadow-3xs"
                                    : "bg-white text-gray-300 border-gray-250 hover:bg-gray-100 hover:text-gray-400"
                                }`}
                              >
                                {hasPerm ? p.key : "—"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Note box and save button */}
            <div className="bg-purple-50/30 border border-purple-100 rounded-xl p-3.5 text-[11px] text-purple-900 leading-relaxed font-sans flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <strong className="block mb-0.5">💡 Quy chuẩn RBAC:</strong>
                Gồm 4 quyền: <strong>C</strong> (Create), <strong>R</strong> (Read), <strong>U</strong> (Update), <strong>D</strong> (Delete). Vai trò <strong>Master Admin</strong> mặc định sở hữu toàn bộ quyền hạn tối cao và không thể chỉnh sửa.
              </div>
              <button
                type="button"
                onClick={handleSaveRbacMatrix}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold uppercase text-[10px] rounded-lg tracking-wider shrink-0 transition"
              >
                Cập nhật ma trận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUB-MENU 3: CONTROL TOWER
          ------------------------------------------------------------- */}
      {activeSubMenu === "configs" && (
        <form onSubmit={handleSaveControlTower} className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-[#e5e5e5] pb-3">
            <h3 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
              <Sliders className="h-5 w-5 text-forest-green" />
              CẤU HÌNH TỔNG HỢP VẬN HÀNH (CONTROL TOWER)
            </h3>
            <p className="text-[11px] text-mid-gray font-sans mt-0.5">Quản lý các ngưỡng cảnh báo sảnh, biểu phí biến động dòng xe, hạn mức thanh toán và cảnh báo tồn kho thấp.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Target 1: Revenue Targets */}
            <div className="space-y-4 md:col-span-1 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
              <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#A2C62C]" />
                Ngưỡng tài chính trạm (US-1.2)
              </span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-mid-gray">Chỉ tiêu doanh thu ngày (Target)</label>
                  <input
                    type="number"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono font-bold text-forest-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-mid-gray">Ngưỡng cảnh báo sảnh (Warning)</label>
                  <input
                    type="number"
                    value={warningLevel}
                    onChange={(e) => setWarningLevel(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono font-bold text-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-mid-gray">Ngưỡng đỏ báo động thấp (Danger)</label>
                  <input
                    type="number"
                    value={redThreshold}
                    onChange={(e) => setRedThreshold(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono font-bold text-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Target 2: Surcharges & Spending Limits */}
            <div className="space-y-4 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle Surcharges */}
              <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Phụ thu dòng xe chuyên biệt
                </span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Xe con (Sedan)</span>
                    <input
                      type="number"
                      value={surcharges.sedan}
                      onChange={(e) => setSurcharges({ ...surcharges, sedan: Number(e.target.value) })}
                      className="w-24 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Bán tải/SUV</span>
                    <input
                      type="number"
                      value={surcharges.suv}
                      onChange={(e) => setSurcharges({ ...surcharges, suv: Number(e.target.value) })}
                      className="w-24 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Xe Sang (Lux)</span>
                    <input
                      type="number"
                      value={surcharges.luxury}
                      onChange={(e) => setSurcharges({ ...surcharges, luxury: Number(e.target.value) })}
                      className="w-24 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Xe điện (EV)</span>
                    <input
                      type="number"
                      value={surcharges.electric}
                      onChange={(e) => setSurcharges({ ...surcharges, electric: Number(e.target.value) })}
                      className="w-24 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Role Spending Limits */}
              <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Hạn mức duyệt chi phí tối đa
                </span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Quản lý trạm</span>
                    <input
                      type="number"
                      value={spendingLimits.manager}
                      onChange={(e) => setSpendingLimits({ ...spendingLimits, manager: Number(e.target.value) })}
                      className="w-28 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Kế toán</span>
                    <input
                      type="number"
                      value={spendingLimits.accountant}
                      onChange={(e) => setSpendingLimits({ ...spendingLimits, accountant: Number(e.target.value) })}
                      className="w-28 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-mid-gray">Kỹ thuật viên</span>
                    <input
                      type="number"
                      value={spendingLimits.technician}
                      onChange={(e) => setSpendingLimits({ ...spendingLimits, technician: Number(e.target.value) })}
                      className="w-28 bg-white border border-gray-200 rounded-lg px-2.5 py-1 font-mono font-bold text-right"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-250 text-[10px] text-mid-gray font-sans">
                  * Hạn mức tối đa một nhân viên được tự động duyệt chi không cần phê chuẩn của Master Admin.
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Warning Threshold */}
          <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl text-xs space-y-2 font-sans text-amber-900">
            <span className="font-black flex items-center gap-1 text-amber-700 uppercase tracking-wide">
              <AlertTriangle className="h-4.5 w-4.5" />
              CẤU HÌNH CẢNH BÁO TỒN KHO THẤP (LOW STOCK TRIGGER)
            </span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="max-w-xl text-[11px] leading-relaxed">
                Khi số lượng tồn của bất kỳ hóa chất, vật tư consumable hoặc dụng cụ dọn rửa nào trong Kho hạ xuống dưới ngưỡng cài đặt này, hệ thống sẽ kích hoạt trạng thái báo động vàng/đỏ trên phân hệ Quản Lý Kho (Module 6).
              </p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-mid-gray">Ngưỡng báo động:</span>
                <input
                  type="number"
                  value={lowStockWarning}
                  onChange={(e) => setLowStockWarning(Number(e.target.value))}
                  className="w-20 bg-white border border-amber-200 rounded-lg px-3 py-1.5 font-mono font-bold text-center text-amber-800 focus:outline-none focus:border-amber-500"
                />
                <span className="font-bold text-amber-700">đơn vị</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-matte-black hover:bg-gray-900 text-white font-extrabold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer"
            >
              Lưu bảng cấu hình tổng hợp
            </button>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------
          SUB-MENU 4: DEVICE INTEGRATION
          ------------------------------------------------------------- */}
      {activeSubMenu === "integration" && (
        <form onSubmit={handleSaveIntegrations} className="space-y-6">
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-[#e5e5e5] pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
                  <Bot className="h-5 w-5 text-forest-green" />
                  KẾT NỐI API THIẾT BỊ NGOẠI VI & TELEGRAM BOT
                </h3>
                <p className="text-[11px] text-mid-gray font-sans mt-0.5">Tích hợp phần cứng sảnh chờ, máy in nhiệt POS Kiosk và đồng bộ hóa Telegram Bot KTV.</p>
              </div>

              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                Active integrations
              </span>
            </div>

            {/* Split grid for different peripherals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Telegram bot config */}
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <Send className="h-4 w-4 text-blue-500" />
                  Cấu hình Telegram Notification Webhook
                </span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-mid-gray">Telegram Bot Token</label>
                    <input
                      type="text"
                      required
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-mid-gray">Mã Chat ID Nhóm Báo Động</label>
                    <input
                      type="text"
                      required
                      value={telegramGroupChatId}
                      onChange={(e) => setTelegramGroupChatId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-slate-700"
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-mid-gray font-sans">Đồng bộ trạng thái lệnh Realtime với KTV Bot</span>
                    <button
                      type="button"
                      onClick={handleTestTelegramConnection}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-black uppercase text-[9px] rounded-lg tracking-wider"
                    >
                      Kiểm tra kết nối
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Kiosk API */}
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-amber-500" />
                  Cổng kết nối Kiosk tự phục vụ (Self-service Terminal)
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-mid-gray">Địa chỉ IP Kiosk</label>
                    <input
                      type="text"
                      required
                      value={kioskTerminalIp}
                      onChange={(e) => setKioskTerminalIp(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-mid-gray">Port</label>
                    <input
                      type="text"
                      required
                      value={kioskPort}
                      onChange={(e) => setKioskPort(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-center"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-mid-gray">API Secret Token key</label>
                  <input
                    type="password"
                    required
                    value={kioskSecret}
                    onChange={(e) => setKioskSecret(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* POS Printer */}
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                  <Printer className="h-4 w-4 text-forest-green" />
                  Máy in hóa đơn nhiệt POS (Thermal Printer Config)
                </span>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-mid-gray">Khổ giấy in biên nhận</label>
                    <select
                      value={printerWidth}
                      onChange={(e) => setPrinterWidth(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <option value="58">K58 (Khổ nhỏ 58mm - Tiết kiệm giấy)</option>
                      <option value="80">K80 (Khổ chuẩn 80mm - In rõ đầy đủ thông số)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-gray-150">
                    <div className="space-y-0.5">
                      <span className="font-extrabold block">Tự động in vé sảnh chờ</span>
                      <span className="text-[10px] text-mid-gray font-sans">In biên nhận ngay khi khách đặt đơn trên Kiosk</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoPrintTicket(!autoPrintTicket)}
                      className={`h-6 w-11 rounded-full p-0.5 transition-all ${
                        autoPrintTicket ? "bg-forest-green" : "bg-gray-200"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                        autoPrintTicket ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* AWS S3 Backup Config */}
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150 flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-matte-black uppercase tracking-wider block border-b border-gray-200 pb-2 flex items-center gap-1.5">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                    Đồng bộ & Lưu trữ Sao lưu (Disaster Recovery S3)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1">
                      <label className="font-bold text-mid-gray">S3 Bucket Name</label>
                      <input
                        type="text"
                        required
                        value={s3Bucket}
                        onChange={(e) => setS3Bucket(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-[10px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-mid-gray">S3 AWS Region</label>
                      <input
                        type="text"
                        required
                        value={s3Region}
                        onChange={(e) => setS3Region(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center gap-2">
                  <span className="text-[10px] text-mid-gray">Bản sao lưu tự động chạy 2:00 AM mỗi ngày</span>
                  <button
                    type="button"
                    onClick={handleSimulateRestore}
                    className="px-3.5 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 font-black uppercase text-[9px] rounded-lg tracking-wider"
                  >
                    Khôi phục bản lưu
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-matte-black hover:bg-gray-900 text-white font-extrabold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer"
              >
                Lưu cấu hình thiết bị ngoại vi
              </button>
            </div>
          </div>
        </form>
      )}

      {/* -------------------------------------------------------------
          SUB-MENU 5: AUDIT TRAIL LOGS
          ------------------------------------------------------------- */}
      {activeSubMenu === "audit" && (
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[#e5e5e5] pb-3 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600" />
                SỔ NHẬT KÝ BẢO MẬT & KIỂM TOÁN HỆ THỐNG (AUDIT TRAIL LOGS)
              </h3>
              <p className="text-[11px] text-mid-gray font-sans mt-0.5">Nhật ký không thể tẩy xóa tự động ghi nhận thời gian thực mọi biến động cấu hình và tác vụ đặc quyền.</p>
            </div>
            
            <button
              onClick={() => {
                if (window.confirm("Xóa toàn bộ bộ nhớ log hiện tại của trình duyệt?")) {
                  localStorage.removeItem("wassup_rbac_audit_logs");
                  setAuditLogs([]);
                  showToast("Đã dọn dẹp nhật ký kiểm toán.");
                }
              }}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition"
            >
              Dọn dẹp logs
            </button>
          </div>

          {/* Table Filters bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150 text-xs font-sans">
            {/* Search query */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-mid-gray" />
              <input
                type="text"
                placeholder="Tìm nội dung, người tác động..."
                value={searchAuditQuery}
                onChange={(e) => setSearchAuditQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter Actor */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-mid-gray shrink-0">Actor:</span>
              <select
                value={auditFilterActor}
                onChange={(e) => setAuditFilterActor(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5"
              >
                <option value="all">Tất cả</option>
                <option value="admin">Chỉ Admin</option>
                <option value="manager">Chỉ Quản lý</option>
                <option value="system">Chỉ Hệ thống</option>
              </select>
            </div>

            {/* Filter Module */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-mid-gray shrink-0">Module:</span>
              <select
                value={auditFilterModule}
                onChange={(e) => setAuditFilterModule(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5"
              >
                <option value="all">Tất cả</option>
                {MODULE_KEYS.map(m => (
                  <option key={m.id} value={m.key}>{m.name.replace("Module ", "M")}</option>
                ))}
              </select>
            </div>

            {/* Filter Type */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-mid-gray shrink-0">Hành vi:</span>
              <select
                value={auditFilterType}
                onChange={(e) => setAuditFilterType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
              >
                <option value="all">Tất cả</option>
                <option value="CREATE">CREATE (Thêm)</option>
                <option value="UPDATE">UPDATE (Sửa)</option>
                <option value="DELETE">DELETE (Xóa)</option>
                <option value="SYSTEM">SYSTEM (Hệ thống)</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-gray-50 text-mid-gray font-bold border-b border-gray-200 text-[10px] uppercase">
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3">Người Thao Tác (Actor)</th>
                    <th className="p-3">Phân Hệ (Module)</th>
                    <th className="p-3">Hành Vi</th>
                    <th className="p-3">Nội Dung Chi Tiết Biến Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-mid-gray">
                        Không tìm thấy nhật ký kiểm toán nào khớp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/40 transition">
                        <td className="p-3 font-mono text-mid-gray text-[10px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="p-3 font-semibold text-matte-black whitespace-nowrap">
                          {log.actor}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-mono font-bold uppercase">
                            {log.module}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                            log.type === "CREATE" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                            log.type === "UPDATE" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                            log.type === "DELETE" ? "bg-red-50 text-red-800 border border-red-200 animate-pulse" :
                            "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-matte-black leading-relaxed">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODALS SECTION (ADD / EDIT STAFF)
          ------------------------------------------------------------- */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-matte-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-[#e5e5e5] w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddStaffModal(false)}
              className="absolute top-4 right-4 text-mid-gray hover:text-matte-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-black font-display tracking-wider text-matte-black uppercase mb-4 flex items-center gap-2 border-b border-[#e5e5e5] pb-3">
              <Users className="h-5 w-5 text-purple-600" />
              THÊM THÀNH VIÊN NHÂN SỰ MỚI
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đỗ Gia Bảo"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0918374920"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-mid-gray uppercase">Vai trò (Role)</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
                  >
                    <option value="technician">Kỹ thuật viên</option>
                    <option value="manager">Quản lý trạm</option>
                    <option value="accountant">Kế toán</option>
                    <option value="master_admin">Master Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-mid-gray uppercase">Mã PIN đăng nhập</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Mặc định: 123456"
                    value={staffForm.pin}
                    onChange={(e) => setStaffForm({ ...staffForm, pin: e.target.value })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-widest text-center text-matte-black focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase block flex justify-between">
                  <span>Mã Chat ID Telegram (Nếu có)</span>
                  <span className="text-[9px] text-purple-600 font-semibold normal-case">Để đồng bộ Telegram Bot KTV</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 582910482"
                  value={staffForm.telegramChatId}
                  onChange={(e) => setStaffForm({ ...staffForm, telegramChatId: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-mono text-matte-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-mid-gray hover:bg-gray-50 text-xs font-extrabold uppercase transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase transition shadow-sm"
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditStaffModal && selectedStaff && (
        <div className="fixed inset-0 bg-matte-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-[#e5e5e5] w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowEditStaffModal(false);
                setSelectedStaff(null);
              }}
              className="absolute top-4 right-4 text-mid-gray hover:text-matte-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-black font-display tracking-wider text-matte-black uppercase mb-4 flex items-center gap-2 border-b border-[#e5e5e5] pb-3">
              <Edit className="h-5 w-5 text-purple-600" />
              SỬA THÀNH VIÊN NHÂN SỰ
            </h3>

            <form onSubmit={handleSaveEditStaff} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase">Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-mid-gray uppercase">Vai trò (Role)</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-purple-500"
                  >
                    <option value="technician">Kỹ thuật viên</option>
                    <option value="manager">Quản lý trạm</option>
                    <option value="accountant">Kế toán</option>
                    <option value="master_admin">Master Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-mid-gray uppercase">Mã PIN đăng nhập</label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={staffForm.pin}
                    onChange={(e) => setStaffForm({ ...staffForm, pin: e.target.value })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-mono font-bold tracking-widest text-center text-matte-black focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-mid-gray uppercase block flex justify-between">
                  <span>Mã Chat ID Telegram (Nếu có)</span>
                  <span className="text-[9px] text-purple-600 font-semibold normal-case">Đồng bộ Telegram Bot KTV</span>
                </label>
                <input
                  type="text"
                  placeholder="Chưa cấu hình Chat ID"
                  value={staffForm.telegramChatId}
                  onChange={(e) => setStaffForm({ ...staffForm, telegramChatId: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-mono text-matte-black focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditStaffModal(false);
                    setSelectedStaff(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-mid-gray hover:bg-gray-50 text-xs font-extrabold uppercase transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase transition shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
