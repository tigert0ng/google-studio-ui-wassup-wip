# WASSUP Station OS — Bản Thiết Kế Chi Tiết 7 Module Vận Hành Nội Bộ

Bản tài liệu này tổng hợp cấu trúc, mục tiêu, quyền truy cập, chi tiết giao diện màn hình, hành động, API liên quan và các trường hợp biên (edge cases) cho cả 7 phân hệ thuộc **WASSUP Admin Hub** (Mục 5 của tài liệu thiết kế hệ thống).

---

## Phân Hệ 0: Đăng Nhập & Phân Quyền (RBAC Engine)

*Kiểm soát và phân phối quyền hạn truy cập hệ thống theo đúng vai trò nghiệp vụ.*

* **Mục tiêu:** Đảm bảo an toàn bảo mật thông tin, hạn chế tối đa sai sót thao tác giữa các bộ phận.
* **Quyền truy cập:**
  * **Master Admin:** Quyền CRUD (Thêm, Sửa, Xóa) toàn bộ danh sách tài khoản, vai trò, kích hoạt/khóa tài khoản.
  * **Các vai trò khác (Quản lý, KTV, Thu ngân, Kế toán):** Chỉ tự đăng nhập, xem thông tin cá nhân và truy cập chức năng được phân quyền.
* **Chi tiết Màn hình & Hành động:**
  1. **Màn hình Đăng nhập (`/admin/login`):**
     * *Trường dữ liệu:* Tên đăng nhập (Username/Email), Mật khẩu (Password).
     * *Hành động:* Nút [Đăng nhập] → Xác thực thông tin qua bộ máy Supabase Auth/RBAC → Redirect tự động theo vai trò (Master Admin/Quản lý → `/admin/dashboard`, KTV → `/admin/ktv`, Thu ngân → `/admin/pos`).
  2. **Màn hình Quản lý nhân sự (`/admin/nhan-su`):**
     * *Trường dữ liệu:* Bảng hiển thị (Họ tên, SĐT, Vai trò, Trạng thái hoạt động, Ngày tạo).
     * *Hành động:* Nút [Thêm tài khoản] → Mở modal tạo mới; Nút [Khóa/Mở khóa tài khoản]; Nút [Thay đổi vai trò] → Mở modal điều chỉnh kèm hộp thoại xác nhận.
* **API Liên quan:**
  * `POST /api/auth/login` (Xác thực người dùng)
  * `GET/POST/PATCH /api/staff` (Lấy danh sách, tạo mới, cập nhật trạng thái nhân sự)
* **Edge Cases cần xử lý:**
  * **Khóa tài khoản KTV đang có lệnh dở dang:** Hệ thống sẽ quét kiểm tra xem KTV này có đơn hàng nào đang ở trạng thái `assigned` hoặc `in_progress` hay không. Nếu có, hiển thị thông báo cảnh báo: *"KTV này còn N lệnh chưa hoàn tất, vui lòng tái điều phối trước khi khóa tài khoản"*, không cho phép khóa ngay để tránh mồ côi đơn hàng.

---

## Phân Hệ 1: Dashboard Tổng Quan & Cảnh Báo Ngưỡng Doanh Thu

*Trung tâm giám sát sức khỏe vận hành và theo dõi mục tiêu doanh số của trạm.*

* **Mục tiêu:** Cung cấp bức tranh toàn cảnh trực quan theo thời gian thực về dòng xe, dòng tiền và chỉ số KPI doanh thu ngày.
* **Quyền truy cập:**
  * **Master Admin:** CRUD đầy đủ cấu hình ngưỡng mục tiêu doanh thu ngày.
  * **Quản lý:** Quyền xem dữ liệu (Read) và gửi đề xuất điều chỉnh ngưỡng doanh thu.
  * **Thu ngân / Kế toán:** Xem các chỉ số tài chính ngày.
  * **KTV:** Chỉ thấy các chỉ số lệnh rửa xe cá nhân của mình.
