import React, { useRef } from "react";
import { Bold, Italic, Underline, List } from "lucide-react";

/**
 * Component dùng chung toàn dự án cho mọi trường "mô tả dài" / "ghi chú"
 * (services.description_md, skill_catalog.description_md, v.v.)
 * Theo `prd/shared/design-ux-guidelines.md` §8.2:
 * - Quick toolbar đúng và chỉ 4 nút: Đậm / Nghiêng / Gạch chân / Bullet.
 * - Lưu dữ liệu dạng Markdown thuần — KHÔNG cho phép chèn HTML/class CSS tùy ý
 *   (chỉ `<u>` được whitelist cho gạch chân, vì Markdown chuẩn không có cú pháp này).
 */

// Render Markdown -> HTML an toàn (sanitized) để hiển thị (read view).
// Chỉ hỗ trợ: **đậm**, *nghiêng*, <u>gạch chân</u> (whitelist), dòng "- gạch đầu dòng", xuống dòng.
// Không parse/giữ lại bất kỳ thẻ HTML tự do nào khác.
export const renderMarkdown = (text: string) => {
  if (!text) return "";
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&lt;u&gt;/g, "<u>")
    .replace(/&lt;\/u&gt;/g, "</u>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n- ([^\n]+)/g, "<br/>• $1")
    .replace(/\n/g, "<br/>");
  return html;
};

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
  className = ""
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (formatType: "bold" | "italic" | "underline" | "bullet") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = "";
    switch (formatType) {
      case "bold":
        replacement = `**${selectedText || "chữ đậm"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "chữ nghiêng"}*`;
        break;
      case "underline":
        replacement = `<u>${selectedText || "gạch chân"}</u>`;
        break;
      case "bullet":
        replacement = `\n- ${selectedText || "mục mới"}`;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  return (
    <div className={className}>
      {/* Quick toolbar — 4 nút bắt buộc theo design-ux-guidelines.md §8.2 */}
      <div className="flex items-center gap-1 bg-gray-50 border border-b-0 border-[#e5e5e5] rounded-t-xl px-2.5 py-1.5">
        <button
          type="button"
          onClick={() => insertFormat("bold")}
          className="p-1 hover:bg-gray-200 rounded transition text-matte-black cursor-pointer"
          title="In đậm (Bold)"
        >
          <Bold className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => insertFormat("italic")}
          className="p-1 hover:bg-gray-200 rounded transition text-matte-black cursor-pointer"
          title="In nghiêng (Italic)"
        >
          <Italic className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => insertFormat("underline")}
          className="p-1 hover:bg-gray-200 rounded transition text-matte-black cursor-pointer"
          title="Gạch chân (Underline)"
        >
          <Underline className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <div className="w-px h-3.5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertFormat("bullet")}
          className="p-1 hover:bg-gray-200 rounded transition text-matte-black cursor-pointer"
          title="Danh sách gạch đầu dòng (Bullet)"
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#e5e5e5] px-3 py-2 text-xs text-matte-black focus:outline-none focus:border-forest-green rounded-b-xl border-t-0 min-h-[100px] resize-none"
      />
    </div>
  );
}
