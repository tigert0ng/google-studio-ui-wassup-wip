import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Sparkles,
  Settings,
  Clock,
  DollarSign,
  Plus,
  Check,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Trash2,
  Eye,
  Activity,
  Award,
  History,
  Image as ImageIcon,
  Tag,
  ChevronRight,
  TrendingUp,
  Sliders,
  Palette,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  EyeOff,
  Hammer,
  PackageOpen,
  ArrowRightLeft
} from "lucide-react";
import { Service } from "../../types/order.types";
import { SERVICES_CATALOG, ADDONS_CATALOG } from "../../lib/services";
import { MarkdownTextarea, MarkdownRenderer } from "./shared/Markdown";

// Define the interface for a BOM Line Item
interface BomLine {
  itemId: string;
  itemName: string;
  amount: number;
  unit: string;
}

interface PriceProposal {
  id: string;
  serviceId: string;
  serviceName: string;
  currentPrice: number;
  proposedPrice: number;
  proposedBy: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

interface AdjustmentLog {
  id: string;
  serviceId: string;
  serviceName: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  updatedBy: string;
}

export const renderRichText = (text: string) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&lt;u&gt;/g, "<u>")
    .replace(/&lt;\/u&gt;/g, "</u>")
    .replace(/&lt;span class="([^"]+)"&gt;/g, '<span class="$1">')
    .replace(/&lt;\/span&gt;/g, "</span>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-[10px]'>$1</code>")
    .replace(/\n- ([^\n]+)/g, "<br/>• $1")
    .replace(/\n1\. ([^\n]+)/g, "<br/>1. $1")
    .replace(/\n/g, "<br/>");
  return html;
};

// Default Inventory items to map BOM to, in case storage is empty
const FALLBACK_INVENTORY = [
  { id: "inv-01", name: "Dầu bóng lốp xe Sonax Xtreme", unit: "Chai 500ml" },
  { id: "inv-02", name: "Hóa chất bọt tuyết siêu đậm đặc WASSUP SOAP", unit: "Can 20L" },
  { id: "inv-03", name: "Đất sét tẩy ố bụi sơn 3M Claybar", unit: "Cục 200g" },
  { id: "inv-04", name: "Nước xịt kính chuyên dụng WASSUP GLASS", unit: "Chai 1L" },
  { id: "inv-05", name: "Khăn lau Microfiber siêu mịn 30x30", unit: "Cái" }
];