* **Chi tiết Màn hình & Hành động:**
  1. **Màn hình Dashboard (`/admin/dashboard`):**
     * *Khối 1: Card số lớn (đầu trang, dồn cột mobile):*
       * Tổng lượt xe hôm nay (so sánh chênh lệch % với hôm qua).
       * Tổng doanh thu thu về (so sánh chênh lệch % với hôm qua).
       * Doanh thu trung bình trên mỗi xe (so sánh với mix chuẩn mục tiêu `252.510 VND`).
       * Badge trạng thái ngưỡng doanh thu (🔴 Đỏ / 🟡 Vàng / 🟢 Xanh) đi kèm văn bản hướng dẫn: *"Còn thiếu X xe / Y đồng để lên mức tiếp theo"*.
     * *Khối 2: Biểu đồ trực quan:* Cho phép chuyển đổi tab hiển thị Ngày/Tuần/Tháng/Quý — Cột biểu diễn Doanh thu kết hợp đường line biểu diễn Lượt xe (trục phụ).
     * *Khối 3: Bảng phân tích Mix gói dịch vụ:* Hiển thị tỷ lệ phần trăm phân bố thực tế hôm nay so với mix chuẩn (`W0 35%`, `W1 44%`, `W2 12%`, `W3 5%`, `W4 2%`, `W5 1%`, `Khác 1%`). Nếu lệch quá 10 điểm phần trăm, dòng đó tự động tô màu vàng nổi bật.
     * *Khối 4: Bảng xe Realtime:* Mã đơn, Biển số, Gói dịch vụ, KTV phụ trách, Trạng thái vận hành, Giờ tiếp nhận, Giờ giao dự kiến (badge đỏ nếu quá giờ). Click vào dòng để mở chi tiết đơn hàng.
  2. **Màn hình Cấu hình ngưỡng (`/admin/dashboard/nguong`):**
     * *Trường dữ liệu:* Ngưỡng đỏ tối đa (Mặc định `4.404.000 VND`), Ngưỡng vàng tối đa, Ngày hiệu lực, Phạm vi áp dụng (Tuần/Tháng/Quý).
     * *Hành động:* Form chỉnh sửa ngưỡng (chỉ Master Admin chỉnh trực tiếp, Quản lý gửi đề xuất duyệt); Bảng lịch sử cảnh báo ghi nhận số ngày chạm ngưỡng Đỏ/Vàng/Xanh trong tháng.
* **API Liên quan:**
  * `GET /api/dashboard/summary` (Lấy tổng hợp số liệu thống kê)
  * `GET /api/dashboard/vehicles` (Đồng bộ danh sách xe realtime qua `order_status_view`)
  * `PATCH /api/revenue-thresholds` (Cập nhật cấu hình ngưỡng doanh thu ngày)
* **Edge Cases cần xử lý:**
  * **Trạm chưa phát sinh đơn hàng nào trong ngày:** Toàn bộ card số lớn hiện "0", không phát sinh lỗi hoặc khoảng trắng UI; Badge ngưỡng mặc định hiển thị màu 🔴 Đỏ (vì `0 VND < Ngưỡng đỏ`), kèm dòng chữ *"Mở màn ngày mới - Hãy tiếp nhận chiếc xe đầu tiên!"* một cách thân thiện.

---

## Phân Hệ 2a: Tiếp Nhận Xe & Điều Phối Chủ Động (Quản Lý)

*Trạm điều khiển chính của Quản lý trạm để tiếp nhận xe, đánh giá hiện trạng và gán buồng sản xuất.*

* **Mục tiêu:** Thực hiện check-in xe cực nhanh (dưới 45 giây) và phân phối công việc tối ưu cho các KTV.
* **Quyền truy cập:** Master Admin và Quản lý trạm có toàn quyền CRUD; Thu ngân có quyền đọc thông tin; KTV không được truy cập.
* **Chi tiết Màn hình & Hành động:**
  1. **Danh sách Tiếp nhận (`/admin/tiep-nhan`):**
     * *Trường dữ liệu:* Bảng hiển thị các xe đã tiếp nhận trong ngày (Mã đơn, Biển số, Khách hàng, Tình trạng lúc vào, Gói dịch vụ, Giờ nhận, Giờ giao dự kiến, KTV được gán, Trạng thái, Kênh tiếp nhận Kiosk/Thủ công).
     * *Hành động:* Bộ lọc nhanh theo Trạng thái/KTV/Gói; Nút [Check-in thủ công] mở form tiếp nhận.
  2. **Form Check-in Thủ công (`/admin/tiep-nhan/check-in`):**
     * *Mục tiêu thiết kế:* Hoàn tất trong ≤45 giây.
     * *Hành động:* Tìm kiếm khách hàng bằng SĐT nhanh (nếu chưa có thì cho phép điền Tên để tạo mới tự động); Nhập Biển số xe; Chọn phân khúc xe (Sedan/SUV/Khác); Chọn Gói dịch vụ & Add-on (giao diện thẻ chọn trực quan hiển thị sẵn giá tiền); Chọn nhanh Tình trạng xe vào (Sạch / Bẩn nặng / Trầy xước có sẵn); Hệ thống tự tính toán gợi ý giờ hoàn thành ETA (gọi hàm `estimate_eta`), cho phép Quản lý điều chỉnh tay; Bấm [Tạo đơn & Chuyển POS] để đẩy sang thu tiền.
  3. **Chi tiết đơn hàng (`/admin/tiep-nhan/{orderId}`):**
     * *Trường dữ liệu:* Toàn bộ thông tin khách hàng, gói dịch vụ, timeline các sự kiện trạng thái (ghi nhận rõ thời gian và kênh hành động), khu vực ghi chú hoạt động.
     * *Hành động:* Nút [Điều phối] mở ngăn kéo (Drawer) gán buồng/KTV; Form nhập ghi chú nhanh (gán nhãn: Khiếu nại / Ghi chú đặc biệt / Ghi chú kỹ thuật). Nếu gán nhãn "Khiếu nại", hệ thống tự động bắn cảnh báo Telegram tới Master Admin ngay lập tức.
  4. **Bàn điều phối nhanh (`/admin/tiep-nhan/{orderId}/dieu-phoi`):**
     * *Hành động:* Hiển thị danh sách KTV trong ca kèm theo số lượng lệnh đang xử lý, trạng thái kết nối Telegram (✅/❌). Chọn một KTV và một Buồng trống (Active Bay) → Gửi yêu cầu gán lệnh.
