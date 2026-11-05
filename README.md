# 👓 NTD Eyewear - Cửa Hàng Mắt Kính Trực Tuyến

---

## 📑 BÁO CÁO ĐỒ ÁN MÔN HỌC LẬP TRÌNH JAVA (BẢN MỀM CHÍNH THỨC)

> **Đề tài:** Xây dựng hệ thống thương mại điện tử bán mắt kính trực tuyến NTD Eyewear với Java Spring Boot 3, Spring Data JPA, MySQL và Next.js 14  
> **Sinh viên thực hiện:** **Nguyễn Tấn Điệp** - MSSV: **2123110145**  
> **Kho lưu trữ GitHub (Public):** [https://github.com/TanDiep1004/TanDiepVanTruong_Java](https://github.com/TanDiep1004/TanDiepVanTruong_Java)

### 📥 Tải về file mềm báo cáo (Soft Copy):
* 📕 **[Xem / Tải Báo Cáo File PDF (Khuyên dùng)](https://github.com/TanDiep1004/TanDiepVanTruong_Java/raw/main/Nhom01_NTDEyewear_LapTrinhJava.pdf)** *(Định dạng PDF đã căn chỉnh chuẩn khổ A4, Times New Roman 13pt)*
* 📘 **[Tải Báo Cáo File Word (.DOCX)](https://github.com/TanDiep1004/TanDiepVanTruong_Java/raw/main/Nhom01_NTDEyewear_LapTrinhJava.docx)** *(Chuẩn Microsoft Word)*
* 📄 **[Tải Báo Cáo File Word (.DOC)](https://github.com/TanDiep1004/TanDiepVanTruong_Java/raw/main/Nhom01_NTDEyewear_LapTrinhJava.doc)**
* 📖 **[Đọc trực tiếp Báo Cáo Online (Markdown)](https://github.com/TanDiep1004/TanDiepVanTruong_Java/blob/main/BAO_CAO_DO_AN_MON_LAP_TRINH_JAVA.md)**

---

Chào mừng đến với **NTD Eyewear** - Hệ thống cửa hàng mắt kính cao cấp được xây dựng với kiến trúc hiện đại, bao gồm giao diện người dùng (Frontend) mượt mà và hệ thống quản trị (Backend) mạnh mẽ.

![NTD Eyewear Banner](https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1200&h=400)

## 🚀 Công Nghệ Sử Dụng

Dự án được phát triển theo mô hình Frontend - Backend tách biệt, sử dụng các công nghệ tiên tiến nhất:

### Frontend (Giao diện người dùng & Admin)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Lucide Icons
- **Quản lý trạng thái (State):** React Hooks (Context API)
- **Tính năng nổi bật:** 
  - Giao diện thân thiện, mượt mà (UI/UX chất lượng cao)
  - Dark Mode kết hợp tông màu Emerald sang trọng
  - Hệ thống giỏ hàng, quản lý đơn hàng
  - Trang quản trị (Admin Dashboard) quản lý Sản phẩm, Danh mục, Đơn hàng và Người dùng

### Backend (Xử lý logic & API)
- **Framework:** Spring Boot (Java)
- **Cơ sở dữ liệu:** MySQL (utf8mb4_unicode_ci hỗ trợ tiếng Việt có dấu)
- **ORM:** Hibernate / Spring Data JPA
- **Bảo mật:** Spring Security + JWT (JSON Web Token) cho xác thực và phân quyền (Admin / Customer)
- **Tính năng nổi bật:**
  - RESTful APIs chuẩn xác
  - Xử lý ràng buộc khóa ngoại (Foreign Keys) an toàn khi xóa/sửa dữ liệu
  - Quản lý phiên đăng nhập và phân quyền rõ ràng

---

## 🛠️ Cấu Trúc Thư Mục (Monorepo)

```text
NGUYENTANDIEP_2123110145/
├── frontend/             # Chứa mã nguồn Next.js (Website & Admin)
│   ├── app/              # Các route chính: (store) cho khách và /admin cho quản trị
│   ├── components/       # Các UI components tái sử dụng
│   ├── lib/              # API Client & Auth Utils
│   └── public/           # Tài nguyên tĩnh (ảnh, icon...)
└── backend/              # Chứa mã nguồn Spring Boot
    ├── src/main/java/.../controller/  # REST APIs
    ├── src/main/java/.../entity/      # Entities Database (Models)
    ├── src/main/java/.../security/    # Cấu hình JWT, Spring Security
    └── src/main/resources/            # Cấu hình application.properties
```

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống:
- **Node.js** (Phiên bản >= 18)
- **Java JDK** (Phiên bản >= 17)
- **XAMPP** (hoặc bất kỳ phần mềm MySQL Server nào)
- **Git**

### Bước 1: Khởi động Cơ sở dữ liệu (Database)
1. Mở **XAMPP Control Panel** và nhấn **Start** cho **MySQL**.
2. (Tuỳ chọn) Đảm bảo bạn đã có database tên là `ntd_eyewear` với dữ liệu ban đầu.

### Bước 2: Chạy Backend (Spring Boot)
Mở Terminal, di chuyển vào thư mục `backend` và chạy lệnh:
```bash
cd backend
./gradlew bootRun
# Hoặc chạy thông qua IDE như IntelliJ / Eclipse / VS Code
```
Backend sẽ khởi động tại: `http://localhost:8085`

### Bước 3: Chạy Frontend (Next.js)
Mở một Terminal khác, di chuyển vào thư mục `frontend` và chạy lệnh:
```bash
cd frontend
npm install
npm run dev
```
Giao diện người dùng sẽ khởi động tại: `http://localhost:3000`

---

## 👨‍💻 Quản Trị Hệ Thống (Admin)
- **Đường dẫn Admin:** `http://localhost:3000/admin/login`
- **Tài khoản mặc định:** (Liên hệ quản trị viên)

---

## ✨ Tác giả
- **Sinh viên:** Nguyễn Tấn Điệp
- **MSSV:** 2123110145
- Dự án được phát triển trong khuôn khổ học tập và nghiên cứu thực hành xây dựng ứng dụng Web hiện đại.

---
*Cảm ơn bạn đã ghé thăm dự án! Đừng quên để lại 1 ⭐️ nếu bạn thấy dự án hữu ích nhé!*