export default function ServicesModule() {
  // Packages (W0 - W5)
  const [packages, setPackages] = useState<Service[]>(() => {
    const saved = localStorage.getItem("wassup_packages");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SERVICES_CATALOG;
      }
    }
    return SERVICES_CATALOG;
  });

  // Addons (Individual services)
  const [addons, setAddons] = useState<Service[]>(() => {
    const saved = localStorage.getItem("wassup_addons");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ADDONS_CATALOG;
      }
    }
    return ADDONS_CATALOG;
  });

  // ---------------------------------------------------------
  // BOM (HỆ THỐNG ĐỊNH MỨC) STATE
  // ---------------------------------------------------------
  const [boms, setBoms] = useState<Record<string, BomLine[]>>(() => {
    const saved = localStorage.getItem("wassup_service_boms");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default initial seeded BOM lines (Module 5-6 integration)
    // Packages W0 to W4 have valid BOMs, while W5 is left empty to test the validation blocker!
    return {
      w0: [{ itemId: "inv-02", itemName: "Hóa chất bọt tuyết siêu đậm đặc WASSUP SOAP", amount: 0.05, unit: "Can 20L" }],
      w1: [
        { itemId: "inv-02", itemName: "Hóa chất bọt tuyết siêu đậm đặc WASSUP SOAP", amount: 0.1, unit: "Can 20L" },
        { itemId: "inv-05", itemName: "Khăn lau Microfiber siêu mịn 30x30", amount: 1, unit: "Cái" }
      ],
      w2: [
        { itemId: "inv-02", itemName: "Hóa chất bọt tuyết siêu đậm đặc WASSUP SOAP", amount: 0.15, unit: "Can 20L" },
        { itemId: "inv-03", itemName: "Đất sét tẩy ố bụi sơn 3M Claybar", amount: 0.5, unit: "Cục 200g" }
      ],
      w3: [
        { itemId: "inv-02", itemName: "Hóa chất bọt tuyết siêu đậm đặc WASSUP SOAP", amount: 0.2, unit: "Can 20L" },
        { itemId: "inv-03", itemName: "Đất sét tẩy ố bụi sơn 3M Claybar", amount: 1, unit: "Cục 200g" },
        { itemId: "inv-01", itemName: "Dầu bóng lốp xe Sonax Xtreme", amount: 0.2, unit: "Chai 500ml" }
      ],
      w4: [
        { itemId: "inv-02", itemName: "Hóa chất bọt tuyết siêu đậm đặc WASSUP SOAP", amount: 0.25, unit: "Can 20L" },
        { itemId: "inv-01", itemName: "Dầu bóng lốp xe Sonax Xtreme", amount: 0.5, unit: "Chai 500ml" },
        { itemId: "inv-03", itemName: "Đất sét tẩy ố bụi sơn 3M Claybar", amount: 1, unit: "Cục 200g" }
      ]
      // W5 starts empty to show the validation blocker!
    };
  });

  // Get current inventory items list from storage if exists, fallback to predefined list
  const [inventoryList, setInventoryList] = useState<any[]>(() => {
    const saved = localStorage.getItem("wassup_inventory_items");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return FALLBACK_INVENTORY;
  });

  // Add material line state inside BOM drawer tab
  const [selectedBomItemId, setSelectedBomItemId] = useState("");
  const [bomAmountInput, setBomAmountInput] = useState("0.1");

  // Price change proposals (Admin approval flow)
  const [proposals, setProposals] = useState<PriceProposal[]>(() => {
    const saved = localStorage.getItem("wassup_proposals");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "prop-01",
        serviceId: "w1",
        serviceName: "Rửa Xe Phổ Thông (W1)",
        currentPrice: 150000,
        proposedPrice: 170000,
        proposedBy: "Trần Thị D (Kế toán)",
        status: "pending",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  });

  // Persistent adjustment logs history
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentLog[]>(() => {
    const saved = localStorage.getItem("wassup_adjustment_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "log-1",
        serviceId: "w1",
        serviceName: "Rửa Xe Phổ Thông (W1)",
        fieldChanged: "Giá",
        oldValue: "140.000 ₫",
        newValue: "150.000 ₫",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedBy: "Trần Thị D (Kế toán)"
      },
      {
        id: "log-2",
        serviceId: "w1",
        serviceName: "Rửa Xe Phổ Thông (W1)",
        fieldChanged: "Nhãn",
        oldValue: "Không có",
        newValue: "Best seller",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        updatedBy: "Nguyễn Văn Hùng (Quản Lý)"
      }
    ];
  });

  // Sidebar Drawer states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editColorType, setEditColorType] = useState<'normal' | 'primary' | 'gold' | 'custom'>('normal');
  const [editLabel, setEditLabel] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editorTab, setEditorTab] = useState<"write" | "preview" | "bom">("write");
  const [deleteConfirmCode, setDeleteConfirmCode] = useState("");

  const insertFormat = (formatType: string) => {
    const textarea = document.querySelector('form#edit-service-form textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    switch (formatType) {
      case 'bold':
        replacement = `**${selectedText || 'chữ đậm'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'chữ nghiêng'}*`;
        break;
      case 'underline':
        replacement = `<u>${selectedText || 'gạch chân'}</u>`;
        break;
      case 'code':
        replacement = `\`${selectedText || 'mã nguồn'}\``;
        break;
      case 'bullet':
        replacement = `\n- ${selectedText || 'mục mới'}`;
        break;
      case 'number':
        replacement = `\n1. ${selectedText || 'mục mới'}`;
        break;
      case 'header':
        replacement = `\n### ${selectedText || 'Tiêu đề phụ'}`;
        break;
      case 'color-green':
        replacement = `<span class="text-forest-green font-bold">${selectedText || 'chữ xanh'}</span>`;
        break;
      case 'color-gold':
        replacement = `<span class="text-warm-gold font-bold">${selectedText || 'chữ vàng'}</span>`;
        break;
      case 'color-red':
        replacement = `<span class="text-red-500 font-bold">${selectedText || 'chữ đỏ'}</span>`;
        break;
      case 'template-standard':
        replacement = `**Quy trình chuẩn**:
- Bước 1: Vệ sinh bề mặt sâu
- Bước 2: Thi công dưỡng chất chuyên dụng
- Bước 3: Kiểm tra chất lượng ánh sáng kép

**Cam kết**: Sạch sâu bóng loáng, an toàn 100%.`;
        break;
      case 'template-premium':
        replacement = `**Dịch vụ VIP 5 sao**:
- Phủ nano bảo vệ cao cấp
- Khử trùng Ozone nội thất toàn diện
- Dưỡng da/nhựa nội thất bằng dung dịch Meguiar's cao cấp

*Bảo hành chính hãng 12 tháng.*`;
        break;
      default:
        return;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setEditDescription(newValue);
    
    // Refocus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Modals & triggers
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalPrice, setProposalPrice] = useState("");
  const [proposalServiceId, setProposalServiceId] = useState("");
  
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    code: "",
    name: "",
    type: "package" as "package" | "addon",
    price: "",
    description: "",
    duration: "30",
    thumbnail: ""
  });

  // Toast / messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("wassup_packages", JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem("wassup_addons", JSON.stringify(addons));
  }, [addons]);

  useEffect(() => {
    localStorage.setItem("wassup_proposals", JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem("wassup_adjustment_history", JSON.stringify(adjustmentHistory));
  }, [adjustmentHistory]);

  useEffect(() => {
    localStorage.setItem("wassup_service_boms", JSON.stringify(boms));
  }, [boms]);

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Open sidebar with pre-loaded values
  const handleOpenEditSidebar = (service: Service) => {
    setSelectedService(service);
    setEditName(service.name);
    setEditPrice(service.price.toString());
    setEditColorType(service.colorType || 'normal');
    setEditLabel(service.label || "");
    setEditTags(service.tags ? service.tags.join(", ") : "");
    setEditDuration((service.duration || 30).toString());
    setEditDescription(service.description || "");
    setEditThumbnail(service.thumbnail || "");
    setEditorTab("write"); // default tab
    setDeleteConfirmCode("");
    
    // Default selection for BOM adding list
    const firstAvailableInv = inventoryList[0]?.id || "";
    setSelectedBomItemId(firstAvailableInv);
    setBomAmountInput("0.1");

    setIsSidebarOpen(true);
  };

  // Process saving changes from sidebar & log history
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const newPrice = Number(editPrice);
    const newDuration = Number(editDuration);
    const newTags = editTags.split(",").map(t => t.trim()).filter(t => t.length > 0);

    const updated: Service = {
      ...selectedService,
      name: editName,
      price: newPrice,
      colorType: editColorType,
      label: editLabel,
      tags: newTags,
      duration: newDuration,
      description: editDescription,
      thumbnail: editThumbnail
    };

    // Construct detailed adjustment logs
    const logsToAdd: AdjustmentLog[] = [];
    const timestamp = new Date().toISOString();
    const updatedBy = "Nguyễn Văn Hùng (Quản lý)";

    if (selectedService.name !== editName) {
      logsToAdd.push({
        id: `log_${Date.now()}_name`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "Tên dịch vụ",
        oldValue: selectedService.name,
        newValue: editName,
        timestamp,
        updatedBy
      });
    }

    if (selectedService.price !== newPrice) {
      logsToAdd.push({
        id: `log_${Date.now()}_price`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "Đơn giá",
        oldValue: formatVnd(selectedService.price),
        newValue: formatVnd(newPrice),
        timestamp,
        updatedBy
      });
    }

    if ((selectedService.colorType || 'normal') !== editColorType) {
      logsToAdd.push({
        id: `log_${Date.now()}_color`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "Màu sắc thẻ",
        oldValue: selectedService.colorType || 'normal',
        newValue: editColorType,
        timestamp,
        updatedBy
      });
    }

    if ((selectedService.label || '') !== editLabel) {
      logsToAdd.push({
        id: `log_${Date.now()}_label`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "Nhãn hiển thị",
        oldValue: selectedService.label || "Không có",
        newValue: editLabel || "Trống",
        timestamp,
        updatedBy
      });
    }

    if ((selectedService.duration || 30) !== newDuration) {
      logsToAdd.push({
        id: `log_${Date.now()}_duration`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "Thời lượng",
        oldValue: `${selectedService.duration || 30} phút`,
        newValue: `${newDuration} phút`,
        timestamp,
        updatedBy
      });
    }

    // Apply updates to local lists
    if (selectedService.type === "package") {
      setPackages(packages.map(p => p.id === selectedService.id ? updated : p));
    } else {
      setAddons(addons.map(a => a.id === selectedService.id ? updated : a));
    }

    // Save logs to history
    if (logsToAdd.length > 0) {
      setAdjustmentHistory([...logsToAdd, ...adjustmentHistory]);
    }

    setSelectedService(updated);
    setIsSidebarOpen(false);
    showToast(`Đã lưu thay đổi cho dịch vụ ${selectedService.code} và cập nhật lịch sử!`);
  };

  // BOM Material adding action
  const handleAddBomItem = () => {
    if (!selectedService || !selectedBomItemId) return;
    const itemToAdd = inventoryList.find(i => i.id === selectedBomItemId);
    if (!itemToAdd) return;

    const currentBom = boms[selectedService.id] || [];
    
    // Check if item already exists in this BOM formula
    if (currentBom.some(b => b.itemId === selectedBomItemId)) {
      showToast("Vật tư này đã có trong định mức BOM của dịch vụ!");
      return;
    }

    const newLine: BomLine = {
      itemId: selectedBomItemId,
      itemName: itemToAdd.name,
      amount: Number(bomAmountInput) || 1,
      unit: itemToAdd.unit
    };

    const updatedBom = [...currentBom, newLine];
    const newBoms = { ...boms, [selectedService.id]: updatedBom };
    setBoms(newBoms);
    localStorage.setItem("wassup_service_boms", JSON.stringify(newBoms));

    // Also add to audit adjustment history
    setAdjustmentHistory([
      {
        id: `log_bom_add_${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "BOM (Thêm định mức)",
        oldValue: "—",
        newValue: `${newLine.itemName} x ${newLine.amount} ${newLine.unit}`,
        timestamp: new Date().toISOString(),
        updatedBy: "Nguyễn Văn Hùng (Quản lý)"
      },
      ...adjustmentHistory
    ]);

    showToast(`Đã thêm định mức vật tư: ${newLine.itemName}!`);
  };

  // BOM Material removal action
  const handleRemoveBomItem = (itemId: string) => {
    if (!selectedService) return;
    const currentBom = boms[selectedService.id] || [];
    const removedItem = currentBom.find(b => b.itemId === itemId);
    if (!removedItem) return;

    const updatedBom = currentBom.filter(b => b.itemId !== itemId);
    const newBoms = { ...boms, [selectedService.id]: updatedBom };
    setBoms(newBoms);
    localStorage.setItem("wassup_service_boms", JSON.stringify(newBoms));

    // Prepend change to log
    setAdjustmentHistory([
      {
        id: `log_bom_del_${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        fieldChanged: "BOM (Xóa định mức)",
        oldValue: `${removedItem.itemName} x ${removedItem.amount} ${removedItem.unit}`,
        newValue: "Đã xóa bỏ",
        timestamp: new Date().toISOString(),
        updatedBy: "Nguyễn Văn Hùng (Quản lý)"
      },
      ...adjustmentHistory
    ]);

    showToast(`Đã gỡ định mức vật tư ${removedItem.itemName}`);
  };

  // Handle Proposals approval
  const handleApproveProposal = (id: string) => {
    const prop = proposals.find(p => p.id === id);
    if (!prop) return;

    const sId = prop.serviceId;
    if (packages.find(p => p.id === sId)) {
      setPackages(packages.map(p => (p.id === sId ? { ...p, price: prop.proposedPrice } : p)));
    } else {
      setAddons(addons.map(a => (a.id === sId ? { ...a, price: prop.proposedPrice } : a)));
    }

    const timestamp = new Date().toISOString();
    const updatedBy = "Admin (Duyệt Đề Xuất)";
    const serviceName = prop.serviceName;

    setAdjustmentHistory([
      {
        id: `log_approve_${Date.now()}`,
        serviceId: sId,
        serviceName,
        fieldChanged: "Đơn giá (Phê duyệt đề xuất)",
        oldValue: formatVnd(prop.currentPrice),
        newValue: formatVnd(prop.proposedPrice),
        timestamp,
        updatedBy
      },
      ...adjustmentHistory
    ]);

    setProposals(proposals.map(p => (p.id === id ? { ...p, status: "approved" as const } : p)));
    showToast(`Đã duyệt đề xuất giá mới cho ${prop.serviceName}: ${formatVnd(prop.proposedPrice)}.`);
  };

  const handleRejectProposal = (id: string) => {
    setProposals(proposals.map(p => (p.id === id ? { ...p, status: "rejected" as const } : p)));
    showToast("Đã từ chối đề xuất điều chỉnh bảng giá.");
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceToPropose = packages.find(p => p.id === proposalServiceId) || addons.find(a => a.id === proposalServiceId);
    if (!serviceToPropose || !proposalPrice) {
      showToast("Vui lòng nhập đầy đủ thông tin đề xuất!");
      return;
    }

    const prop: PriceProposal = {
      id: "prop_" + Date.now(),
      serviceId: serviceToPropose.id,
      serviceName: `${serviceToPropose.name} (${serviceToPropose.code})`,
      currentPrice: serviceToPropose.price,
      proposedPrice: Number(proposalPrice),
      proposedBy: "Nguyễn Văn Hùng (Quản Lý)",
      status: "pending",
      timestamp: new Date().toISOString()
    };

    setProposals([prop, ...proposals]);
    setProposalPrice("");
    setProposalServiceId("");
    setShowProposalModal(false);
    showToast("Đã gửi đề xuất điều chỉnh bảng giá lên Master Admin xét duyệt!");
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.code.trim() || !newServiceForm.name.trim() || !newServiceForm.price.trim()) {
      showToast("Vui lòng điền đầy đủ thông tin dịch vụ!");
      return;
    }

    const newS: Service = {
      id: "service_" + Date.now(),
      code: newServiceForm.code.toUpperCase().trim(),
      name: newServiceForm.name.trim(),
      type: newServiceForm.type,
      price: Number(newServiceForm.price),
      description: newServiceForm.description.trim(),
      createdAt: new Date().toISOString(),
      duration: Number(newServiceForm.duration || "30"),
      thumbnail: newServiceForm.thumbnail || undefined,
      colorType: 'normal'
    };

    if (newS.type === "package") {
      setPackages([...packages, newS]);
    } else {
      setAddons([...addons, newS]);
    }

    // Seed empty BOM list for any new service
    setBoms({ ...boms, [newS.id]: [] });

    showToast(`Đã thêm thành công dịch vụ: ${newS.name}!`);
    setShowAddServiceModal(false);
    setNewServiceForm({
      code: "",
      name: "",
      type: "package",
      price: "",
      description: "",
      duration: "30",
      thumbnail: ""
    });
  };

  const handleDeleteService = (id: string, type: "package" | "addon", bypassConfirm = false) => {
    if (bypassConfirm || confirm("Bạn có chắc chắn muốn xóa dịch vụ này khỏi danh mục không?")) {
      if (type === "package") {
        setPackages(packages.filter(p => p.id !== id));
      } else {
        setAddons(addons.filter(a => a.id !== id));
      }
      if (selectedService?.id === id) {
        setSelectedService(null);
        setIsSidebarOpen(false);
      }
      showToast("Đã xóa dịch vụ khỏi danh mục thành công.");
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST BANNER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-matte-black text-brand-green px-5 py-3.5 rounded-xl border border-brand-green/30 shadow-2xl flex items-center gap-3 font-sans text-xs font-bold"
          >
            <CheckCircle2 className="h-4 w-4 animate-bounce text-brand-green" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#e5e5e5] p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-forest-green" />
        <div className="pl-2">
          <h1 className="text-2xl font-black font-display text-matte-black uppercase tracking-tight">BẢNG GIÁ DỊCH VỤ & TIÊU CHUẨN KỸ THUẬT</h1>
          <p className="text-mid-gray text-xs mt-1 font-sans">
            Quản lý bảng giá các gói rửa xe (W0-W5), dịch vụ bổ trợ lẻ, định mức vật tư hao phí (BOM) và xem lịch sử điều chỉnh giá.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setShowAddServiceModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#e5e5e5] hover:bg-warm-white text-matte-black text-xs font-extrabold font-display uppercase transition cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            TẠO DỊCH VỤ MỚI
          </button>
          
          <button
            onClick={() => {
              if (packages.length > 0) {
                setProposalServiceId(packages[0].id);
                setProposalPrice(packages[0].price.toString());
              }
              setShowProposalModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-matte-black text-white hover:bg-gray-900 text-xs font-extrabold font-display uppercase transition shadow-md cursor-pointer"
          >
            <DollarSign className="h-4 w-4 stroke-[2.5]" />
            ĐỀ XUẤT ĐỔI GIÁ
          </button>
        </div>
      </div>

      {/* PRICE PROPOSALS WARNING */}
      {proposals.filter(p => p.status === "pending").length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-amber-900">🔒 CÓ ĐỀ XUẤT THAY ĐỔI GIÁ CHỜ PHÊ DUYỆT</h4>
              <p className="text-xs text-amber-800 leading-snug mt-0.5 font-sans">
                Hệ thống ghi nhận có đề xuất giá mới đang chờ phê duyệt từ Ban quản trị trước khi áp dụng lên Kiosk khách hàng.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-amber-500/10">
            {proposals.filter(p => p.status === "pending").map((p) => (
              <div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-amber-500/15 gap-3.5 text-xs">
                <div>
                  <span className="font-extrabold text-matte-black text-sm">{p.serviceName}</span>
                  <div className="text-[10px] text-mid-gray mt-0.5">
                    Đề xuất bởi: <strong>{p.proposedBy}</strong> · Giá hiện tại: <span className="line-through">{formatVnd(p.currentPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-sans text-forest-green font-black text-sm">
                    Giá đề xuất: {formatVnd(p.proposedPrice)}
                  </span>
                  
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleApproveProposal(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-forest-green text-white text-[10px] font-black uppercase font-display cursor-pointer flex items-center gap-1"
                    >
                      <Check className="h-3 w-3 stroke-[3]" /> DUYỆT GIÁ
                    </button>
                    <button
                      onClick={() => handleRejectProposal(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase font-display cursor-pointer flex items-center gap-1"
                    >
                      <X className="h-3 w-3 stroke-[3]" /> TỪ CHỐI
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATALOG DISPLAY GRIDS */}
      <div className="space-y-10">
        
        {/* SECTION 1: PACKAGES W0-W5 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
            <h2 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
              <Layers className="h-5 w-5 text-forest-green" />
              GÓI DỊCH VỤ TIÊU CHUẨN (W0 - W5)
            </h2>
            <span className="text-[10px] font-bold text-mid-gray bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {packages.length} gói cước
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              // BOM validation indicators for high-fidelity PRD requirement
              const bomLines = boms[pkg.id] || [];
              const hasBom = bomLines.length > 0;

              let cardBg = "bg-white border-[#e5e5e5] hover:border-[#bcbcbc]";
              let textTitleColor = "text-matte-black font-bold";
              let textPriceColor = "text-forest-green";
              let textDescColor = "text-mid-gray";
              let badgeStyle = "bg-matte-black text-white";
              let durationBadge = "bg-gray-100 text-matte-black";
              let tagStyle = "bg-gray-50 text-slate-700 border-gray-200";

              if (pkg.colorType === 'primary') {
                cardBg = "bg-brand-green border-brand-green/30 shadow-lg shadow-brand-green/10";
                textTitleColor = "text-matte-black font-black";
                textPriceColor = "text-matte-black";
                textDescColor = "text-slate-800/90";
                badgeStyle = "bg-matte-black text-brand-green";
                durationBadge = "bg-white/40 text-matte-black";
                tagStyle = "bg-white/30 text-matte-black border-transparent";
              } else if (pkg.colorType === 'gold') {
                cardBg = "bg-warm-gold border-amber-600/20 shadow-lg shadow-warm-gold/15";
                textTitleColor = "text-white font-black";
                textPriceColor = "text-yellow-100";
                textDescColor = "text-amber-50/90";
                badgeStyle = "bg-white text-warm-gold";
                durationBadge = "bg-white/20 text-white";
                tagStyle = "bg-white/10 text-white border-transparent";
              } else if (pkg.colorType === 'custom') {
                cardBg = "bg-matte-black border-matte-black/30 shadow-lg shadow-black/10 text-white";
                textTitleColor = "text-brand-green font-black";
                textPriceColor = "text-white";
                textDescColor = "text-slate-300";
                badgeStyle = "bg-brand-green text-matte-black";
                durationBadge = "bg-white/15 text-white";
                tagStyle = "bg-white/10 text-white border-transparent";
              }

              return (
                <div
                  key={pkg.id}
                  onClick={() => handleOpenEditSidebar(pkg)}
                  className={`p-6 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[210px] relative group overflow-hidden hover:-translate-y-1 ${cardBg}`}
                >
                  {pkg.colorType === 'gold' && (
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                  )}
                  {pkg.colorType === 'primary' && (
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-black/5 rounded-full blur-xl group-hover:bg-black/10 transition-all duration-500" />
                  )}
                  {pkg.colorType === 'custom' && (
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-500" />
                  )}

                  <div>
                    <div className="flex justify-between items-start gap-2 relative z-10">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black font-sans tracking-wider opacity-60 uppercase">{pkg.code}</span>
                          
                          {pkg.label && (
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest ${badgeStyle}`}>
                              {pkg.label}
                            </span>
                          )}

                          {/* BOM Status Badge (Module 5-6 integration) */}
                          {hasBom ? (
                            <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                              ✓ BOM: {bomLines.length} VT
                            </span>
                          ) : (
                            <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                              ⚠️ BOM Rỗng (Blocked)
                            </span>
                          )}
                        </div>
                        <h4 className={`font-display text-base uppercase tracking-tight mt-1.5 ${textTitleColor}`}>
                          {pkg.name}
                        </h4>
                      </div>
                    </div>

                    <div className={`text-[11px] font-sans mt-3.5 leading-relaxed relative z-10 ${textDescColor}`}>
                      <MarkdownRenderer text={pkg.description || "Chưa có mô tả chi tiết cho gói dịch vụ tiêu chuẩn này."} />
                    </div>
                  </div>

                  {/* Badges footer */}
                  <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap justify-between items-center gap-2 relative z-10">
                    <div className="flex items-center gap-1">
                      <span className={`font-sans font-bold text-lg ${textPriceColor}`}>
                        {formatVnd(pkg.price)}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 rounded-lg ${durationBadge}`}>
                      <Clock className="h-3.5 w-3.5 opacity-85" />
                      <span>{pkg.duration || 30} phút</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: INDIVIDUAL/ADDON SERVICES */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
            <h2 className="text-sm font-extrabold font-display tracking-wider text-matte-black uppercase flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-forest-green" />
              CÁC GÓI DỊCH VỤ LẺ (ADD-ONS)
            </h2>
            <span className="text-[10px] font-bold text-mid-gray bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {addons.length} dịch vụ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {addons.map((add) => {
              const addBomLines = boms[add.id] || [];
              const hasBom = addBomLines.length > 0;

              let cardBg = "bg-white border-gray-200/70 hover:border-gray-300 hover:shadow-lg";
              let textTitleColor = "text-matte-black group-hover:text-forest-green transition-colors";
              let textDescColor = "text-mid-gray";
              let textPriceColor = "text-forest-green";
              let textDurationColor = "text-mid-gray";

              if (add.colorType === 'primary') {
                cardBg = "bg-brand-green border-brand-green/30 hover:border-brand-green-dark shadow-md";
                textTitleColor = "text-matte-black font-black";
                textDescColor = "text-emerald-950/80";
                textPriceColor = "text-matte-black";
                textDurationColor = "text-emerald-950/80";
              } else if (add.colorType === 'gold') {
                cardBg = "bg-warm-gold border-amber-600/20 hover:border-amber-600/40 shadow-md";
                textTitleColor = "text-white font-black";
                textDescColor = "text-amber-50/90";
                textPriceColor = "text-white";
                textDurationColor = "text-amber-100";
              } else if (add.colorType === 'custom') {
                cardBg = "bg-matte-black border-matte-black/30 hover:border-neutral-800 shadow-md text-white";
                textTitleColor = "text-brand-green font-black";
                textDescColor = "text-slate-300";
                textPriceColor = "text-white";
                textDurationColor = "text-slate-400";
              }

              return (
                <div
                  key={add.id}
                  onClick={() => handleOpenEditSidebar(add)}
                  className={`group cursor-pointer rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${cardBg}`}
                >
                  <div>
                    {/* Thumbnail Ratio 1:1 image container */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100 mb-3.5">
                      <img 
                        src={add.thumbnail || "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=300&h=300"} 
                        alt={add.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <span className="bg-matte-black/75 backdrop-blur-sm text-white font-sans text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                          {add.code}
                        </span>
                        
                        {/* BOM visual tag on Add-on */}
                        {hasBom ? (
                          <span className="bg-emerald-500/90 text-white font-sans text-[7px] font-black px-1.5 py-0.5 rounded tracking-wide">
                            ✓ BOM: {addBomLines.length} VT
                          </span>
                        ) : (
                          <span className="bg-rose-600/95 text-white font-sans text-[7px] font-black px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                            ⚠️ BOM Rỗng (Blocked)
                          </span>
                        )}
                      </div>

                      {add.label && (
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-brand-green text-matte-black font-sans text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                            {add.label}
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-matte-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg text-[9px] font-black text-matte-black uppercase flex items-center gap-1 shadow-md">
                          <Sliders className="h-3 w-3" /> Cấu hình BOM
                        </div>
                      </div>
                    </div>

                    <h4 className={`font-display font-black text-xs leading-snug line-clamp-2 ${textTitleColor}`}>
                      {add.name}
                    </h4>
                    
                    <div className={`text-[10px] mt-1 font-sans line-clamp-2 leading-relaxed ${textDescColor}`}>
                      <MarkdownRenderer text={add.description || "Dịch vụ thi công lẻ tăng hiệu năng bảo quản xế yêu."} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-gray-100/30 flex items-center justify-between gap-1">
                    <span className={`font-sans font-bold text-base ${textPriceColor}`}>
                      {formatVnd(add.price)}
                    </span>
                    
                    <span className={`text-[9px] font-extrabold flex items-center gap-0.5 font-sans ${textDurationColor}`}>
                      <Clock className="h-3 w-3" /> {add.duration || 15}m
                    </span>
                  </div>
                </div>
              );
            })}

            {/* CREATE ADDON QUICK CARD */}
            <div
              onClick={() => {
                setNewServiceForm({ ...newServiceForm, type: "addon" });
                setShowAddServiceModal(true);
              }}
              className="group cursor-pointer bg-warm-white border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors h-full min-h-[250px]"
            >
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-mid-gray group-hover:scale-110 group-hover:bg-brand-green-light group-hover:text-forest-green transition-all mb-3 shadow-inner">
                <Plus className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-xs text-matte-black font-extrabold font-display uppercase tracking-wide">THÊM DỊCH VỤ LẺ</span>
              <span className="text-[10px] text-mid-gray mt-1 max-w-[150px] font-sans leading-relaxed">
                Tạo nhanh các gói phủ dưỡng, tinh dầu thơm hoặc vệ sinh bổ trợ.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* REDESIGNED SIDEBAR DRAWER - EDIT SERVICE FROM RIGHT */}
      <AnimatePresence>
        {isSidebarOpen && selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-matte-black/60 z-40 backdrop-blur-[2px]"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#e5e5e5] shadow-2xl z-50 overflow-y-auto flex flex-col justify-between font-sans text-xs"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center bg-warm-white relative">
                <div>
                  <span className="text-[9px] font-extrabold bg-matte-black text-white px-2 py-0.5 rounded uppercase tracking-widest font-sans">
                    Mã: {selectedService.code}
                  </span>
                  <h3 className="text-base font-black font-display text-matte-black uppercase mt-1">
                    Cấu Hình Dịch Vụ
                  </h3>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-mid-gray hover:text-matte-black hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>

              {/* TAB SWITCHER: Soạn thảo, Xem trước, Định mức vật tư BOM */}
              <div className="flex bg-gray-50 border-b border-[#e5e5e5] p-1 gap-1">
                <button
                  onClick={() => setEditorTab("write")}
                  className={`flex-1 py-2 font-display font-extrabold text-[10px] tracking-wider uppercase rounded-lg transition ${
                    editorTab === "write" ? "bg-white text-forest-green shadow-xs" : "text-mid-gray"
                  }`}
                >
                  Sửa Thông Tin
                </button>
                <button
                  onClick={() => setEditorTab("preview")}
                  className={`flex-1 py-2 font-display font-extrabold text-[10px] tracking-wider uppercase rounded-lg transition ${
                    editorTab === "preview" ? "bg-white text-forest-green shadow-xs" : "text-mid-gray"
                  }`}
                >
                  Xem Trước
                </button>
                <button
                  onClick={() => setEditorTab("bom")}
                  className={`flex-1 py-2 font-display font-extrabold text-[10px] tracking-wider uppercase rounded-lg transition flex items-center justify-center gap-1.5 ${
                    editorTab === "bom" ? "bg-emerald-600 text-white shadow-xs" : "text-mid-gray"
                  }`}
                >
                  <Hammer className="h-3.5 w-3.5" /> Định mức (BOM)
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                
                {editorTab === "write" && (
                  <form id="edit-service-form" onSubmit={handleSaveService} className="space-y-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">Ảnh minh họa (Tỷ lệ 1:1)</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">
                          {editThumbnail ? (
                            <img 
                              src={editThumbnail} 
                              alt="preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=300&h=300";
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-mid-gray/50" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            placeholder="Đường dẫn ảnh Unsplash..."
                            value={editThumbnail}
                            onChange={(e) => setEditThumbnail(e.target.value)}
                            className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2 text-[11px] text-matte-black focus:outline-none focus:border-forest-green"
                          />
                          <p className="text-[9px] text-mid-gray leading-tight">Nhập URL ảnh 1:1. Nếu để trống sẽ sử dụng ảnh mặc định của hệ thống.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">Tên hiển thị dịch vụ</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black font-semibold focus:outline-none focus:border-forest-green"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">Đơn giá thi công (VND)</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-8 pr-3 py-2.5 text-xs font-sans text-forest-green font-bold focus:outline-none focus:border-forest-green"
                        />
                        <DollarSign className="absolute left-2.5 top-3 h-4 w-4 text-forest-green opacity-75" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block flex items-center gap-1">
                        <Palette className="h-3.5 w-3.5" /> Màu sắc hiển thị thẻ
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { type: 'normal', label: 'Trắng tinh tế', class: 'bg-white border-gray-300 text-matte-black' },
                          { type: 'primary', label: 'Primary Green', class: 'bg-brand-green border-brand-green text-matte-black' },
                          { type: 'gold', label: 'Warm Gold', class: 'bg-warm-gold border-amber-600 text-white' },
                          { type: 'custom', label: 'Đen Mờ', class: 'bg-matte-black border-matte-black text-white' }
                        ].map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setEditColorType(item.type as any)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 hover:scale-105 ${item.class} ${
                              editColorType === item.type ? 'ring-2 ring-forest-green ring-offset-2 font-extrabold scale-105' : 'opacity-70'
                            }`}
                          >
                            <span className="text-[9px] uppercase tracking-tighter block leading-none">{item.label}</span>
                            {editColorType === item.type && <Check className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">Thời lượng thi công (phút)</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            value={editDuration}
                            onChange={(e) => setEditDuration(e.target.value)}
                            className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-8 pr-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                          />
                          <Clock className="absolute left-2.5 top-3 h-4 w-4 text-mid-gray opacity-75" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" /> Nhãn hiển thị đặc biệt
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Best seller, Hot, New"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                        />
                      </div>
                    </div>



                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block flex items-center gap-1">
                          <Type className="h-3.5 w-3.5 text-forest-green" /> Mô tả chi tiết gói dịch vụ
                        </label>
                      </div>

                      <MarkdownTextarea
                        id="services-edit-desc"
                        placeholder="Nhập mô tả các tính năng gói dịch vụ..."
                        value={editDescription}
                        onChange={(val) => setEditDescription(val)}
                        rows={5}
                      />
                    </div>

                  </form>
                )}

                {editorTab === "preview" && (
                  <div className="bg-[#fcfbf9] border border-[#e5e5e5] rounded-xl p-4 min-h-[220px] text-xs text-matte-black leading-relaxed font-sans shadow-inner space-y-4">
                    <span className="font-extrabold text-[10px] text-forest-green uppercase tracking-widest block border-b border-gray-200 pb-1">
                      MÔ TẢ TRANG ĐẶT KIOSK KHÁCH HÀNG
                    </span>
                    {editDescription ? (
                      <div className="rich-preview-container space-y-2.5">
                        <MarkdownRenderer text={editDescription} />
                      </div>
                    ) : (
                      <div className="text-mid-gray italic text-center py-12">
                        Chưa có mô tả chi tiết để hiển thị.
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    SUB-TAB: BOM (HỆ THỐNG ĐỊNH MỨC CHI TIẾT)
                    ------------------------------------------------------------- */}
                {editorTab === "bom" && (
                  <div className="space-y-5">
                    {/* Validation Notification Banner (PRD v2.3 Requirement) */}
                    {(boms[selectedService.id] || []).length > 0 ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-900 flex items-start gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-xs uppercase text-emerald-800">🟢 ĐỊNH MỨC HỢP LỆ (ACTIVE)</strong>
                          <span className="text-[10px] text-emerald-700 leading-snug block mt-0.5">
                            Gói dịch vụ có định mức hóa chất đầy đủ. Kiosk sảnh được phép kích hoạt và tiến hành in vé dọn rửa tự động.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-250 text-rose-900 flex items-start gap-2.5 animate-pulse">
                        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-xs uppercase text-rose-800">🔴 BOM THIẾU ĐỊNH MỨC (BLOCKED)</strong>
                          <span className="text-[10px] text-rose-700 leading-snug block mt-0.5">
                            <strong>Lỗi quy trình:</strong> Dịch vụ chưa cấu hình dòng tiêu hao vật tư. Hệ thống chặn kích hoạt sử dụng để tránh thâm hụt tài nguyên kho!
                          </span>
                        </div>
                      </div>
                    )}

                    {/* BOM Lines List */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-matte-black uppercase tracking-wider block">
                        Danh mục vật tư tiêu hao định mức
                      </span>

                      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-gray-50/30">
                        {(boms[selectedService.id] || []).length === 0 ? (
                          <div className="p-8 text-center text-mid-gray italic">
                            Chưa có vật tư nào được gán cho dịch vụ này. Vui lòng thêm vật tư định mức bên dưới.
                          </div>
                        ) : (
                          (boms[selectedService.id] || []).map((b) => (
                            <div key={b.itemId} className="p-3 flex items-center justify-between gap-4 bg-white hover:bg-gray-50 transition">
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <span className="font-extrabold text-matte-black block text-xs truncate">{b.itemName}</span>
                                <span className="text-[9px] text-mid-gray font-sans block">Mã kho: {b.itemId}</span>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-sans font-bold text-forest-green text-sm">
                                  {b.amount}
                                </span>
                                <span className="text-[9px] text-mid-gray ml-1 font-bold">{b.unit}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveBomItem(b.itemId)}
                                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition shrink-0"
                                title="Xóa dòng định mức"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add material to BOM form */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block flex items-center gap-1.5">
                        <PackageOpen className="h-4 w-4 text-slate-500" />
                        Thêm vật tư định mức mới
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-mid-gray">Chọn hóa chất / vật phẩm kho</label>
                          <select
                            value={selectedBomItemId}
                            onChange={(e) => setSelectedBomItemId(e.target.value)}
                            className="w-full bg-white border border-gray-250 rounded-lg p-2 text-xs"
                          >
                            {inventoryList.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} ({inv.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 items-end">
                          <div className="space-y-1">
                            <label className="font-bold text-mid-gray">Lượng tiêu hao / 1 lần rửa</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={bomAmountInput}
                              onChange={(e) => setBomAmountInput(e.target.value)}
                              className="w-full bg-white border border-gray-250 rounded-lg p-2 text-xs font-sans font-bold text-center"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddBomItem}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase rounded-lg tracking-wider cursor-pointer"
                          >
                            Thêm định mức
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* SECTION: AUDIT/ADJUSTMENT HISTORY & DANGER ZONE INSIDE SCROLLABLE AREA */}
                <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-2 text-matte-black font-display font-black text-[11px] uppercase tracking-wider pb-1 border-b border-gray-250">
                    <History className="h-4 w-4 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
                    LỊCH SỬ BIẾN ĐỘNG HỒ SƠ DỊCH VỤ
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {adjustmentHistory.filter(h => h.serviceId === selectedService.id).length === 0 ? (
                      <div className="text-[10px] text-mid-gray text-center py-2 italic font-sans">
                        Chưa ghi nhận biến động dữ liệu cho gói này.
                      </div>
                    ) : (
                      adjustmentHistory
                        .filter(h => h.serviceId === selectedService.id)
                        .slice(0, 5)
                        .map((log) => (
                          <div key={log.id} className="text-[10px] font-sans flex flex-col gap-0.5 bg-white p-2 rounded-lg border border-gray-100 shadow-xs">
                            <div className="flex justify-between items-center text-[9px] text-mid-gray">
                              <span className="font-semibold text-slate-700">{log.updatedBy}</span>
                              <span>{new Date(log.timestamp).toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                            </div>
                            <div className="text-matte-black text-[10px] leading-tight">
                              Thay đổi <strong className="text-slate-800">{log.fieldChanged}</strong>: <span className="line-through text-red-500">{log.oldValue}</span> → <strong className="text-forest-green">{log.newValue}</strong>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Delete service warning block */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1 text-red-700 font-extrabold uppercase text-[10px] tracking-wider">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      VÙNG NGUY HIỂM: XÓA DỊCH VỤ
                    </div>
                    <p className="text-[10px] text-red-650 leading-relaxed font-sans">
                      Vui lòng nhập mã gói <strong className="font-sans text-red-900 bg-red-100 px-1 py-0.5 rounded">{selectedService.code}</strong> để xác nhận xóa vĩnh viễn dịch vụ này.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã gói..."
                        value={deleteConfirmCode}
                        onChange={(e) => setDeleteConfirmCode(e.target.value)}
                        className="flex-1 bg-white border border-red-200 rounded-lg px-2.5 py-1.5 text-xs font-sans font-bold text-matte-black uppercase focus:outline-none focus:border-red-500 shadow-sm"
                      />
                      <button
                        type="button"
                        disabled={deleteConfirmCode.trim().toUpperCase() !== selectedService.code.toUpperCase()}
                        onClick={() => {
                          handleDeleteService(selectedService.id, selectedService.type, true);
                          setDeleteConfirmCode("");
                        }}
                        className="px-4 py-1.5 rounded-lg text-white font-extrabold text-[10px] uppercase tracking-wider transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shrink-0"
                        style={{ backgroundColor: deleteConfirmCode.trim().toUpperCase() === selectedService.code.toUpperCase() ? "#dc2626" : undefined }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION: STICKY SUBMIT BUTTONS AT THE BOTTOM */}
              <div className="p-6 bg-warm-white border-t border-[#e5e5e5] shrink-0">
                {/* Submit Action buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-mid-gray hover:bg-white text-xs font-extrabold uppercase transition cursor-pointer font-display tracking-wider"
                  >
                    ĐÓNG LẠI
                  </button>
                  {editorTab === "write" && (
                    <button
                      type="submit"
                      form="edit-service-form"
                      className="flex-1 py-2.5 rounded-xl bg-matte-black hover:bg-gray-900 text-white font-extrabold text-xs uppercase transition shadow-md cursor-pointer font-display tracking-wider"
                    >
                      LƯU THAY ĐỔI
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CREATE SERVICE MODAL */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-matte-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e5e5e5] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddServiceModal(false)}
              className="absolute top-4 right-4 text-mid-gray hover:text-matte-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-extrabold font-display tracking-wider text-matte-black uppercase mb-4 flex items-center gap-2 border-b border-[#e5e5e5] pb-3">
              <Layers className="h-5 w-5 text-forest-green" />
              TẠO DỊCH VỤ / SẢN PHẨM MỚI
            </h3>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Phân loại
                  </label>
                  <select
                    value={newServiceForm.type}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, type: e.target.value as any })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                  >
                    <option value="package">Gói rửa chuẩn (W0-W5)</option>
                    <option value="addon">Dịch vụ lẻ (Add-on)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Mã hiệu (Code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: W5, ADD-09"
                    value={newServiceForm.code}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-xs font-sans font-bold text-matte-black focus:outline-none focus:border-forest-green"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                  Tên hiển thị dịch vụ
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Rửa Hơi Nước Nóng Cabin"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Đơn giá mặc định (VND)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 150000"
                    value={newServiceForm.price}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, price: e.target.value })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Thời lượng ước tính (phút)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ví dụ: 30"
                    value={newServiceForm.duration}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, duration: e.target.value })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                  />
                </div>
              </div>

              {newServiceForm.type === "addon" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                    Đường dẫn ảnh Thumbnail (1:1 Ratio)
                  </label>
                  <input
                    type="text"
                    placeholder="Đường dẫn ảnh Unsplash..."
                    value={newServiceForm.thumbnail}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, thumbnail: e.target.value })}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-xs text-matte-black focus:outline-none focus:border-forest-green"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-sans text-mid-gray uppercase font-extrabold block">
                  Mô tả tính năng gói dịch vụ
                </label>
                <MarkdownTextarea
                  id="services-add-desc"
                  placeholder="Nhập các chi tiết hoặc quyền lợi của khách hàng khi chọn gói này..."
                  value={newServiceForm.description}
                  onChange={(val) => setNewServiceForm({ ...newServiceForm, description: val })}
                  rows={3}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#e5e5e5] text-mid-gray hover:bg-warm-white transition text-xs font-extrabold font-display uppercase cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-forest-green hover:bg-forest-green/90 text-white font-extrabold transition text-xs font-display uppercase shadow-sm cursor-pointer"
                >
                  TẠO MỚI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROPOSAL FORM MODAL */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-matte-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#e5e5e5] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowProposalModal(false)}
              className="absolute top-4 right-4 text-mid-gray hover:text-matte-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-extrabold font-display tracking-wider text-matte-black uppercase mb-4 flex items-center gap-2 border-b border-[#e5e5e5] pb-3">
              <DollarSign className="h-5 w-5 text-forest-green" />
              ĐỀ XUẤT ĐIỀU CHỈNH GIÁ LÊN ADMIN
            </h3>

            <form onSubmit={handleSendProposal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                  Chọn gói dịch vụ muốn thay đổi
                </label>
                <select
                  required
                  value={proposalServiceId}
                  onChange={(e) => {
                    const s = packages.find(p => p.id === e.target.value) || addons.find(a => a.id === e.target.value);
                    if (s) {
                      setProposalServiceId(s.id);
                      setProposalPrice(s.price.toString());
                    }
                  }}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-brand-green"
                >
                  <option value="">Chọn gói cước...</option>
                  <optgroup label="Gói thi công chuẩn">
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatVnd(p.price)})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Dịch vụ add-on bổ trợ">
                    {addons.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatVnd(a.price)})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans text-mid-gray uppercase font-extrabold block">
                  Giá mới đề xuất (VND)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Nhập giá tiền mới muốn áp dụng..."
                  value={proposalPrice}
                  onChange={(e) => setProposalPrice(e.target.value)}
                  className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs font-sans text-matte-black focus:outline-none focus:border-forest-green"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#e5e5e5] text-mid-gray hover:bg-warm-white transition text-xs font-extrabold font-display uppercase cursor-pointer"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-matte-black font-extrabold transition text-xs font-display uppercase shadow-sm cursor-pointer"
                >
                  GỬI ĐỀ XUẤT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