* **API Liên quan:**
  * `POST /api/orders` (Tạo đơn hàng thủ công)
  * `POST /api/work-orders/{id}/assign` (Gán KTV và buồng sản xuất cho đơn hàng)
  * `POST /api/work-orders/{id}/notes` (Thêm dòng nhật ký ghi chú/khiếu nại)
* **Edge Cases cần xử lý:**
  * **Bấm gán KTV liên tiếp nhiều lần khi mạng chậm:** Khóa ngay nút gán (loading state) sau lần click đầu tiên. Hàm xử lý ở tầng cơ sở dữ liệu `assign_next_order` được cấu hình cơ chế `FOR UPDATE SKIP LOCKED` để tránh tuyệt đối tình trạng gán đè chéo hoặc gán một đơn hàng cho nhiều KTV cùng lúc.
  * **KTV được gán chưa liên kết Telegram:** Hệ thống vẫn cho phép gán (để KTV vận hành qua Web View) nhưng hiển thị cảnh báo nhỏ màu vàng bên cạnh tên KTV: *"KTV chưa kết nối Telegram - Sẽ gửi qua Web View"* kèm liên kết tạo nhanh mã QR kết nối.

---

## Phân Hệ 2b: Web View KTV (Kênh Đồng Hành Với Telegram)

*Giao diện tối giản, tối ưu hóa hiển thị trên thiết bị di động (Mobile-first) dành riêng cho Kỹ thuật viên thao tác trực tiếp tại buồng rửa.*

* **Mục tiêu:** Cung cấp thông tin trực quan, thao tác chuyển đổi trạng thái một chạm to rõ phù hợp với môi trường làm việc nhiều nước và bụi bẩn.
* **Quyền truy cập:** Kỹ thuật viên chỉ được xem và thao tác trên những đơn hàng được gán trực tiếp cho mã định danh của mình (`technician_id = auth.uid()`).
* **Chi tiết Màn hình & Hành động:**
  1. **Danh sách Công việc của tôi (`/admin/ktv`):**
     * *Trường dữ liệu:* Danh sách thẻ công việc xếp dọc (Biển số xe cỡ chữ lớn, tên gói dịch vụ, giờ bàn giao dự kiến, badge "MỚI" nhấp nháy cho lệnh vừa nhận).
     * *Sắp xếp:* Lệnh mới gán xếp lên đầu, tiếp đến xếp theo thứ tự độ ưu tiên của Giờ giao dự kiến (ETA).
  2. **Màn hình Tiến độ chi tiết (`/admin/ktv/{workOrderId}`):**
     * *Hành động:*
       * Nút hành động chính kích thước lớn (Dễ dàng bấm bằng ngón cái): Trạng thái `assigned` → Hiện nút [Bắt đầu làm việc] (Chuyển đơn sang `in_progress`); Trạng thái `in_progress` → Hiện danh sách checklist nhiệm vụ (tải tự động từ `services.checklist_jsonb`), đánh dấu xong từng bước → Hiện nút [Báo cáo hoàn thành] (Chuyển sang `quality_check`).
       * Nút khẩn cấp [Xin gia hạn ETA]: Cho phép chọn nhanh lý do (Xe quá bẩn / Phát sinh lỗi kỹ thuật / Khách yêu cầu thêm) để cộng thêm 15 phút hoặc 30 phút vào ETA (gửi thông báo duyệt tới Quản lý).
       * Khu vực "Kiểm định chất lượng (QC)": Trước khi bấm hoàn tất, KTV điền checklist bàn giao. Nếu có tiêu chí không đạt, hiện nút [Cần xử lý lại] để tự kích hoạt luồng rework (giới hạn rework tối đa 2 lần).
* **API Liên quan:**
  * `GET /api/work-orders?technician_id=me` (Truy xuất danh sách việc của KTV đang đăng nhập)
  * `POST /api/work-orders/{id}/status` (Cập nhật trạng thái kèm tham số định danh `channel: 'web'`)
  * `POST /api/work-orders/{id}/extend` (Gửi yêu cầu xin gia hạn thời gian bàn giao)
* **Edge Cases cần xử lý:**
  * **Trùng lặp thao tác giữa Quản lý và KTV:** Khi KTV bấm nút chuyển trạng thái trên điện thoại đúng lúc Quản lý cũng cập nhật trạng thái đơn hàng trên máy tính bàn, hệ thống API xử lý trạng thái sẽ đối chiếu lịch sử bước (State Machine Guard: `assigned → in_progress → quality_check → done`). Nếu bước đi không hợp lệ, trả về thông báo lỗi trực quan: *"Trạng thái đơn hàng đã được cập nhật bởi Quản lý, trang sẽ tự làm mới"* thay vì âm thầm ghi đè dữ liệu.

---

## Phân Hệ 3: POS Thu Ngân & Giao Ca Chặt Chẽ

*Quản lý doanh thu tại quầy, áp dụng khuyến mãi, xử lý phương thức thanh toán và kiểm soát tiền quỹ.*

* **Mục tiêu:** Thu tiền chính xác, in hóa đơn nhanh, giảm thiểu hao hụt dòng tiền mặt thông qua quy trình giao ca nghiêm ngặt.
* **Quyền truy cập:**
  * **Master Admin / Quản lý:** Có quyền CRUD toàn bộ giao dịch, duyệt các yêu cầu giảm giá vượt hạn mức hoặc hủy đơn hàng.
  * **Thu ngân:** Thực hiện thu tiền, áp voucher, in hóa đơn và thực hiện quy trình mở/đóng ca.
  * **Kế toán:** Quyền Read (Đọc thông tin) và Export (Xuất báo cáo tài chính).
* **Chi tiết Màn hình & Hành động:**
  1. **Bàn POS ngày (`/admin/pos`):**
     * *Trường dữ liệu:* Bảng kiểm soát đơn hàng cần thanh toán trong ngày (Mã hóa đơn, Tên khách, Biển số xe, SĐT, Gói dịch vụ & Add-on chọn kèm, Tổng tiền, Trạng thái thanh toán, Phương thức, Nút [In hóa đơn]).
  2. **Màn hình Thanh toán đơn hàng (`/admin/pos/{orderId}/thu-tien`):**
     * *Hành động:*
       * Hiển thị chi tiết tiền mặt: Tổng tiền gốc, Giảm giá voucher (hiển thị rõ mã voucher và số tiền được trừ cụ thể), Số tiền cần thu cuối cùng.
       * Chọn Phương thức thanh toán: QR chuyển khoản tự động (hiển thị mã QR động định danh kèm trạng thái đợi webhook báo có tiền); Thẻ ngân hàng (Thu ngân quét thẻ và xác nhận thủ công); Tiền mặt (Hộp thoại nhập tiền khách đưa → Tự tính tiền thừa trả khách).
       * Nút [Hủy đơn] hoặc [Giảm giá đặc biệt]: Bắt buộc nhập lý do hủy/giảm (`reason_code`). Nếu vượt mức chiết khấu cho phép của Thu ngân (ví dụ >20%), nút thanh toán chuyển trạng thái "Chờ Master Admin phê duyệt" (bắn thông báo yêu cầu xác nhận tức thì qua Telegram của Admin).
  3. **Màn hình Giao ca (`/admin/pos/giao-ca`):**
     * *Trường dữ liệu:*
       * *Mở ca:* Nhập số tiền mặt đầu ca để làm tiền thối quỹ.
       * *Đóng ca:* Hệ thống tự tính toán tổng tiền mặt kỳ vọng thu về trên sổ sách (`cash_expected` = tiền đầu ca + tổng thu tiền mặt trong ca - tổng chi). Thu ngân kiểm đếm tiền mặt thực tế trong két và nhập số liệu (`cash_counted`). Hệ thống tự đối chiếu tính toán chênh lệch (`cash_diff = cash_counted - cash_expected`).
       * *Biên bản bàn giao:* Ghi nhận Chênh lệch (KPI mục tiêu là chênh lệch ≤ 20.000 VND), chữ ký xác nhận của Người giao và Người nhận bàn giao ca tiếp theo.
  4. **Quản lý Công nợ đặt cọc (`/admin/pos/cong-no`):**
     * *Hành động:* Danh sách các đơn hàng có dịch vụ lớn cần thanh toán nhiều lần hoặc đặt cọc trước. Nút [Thu thêm] để tạo bản ghi nộp tiền đặt cọc mới (lịch sử thanh toán lũy kế rõ ràng, không ghi đè số tiền cũ).
* **API Liên quan:**
  * `POST /api/orders/{id}/payment` (Xử lý thanh toán hóa đơn)
  * `POST /api/shifts` (Mở ca làm việc mới)
  * `POST /api/shifts/{id}/close` (Gọi Edge Function xử lý khóa két, tổng hợp sổ sách cuối ca)
  * `POST /api/order-adjustments` (Ghi nhận yêu cầu giảm giá/hủy đơn cần phê duyệt)
* **Edge Cases cần xử lý:**
  * **Trạm bị mất mạng Internet đột ngột khi đang thu tiền mặt:** Để đáp ứng yêu cầu vận hành liên tục (NFR), toàn bộ giao dịch thanh toán bằng tiền mặt (Cash) và biên bản giao ca khi offline phải được ghi nhận vào hàng đợi lưu trữ cục bộ của trình duyệt (Sử dụng IndexedDB). Khi thiết bị có kết nối mạng trở lại, hệ thống sẽ tự động đồng bộ hóa lũy kế lên server mà không làm gián đoạn trải nghiệm của khách hàng tại quầy.

---

## Phân Hệ 4: CRM Khách Hàng Thân Thiết & Điểm Thưởng SUP

*Quản lý cơ sở dữ liệu khách hàng thân thiết, tích lũy điểm SUP và phát hành thẻ Voucher chăm sóc khách hàng.*

* **Mục tiêu:** Giữ chân khách hàng, tự động hóa quy trình chăm sóc qua hệ thống điểm thưởng SUP và phát hành ưu đãi cá nhân hóa.
* **Quyền truy cập:**
  * **Master Admin:** Toàn quyền CRUD dữ liệu khách hàng, được điều chỉnh điểm SUP thủ công (phục vụ xử lý khiếu nại).
  * **Quản lý:** Quyền đọc dữ liệu khách hàng, ghi chú phản hồi, không có quyền tự điều chỉnh điểm SUP tăng/giảm tùy ý.
  * **Kế toán:** Quyền đọc báo cáo.
* **Chi tiết Màn hình & Hành động:**
  1. **Danh sách Khách hàng (`/admin/khach-hang`):**
     * *Trường dữ liệu:* Tên khách hàng, SĐT, danh sách Biển số xe liên kết, tổng số lượt rửa xe, số dư điểm SUP hiện tại, ngày ghé thăm trạm gần nhất. Tìm kiếm thông minh theo SĐT / Biển số / Tên.
  2. **Hồ sơ Khách hàng chi tiết (`/admin/khach-hang/{customerId}`):**
     * *Nội dung:*
       * Lịch sử đơn hàng đầy đủ (click để xem hóa đơn gốc).
       * Sổ cái điểm thưởng **SUP Ledger**: Timeline ghi nhận rõ ràng các giao dịch Tích điểm (Earn) / Tiêu điểm đổi quà (Redeem) / Điểm hết hạn (Expire) / Điều chỉnh thủ công từ Admin, hiển thị số dư điểm thay đổi sau mỗi dòng.
       * Bộ sưu tập Voucher của khách: Danh sách các mã giảm giá được cấp riêng cho khách hàng này kèm trạng thái (Còn hạn / Đã dùng / Hết hạn).
  3. **Màn hình Phát hành Voucher (`/admin/khach-hang/voucher/phat-moi`):**
     * *Hành động:* Điền Form cấp voucher cá nhân hóa cho khách hàng gặp sự cố hoặc khách VIP.
     * *Trường dữ liệu:* Chọn Khách hàng nhận; Chọn Loại ưu đãi (Giảm % hoặc Giảm số tiền cụ thể); Trần giảm giá tối đa; Giá trị đơn hàng tối thiểu áp dụng; Thời gian hiệu lực; Lý do cấp (Phát tay tri ân / Ưu đãi sinh nhật / Đền bù khiếu nại dịch vụ).
* **API Liên quan:**
  * `GET /api/customers` (Lấy danh sách khách hàng thân thiết)
  * `GET /api/customers/{id}` (Lấy chi tiết hồ sơ một khách hàng)
  * `POST /api/vouchers` (Tạo mới voucher ưu đãi)
  * `GET /api/sup-ledger` (Truy vấn lịch sử biến động điểm SUP)
* **Edge Cases cần xử lý:**
  * **Phát hành voucher đền bù khiếu nại:** Để tối ưu hóa quy trình nghiệp vụ cho Quản lý, khi một đơn hàng được gắn nhãn "Khiếu nại" trong Phân hệ 2a, hệ thống sẽ hiển thị một lối tắt trực tiếp [Đền bù cho khách] trên trang chi tiết đơn hàng đó. Khi click vào, lối tắt này sẽ tự động chuyển hướng Quản lý tới Form phát hành Voucher mới với các trường dữ liệu Khách hàng, Mã đơn hàng liên quan đã được điền sẵn (Auto-populated), đồng thời lưu vết liên kết chéo giữa voucher đền bù và mã đơn hàng bị khiếu nại để dễ dàng kiểm toán sau này.

---

## Phân Hệ 5: Gói Dịch Vụ, Add-On & Định Giá Phiên Bản

*Quản lý danh mục sản phẩm, cấu hình bảng giá dịch vụ và định nghĩa quy trình kỹ thuật chuẩn cho từng gói.*

* **Mục tiêu:** Cung cấp thông tin chuẩn hóa cho Kiosk/Admin tự động, đảm bảo tính nhất quán về giá và hỗ trợ cập nhật danh mục dịch vụ theo thời gian thực.
* **Quyền truy cập:**
  * **Master Admin:** CRUD danh mục dịch vụ, thay đổi giá trực tiếp (có hiệu lực ngay lập tức lên toàn hệ thống Kiosk).
  * **Quản lý:** Quyền xem dữ liệu (Read) và tạo yêu cầu đề xuất thay đổi giá dịch vụ gửi lên Master Admin duyệt.
  * **KTV:** Chỉ đọc (Read) để xem sơ đồ quy trình checklist kỹ thuật của gói dịch vụ.
* **Chi tiết Màn hình & Hành động:**
  1. **Danh sách Gói dịch vụ (`/admin/dich-vu`):**
     * *Trường dữ liệu:* Phân bảng rõ ràng giữa Gói chính (W0 - W5) và Gói bổ trợ (Add-on). Các cột: Mã dịch vụ, Tên gọi, Đơn giá hiện tại, Thời lượng thi công định mức (Min - Max phút), Trạng thái hoạt động (Hoạt động / Tạm dừng).
  2. **Trang cấu hình dịch vụ (`/admin/dich-vu/{serviceCode}`):**
     * *Trường dữ liệu:* Tên dịch vụ, Mô tả chi tiết (dạng gạch đầu dòng hiển thị ngoài Kiosk), Giá tiền, Thời lượng ước tính, Ảnh minh họa, Trạng thái kích hoạt.
     * *Cấu hình kỹ thuật:* Khu vực thiết lập danh sách checklist các bước thi công thực tế (Ví dụ: Bước 1: Rửa lốp, Bước 2: Phủ bọt tuyết...). Danh sách này sẽ tự động tải lên điện thoại KTV khi gán đơn hàng tương ứng.
     * *Hành động:* Bấm [Cập nhật gói] → Hệ thống tự động ghi nhận phiên bản giá mới, đồng thời gửi tín hiệu Realtime phát sóng (Broadcast) để Kiosk tự động nạp lại bảng giá mới trong vòng 3 giây mà không cần khởi động lại ứng dụng.
  3. **Yêu cầu thay đổi giá (`/admin/dich-vu/de-xuat-gia`):**
     * *Hành động:* Quản lý tạo phiếu đề xuất (Chọn gói, nhập giá mới đề xuất, ghi rõ lý do đề xuất tăng/giảm giá). Master Admin nhận thông báo và có nút duyệt [Đồng ý áp dụng] hoặc [Từ chối].
* **API Liên quan:**
  * `PATCH /api/services/{code}` (Cập nhật thông tin dịch vụ - Chỉ dành cho Master Admin)
  * `POST /api/price-change-requests` (Tạo yêu cầu thay đổi giá của Quản lý)
  * `PATCH /api/price-change-requests/{id}/decide` (Phê duyệt hoặc từ chối đề xuất giá)
* **Edge Cases cần xử lý:**
  * **Thay đổi giá gói dịch vụ khi khách hàng đang chuẩn bị thanh toán giá cũ:** Để đảm bảo tính minh bạch, hệ thống áp dụng cơ chế **Định giá theo phiên bản (Versioned Pricing)**. Khi một đơn hàng đã được tạo thành công ở trạng thái "Chờ thanh toán" (`pending_payment`), đơn giá của đơn hàng đó sẽ được khóa chặt theo mức giá tại thời điểm tạo đơn. Mọi thao tác thay đổi giá gói dịch vụ của Admin sau đó chỉ áp dụng cho các đơn hàng mới tạo từ Kiosk hoặc check-in thủ công sau thời điểm cập nhật giá, tuyệt đối không tự ý cập nhật lại giá của các đơn hàng đã nằm trong hàng chờ thanh toán.

---

## Phân Hệ 6: Kho Vật Tư, Hóa Chất & Định Mức Hao Phí

*Kiểm soát chặt chẽ tồn kho hóa chất, dụng cụ lao động và giá trị hao phí trên từng đơn hàng.*

* **Mục tiêu:** Tránh thất thoát hóa chất chuyên dụng, dự báo thời điểm nhập hàng để trạm vận hành liên tục và tính toán chính xác giá vốn hàng bán (COGS).
* **Quyền truy cập:** Master Admin và Quản lý trạm có toàn quyền CRUD kho; Kỹ thuật viên có quyền báo cáo xuất kho cuối ca; Kế toán có quyền xem giá vốn phục vụ cân đối dòng tiền.
* **Chi tiết Màn hình & Hành động:**
  1. **Bảng kiểm soát kho (`/admin/kho`):**
     * *Trường dữ liệu:* Danh sách vật tư phân chia rõ theo 3 nhóm:
       * *Nhóm 1: Sản phẩm thương mại* (Nước hoa ô tô, sáp thơm, phụ kiện bán kèm).
       * *Nhóm 2: Vật tư tiêu hao* (Hóa chất bọt tuyết, dung dịch bóng lốp, nước rửa kính).
       * *Nhóm 3: Công cụ dụng cụ khấu hao* (Máy xịt rửa áp lực cao, máy hút bụi, khăn lau microfiber - có thêm cột nguyên giá, ngày mua, tỷ lệ phần trăm khấu hao còn lại).
     * *Hành động:* Lọc nhanh theo Nhóm hàng / Trạng thái tồn kho (🟢 Đủ hàng / 🟡 Sắp hết / 🔴 Báo động cần nhập); Nút [Tạo phiếu nhập/xuất kho].
  2. **Chi tiết Vật tư (`/admin/kho/{itemId}`):**
     * *Nội dung:* Thông tin sản phẩm, ngưỡng cảnh báo tồn kho tối thiểu. Sổ theo dõi thẻ kho ghi nhận chi tiết lịch sử tất cả các lần Nhập - Xuất - Điều chỉnh (mỗi lần là một dòng ghi nhận riêng kèm thông tin người thực hiện, lý do, không ghi đè số tổng).
  3. **Phiếu báo cáo hao phí nhanh cho KTV:**
     * *Mục tiêu thiết kế:* Hoàn tất dưới 1 phút vào cuối ca làm việc.
     * *Hành động:* Hệ thống tự tính toán lượng dung dịch/hóa chất tiêu thụ lý thuyết dựa trên định mức kỹ thuật nhân với số lượng đơn hàng thực tế KTV đã hoàn thành trong ca. KTV chỉ cần đối chiếu lượng thực tế tiêu hao trong bình, nếu khớp thì bấm một chạm [Xác nhận định mức]; nếu lệch thì điều chỉnh nhanh con số thực tế hao hụt và ghi chú lý do để Quản lý nắm thông tin.
* **API Liên quan:**
  * `POST/PATCH /api/inventory` (Cấu hình danh mục vật tư kho)
  * `POST /api/inventory/movements` (Tạo phiếu nhập kho, xuất kho hoặc điều chỉnh số lượng thẻ kho)
* **Edge Cases cần xử lý:**
  * **Số lượng tồn kho thực tế xuống dưới ngưỡng báo động tối thiểu:** Ngay khi một giao dịch xuất kho làm giảm số lượng tồn kho của một mặt hàng xuống dưới ngưỡng tối thiểu thiết lập (`stock < safety_threshold`), hệ thống sẽ kích hoạt hai hành động đồng thời: Đổi badge trạng thái trên Dashboard (Phân hệ 1) sang màu 🔴 Đỏ báo động và tự động gửi tin nhắn Telegram khẩn cấp tới Quản lý trạm: *"⚠️ Cảnh báo: Mặt hàng [Hóa chất bọt tuyết W1] chỉ còn 5 lít (dưới ngưỡng an toàn 10 lít). Vui lòng tạo phiếu nhập kho gấp!"* để đảm bảo trạm không bị hết hóa chất giữa chừng.

---

## Phân Hệ 7: Monitor & Giám Sát Thiết Bị (Kế Hoạch Giai Đoạn 2)

*Cầu nối giám sát trạng thái kết nối phần cứng, camera giám sát và các thiết bị cảm biến buồng rửa.*

* **Mục tiêu:** Chuẩn bị sẵn sàng hạ tầng phần mềm cho việc tích hợp điều khiển IoT và camera AI nhận diện biển số xe trong tương lai.
* **Quyền truy cập:** Master Admin có quyền cấu hình kết nối; Quản lý trạm có quyền xem trạng thái và nhấn nút dừng khẩn cấp thiết bị.
* **Chi tiết Màn hình & Hành động:**
  1. **Bảng giám sát phần cứng (`/admin/monitor`):**
     * *Nội dung:* Các thẻ giám sát camera, cảm biến áp lực nước, cảm biến vật cản buồng rửa được thiết kế ở trạng thái **Skeleton (vùng xám mờ) hoặc có nhãn khóa (Disabled)** đi kèm dòng chữ ghi rõ: *"Tính năng đang phát triển - Chờ kết nối hạ tầng phần cứng Giai đoạn 2"*.
     * *Hành động khẩn cấp duy nhất hoạt động thật:* Nút [DỪNG KHẨN CẤP TOÀN TRẠM] (Emergency Stop) - Nút này được đặt nổi bật bằng màu đỏ rực tại cả Phân hệ 1 (Dashboard) và Phân hệ 7. Tuy nhiên, do chưa kết nối tủ điện phần cứng thật, khi người dùng click vào nút này, hệ thống sẽ mở hộp thoại thông báo giải thích chi tiết: *"Mô phỏng: Yêu cầu dừng khẩn cấp đã được gửi tới hệ thống. Khi tích hợp tủ điều khiển IoT thật ở Phase 2, hành động này sẽ ngắt toàn bộ dòng điện máy bơm và đóng cửa buồng rửa lập tức để bảo vệ an toàn"* chứ tuyệt đối không giả vờ hệ thống đã ngắt thiết bị thật để tránh gây hiểu nhầm về tính an toàn của trạm.
* **API Liên quan:**
  * `GET /api/monitor/status` (API trả về trạng thái placeholder cố định: `{ hardware_connected: false, emergency_triggered: false }` để giao diện hiển thị chính xác trạng thái thực tế).

---

## Tóm Tắt Bản Đồ Endpoint API Toàn Hệ Thống

Dưới đây là bảng tổng hợp ánh xạ toàn bộ các Endpoint API chính được thiết kế tương ứng với từng phân hệ vận hành trong WASSUP Admin Hub:

| Phân hệ vận hành | Endpoint API chịu trách nhiệm | Mô tả chức năng chính |
| :--- | :--- | :--- |
| **Phân hệ 0: RBAC** | `Supabase Auth API`<br>`GET/POST/PATCH /api/staff` | Xác thực đăng nhập hệ thống và phân quyền tài khoản KTV, Quản lý, Thu ngân. |
| **Phân hệ 1: Dashboard** | `GET /api/dashboard/summary`<br>`GET /api/dashboard/vehicles` (Realtime)<br>`PATCH /api/revenue-thresholds` | Truy xuất số liệu tài chính ngày, cập nhật luồng xe realtime qua views và sửa ngưỡng đỏ/vàng. |
| **Phân hệ 2a: Tiếp nhận** | `POST /api/orders` (channel='manual')<br>`POST /api/work-orders/{id}/assign`<br>`POST /api/work-orders/{id}/notes` | Đăng ký tiếp nhận xe tại quầy, gán KTV phụ trách buồng sản xuất và tạo nhật ký ghi chú, khiếu nại. |
| **Phân hệ 2b: KTV Web** | `GET /api/work-orders?technician_id=me`<br>`POST /api/work-orders/{id}/status`<br>`POST /api/work-orders/{id}/extend` | Hiển thị danh sách việc cá nhân của KTV, cập nhật trạng thái thi công và xin gia hạn thời gian ETA. |
| **Phân hệ 3: POS** | `POST /api/orders/{id}/payment`<br>`POST /api/shifts`<br>`POST /api/shifts/{id}/close`<br>`POST /api/order-adjustments` | Xử lý thanh toán QR/Cash/Card, thực hiện quy trình mở/đóng ca két tiền mặt và gửi duyệt giảm giá đặc biệt. |
| **Phân hệ 4: CRM & SUP** | `GET /api/customers`<br>`GET /api/customers/{id}`<br>`POST /api/vouchers`<br>`GET /api/sup-ledger` | Tìm kiếm dữ liệu khách hàng thân thiết, tra cứu lịch sử điểm thưởng SUP và phát hành thẻ Voucher đền bù. |
| **Phân hệ 5: Giá gói** | `PATCH /api/services/{code}` (Master Admin Only)<br>`POST /api/price-change-requests`<br>`PATCH /api/price-change-requests/{id}/decide` | Cấu hình bảng giá dịch vụ và checklist bước kỹ thuật, quản lý luồng đề xuất thay đổi đơn giá dịch vụ. |
| **Phân hệ 6: Kho** | `POST/PATCH /api/inventory`<br>`POST /api/inventory/movements` | Cập nhật số lượng thẻ kho khi xuất nhập hóa chất, dụng cụ khấu hao và ghi nhận mức tiêu hao cuối ca. |
| **Phân hệ 7: Monitor** | `GET /api/monitor/status` | Truy vấn trạng thái kết nối phần cứng camera/cảm biến (trả về placeholder `{ hardware_connected: false }`). |

---

## 💡 Câu Hỏi Nghiệp Vụ Cần Thống Nhất Trước Khi Triển Khai Phân Hệ 3 (POS)

Để đảm bảo việc lập trình Phân hệ 3 (POS Thu Ngân) diễn ra chính xác nhất về mặt nghiệp vụ tiền bạc và kiểm toán kế toán, chúng ta cần thống nhất câu hỏi quan trọng sau:

* **Câu hỏi:** *Ngưỡng cụ thể để giảm giá/hủy đơn hàng của Thu ngân được quy định như thế nào? Thu ngân được quyền tự quyết tối đa bao nhiêu % chiết khấu hay tất cả mọi yêu cầu giảm giá/hủy đơn (dù nhỏ nhất) đều bắt buộc phải gửi yêu cầu chờ duyệt từ Master Admin?*
* **Phương án đề xuất tối ưu cho UI/UX:**
  1. **Quy tắc tự quyết dưới ngưỡng:** Cho phép Thu ngân tự động áp dụng giảm giá trực tiếp nếu giá trị giảm giá ≤ `10%` tổng hóa đơn (hoặc tối đa không quá `50.000 VND`), đi kèm việc bắt buộc chọn một lý do hợp lệ từ danh sách (`reason_code`: Khách hàng thân thiết, Sự cố kỹ thuật nhỏ tại trạm...). Hệ thống sẽ cho phép hóa đơn thanh toán thành công ngay lập tức.
  2. **Quy tắc duyệt vượt ngưỡng:** Mọi giao dịch có mức giảm giá > `10%` hoặc tất cả các yêu cầu **Hủy đơn hàng** (Hủy hóa đơn đã in) sẽ bị khóa chức năng thanh toán trực tiếp. Nút thanh toán sẽ chuyển sang trạng thái màu vàng *"Chờ phê duyệt"*. Hệ thống tự động đẩy yêu cầu phê duyệt kèm lý do trực quan lên bảng điều khiển của Master Admin và gửi tin nhắn đẩy qua bot Telegram của Quản lý trạm để phê duyệt nhanh bằng một chạm (Approve/Decline).
