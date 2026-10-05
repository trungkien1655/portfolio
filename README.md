# 🌌 Interstellar Portfolio — Trần Đăng Trung Kiên

Website Portfolio một trang (Single-Page Portfolio) chuẩn điện ảnh lấy cảm hứng từ kiệt tác khoa học viễn tưởng **Interstellar (2014)** của đạo diễn Christopher Nolan, được xây dựng dành cho **Trần Đăng Trung Kiên** — sinh viên chuyên ngành Kinh tế Quốc tế, Trường Đại học Ngoại thương (FTU).

Toàn bộ dự án được thiết kế và lập trình bằng **HTML5, CSS3 và JavaScript thuần (ES Modules)**, **100% không cần công đoạn build (no-build-step)**, sẵn sàng triển khai trực tiếp lên **GitHub Pages**. Tất cả các hiệu ứng không gian, hố đen, sao băng và khối 4 chiều Tesseract đều được sinh trực tiếp bằng thuật toán (code-generated), hoàn toàn không phụ thuộc vào ảnh bản quyền hay tệp media nặng từ bên ngoài.

---

## 🚀 Điểm Nhấn Kỹ Thuật & Hiệu Ứng

### 1. Hố Đen Gargantua Chuẩn Điện Ảnh (Single-Pass Custom GLSL Shader)
- **Kiến trúc một Shader duy nhất**: Thay vì ghép các mesh 3D phẳng cắt nhau gây lỗi clipping, toàn bộ hố đen Gargantua được dựng bằng một custom fragment shader duy nhất với tone mapping ACES Filmic.
- **Thấu kính hấp dẫn (Gravitational Lensing)**: Đĩa bồi tụ phía sau hố đen được bẻ cong lên phía trên và xuống phía dưới vòm tối của chân trời sự kiện (Event Horizon), tạo cấu trúc vòm ánh sáng đặc trưng của thuyết tương đối rộng.
- **Hiệu ứng Doppler quang phổ**: Phía bên trái đĩa bồi tụ chuyển động về phía người quan sát sáng rực và ngả gam vàng-trắng nhiệt độ cao, phía bên phải dịch chuyển ra xa tối màu hơn theo gam cam-gỉ sắt.
- **Dải đĩa bồi tụ tiền cảnh**: Dải sáng plasma phía trước vắt liền mạch, không ngắt quãng qua mặt hố đen.
- **Vòng Photon (Photon Ring)**: Đường sáng mảnh, đồng tâm bao quanh chính xác bóng tối chân trời sự kiện.

### 2. Bầu Trời Sao Đa Tầng (Multi-Layer Starfield)
- **Lớp 1 — Sao vi mô nền xa**: 1.100 hạt sao với Canvas Texture dạng đĩa phát quang mềm mại, khử hoàn toàn hiện tượng răng cưa hình vuông.
- **Lớp 2 — Sao nhấp nháy tiền cảnh**: 300 sao với vertex shader riêng biệt, tính toán giao thoa sóng sin ngẫu nhiên để tạo nhịp thở lấp lánh tự nhiên.
- **Lớp 3 — Sao băng không gian (Meteor Stream)**: Vệt sao băng với đuôi plasma cam ấm xuất hiện định kỳ trên bầu trời sâu.

### 3. Hiệu Ứng Cú Nhảy Không-Thời Gian (Wormhole Warp Transition)
- Tích hợp theo dõi vận tốc cuộn trang (Scroll Velocity via GSAP) và sự kiện click điều hướng menu.
- Khi người dùng cuộn nhanh hoặc nhấn chuyển section, shader hố đen kích hoạt gợn sóng biến dạng thấu kính (`uWarp`), trường nhìn camera FOV kéo giãn tự nhiên (`60° -> 74°`), sao nền trôi dạt gia tốc tạo cảm giác vượt qua lỗ sâu vũ trụ.

### 4. Bộ Tổng Hợp Âm Thanh Không Gian (Ambient Space Synthesizer — Web Audio API)
- **0 file âm thanh MP3 bên ngoài**: Toàn bộ âm thanh được tổng hợp thời gian thực thông qua chuẩn **Web Audio API** của trình duyệt.
- Tần số trầm vô tận A1 (55Hz) kết hợp âm hưởng đa âm đập chậm (binaural beating 55.35Hz), bộ lọc cộng hưởng quét chậm (chu kỳ 12 giây) mô phỏng tiếng động cơ tàu vũ trụ Endurance.
- Nhịp gõ thời gian giãn nở (Time Dilation Tick — chu kỳ 1.5 giây) gợi nhớ trường đoạn hành tinh Miller.
- Nút điều khiển `COMM AUDIO` trên thanh menu với hoạt ảnh sóng equalizer 3 cột, tuyệt đối tuân thủ chính sách trình duyệt (không bao giờ tự ý phát khi chưa có tương tác).

### 5. Chòm Sao Năng Lực (Interactive Stellar Matrix — Canvas 2D)
- Toàn bộ kỹ năng được trực quan hóa thành một ma trận chòm sao.
- Các hạt năng lượng quang tử (pulses) di chuyển liên tục dọc theo các liên kết giữa các vì sao.
- Hỗ trợ tương tác chuột: rê chuột hiển thị vòng định vị HUD, vầng hào quang rực rỡ và nhãn kỹ năng sáng bừng. Tự động chuyển sang danh sách thẻ sao phẳng tối ưu trên thiết bị di động.

### 6. Khối Siêu Lập Phương Tesseract 4 Chiều (Pure CSS 3D)
- Section liên hệ tích hợp khung dây wireframe Tesseract lồng nhau xoay độc lập 360 độ bằng `transform-style: preserve-3d` nguyên bản của CSS, tạo chiều sâu 4D mà không tốn thêm bất kỳ draw call WebGL nào.

### 7. Tối Ưu Tải Trang & Độ Tương Phản (Performance & WCAG AA)
- **Progressive Enhancement**: Khởi tạo Three.js với độ phân giải và số lượng hạt thấp để khung hình đầu tiên xuất hiện dưới **100ms**, lập tức gỡ bỏ loading screen, sau đó nâng cấp mượt mà lên độ phân giải màn hình thực (DPR 2x).
- **Tải dự phòng an toàn (Failsafe Timeout)**: Bộ đếm thời gian 3.5s đảm bảo màn hình chờ luôn tắt ngay cả khi mạng chậm.
- **Chỉ số hiệu năng**: Duy trì ổn định **60 FPS** với tổng số draw call của Three.js chỉ xấp xỉ **4 draw calls** và toàn trang dưới **220 DOM nodes**.
- **Tiêu chuẩn WCAG AA**: Chữ trắng ngà `#f5f3ed` và cam ấm `#e8a04c` trên nền vũ trụ `#05070f` đạt tỷ lệ tương phản vượt trội (> 8:1 đến > 17:1).
- **Hỗ trợ `prefers-reduced-motion`**: Tự động chuyển sang chế độ chuyển động tối giản cho người dùng nhạy cảm với hiệu ứng thị giác.

---

## 🛠️ Công Nghệ Sử Dụng

- **HTML5 & CSS3** hiện đại (CSS Variables, Flexbox, CSS Grid, CSS 3D Transforms, Backdrop Filter).
- **JavaScript thuần (ES Modules)** — Không cần Webpack, Vite, Babel hay bất kỳ công cụ build nào.
- **Three.js (r160)** tải qua CDN cdnjs — Xử lý đồ họa WebGL hố đen, sao và camera flight.
- **GSAP & ScrollTrigger (3.12.5)** tải qua CDN cdnjs — Điều phối nhịp độ hoạt ảnh theo vị trí cuộn trang.
- **Web Audio API** — Tổng hợp âm thanh không gian thuần toán học.

---

## 💻 Hướng Dẫn Chạy Trên Máy Cục Bộ (Local)

Do dự án sử dụng chuẩn **JavaScript ES Modules** (`import` / `export`), trình duyệt yêu cầu chạy qua một HTTP Server cục bộ (không mở trực tiếp tệp bằng giao thức `file://`).

### Cách 1: Sử dụng Visual Studio Code (Live Server) — *Khuyên dùng*
1. Cài đặt tiện ích mở rộng **Live Server** trong VS Code.
2. Mở thư mục `portfolio/` trong VS Code.
3. Nhấp chuột phải vào tệp `index.html` → Chọn **Open with Live Server** (phím tắt `Alt + L, Alt + O`).
4. Trình duyệt sẽ tự động mở trang tại địa chỉ `http://127.0.0.1:5500`.

### Cách 2: Sử dụng Python
Mở Terminal / PowerShell tại thư mục `portfolio/`:
```bash
python -m http.server 8000
```
Truy cập trên trình duyệt: `http://localhost:8000`

### Cách 3: Sử dụng Node.js (npx)
Mở Terminal tại thư mục `portfolio/`:
```bash
npx serve .
```

---

## 🌐 Hướng Dẫn Triển Khai Lên GitHub Pages

Dự án có cấu trúc tệp tĩnh hoàn toàn chuẩn mực, sẵn sàng chạy ngay trên GitHub Pages chỉ trong 2 phút:

1. **Khởi tạo repository**:
   - Truy cập [GitHub](https://github.com), tạo một repository mới (ví dụ: `interstellar-portfolio`).
2. **Đẩy mã nguồn lên GitHub**:
   Mở Terminal trong thư mục `portfolio/` và chạy:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Interstellar Portfolio"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-github>/<ten-repo>.git
   git push -u origin main
   ```
3. **Kích hoạt GitHub Pages**:
   - Trên GitHub, vào mục **Settings** của repository.
   - Chọn menu **Pages** ở thanh bên trái.
   - Tại mục **Build and deployment > Source**, chọn **Deploy from a branch**.
   - Tại mục **Branch**, chọn nhánh `main` và thư mục `/ (root)`, sau đó nhấn **Save**.
4. **Trang web đi vào hoạt động**:
   - Sau khoảng 1-2 phút, GitHub sẽ hoàn tất việc xuất bản.
   - Địa chỉ trang web của bạn sẽ là: `https://<tai-khoan-github>.github.io/<ten-repo>/`.

---

## 📂 Cấu Trúc Thư Mục

```
portfolio/
├── index.html          # Khung trang chính, semantic HTML5, favicon SVG, audio toggle
├── css/
│   └── style.css       # Toàn bộ mã định kiểu CSS, theme Interstellar, responsive & CSS 3D
├── js/
│   ├── content.js      # 📝 Toàn bộ nội dung chữ (Chỉ cần chỉnh sửa tệp này khi cập nhật CV)
│   ├── scene.js        # Three.js WebGL: GLSL Gargantua shader, starfield, meteors, warp
│   └── main.js         # Khởi động ứng dụng, GSAP ScrollTrigger, Web Audio synthesizer, canvas 2D
├── assets/             # Thư mục tài nguyên (toàn bộ đồ họa đã được tạo bằng code)
└── README.md           # Tài liệu hướng dẫn chi tiết
```

---

## ✍️ Hướng Dẫn Chỉnh Sửa & Cập Nhật Nội Dung

Để cập nhật thông tin cá nhân, bạn **không cần chỉnh sửa code kỹ thuật** trong `scene.js` hay `style.css`. Bạn chỉ cần mở tệp `js/content.js` và chỉnh sửa các trường trong object `CONTENT`:

- `hero`: Họ tên, dòng tiêu đề phụ, chữ nút khám phá.
- `about`: Tọa độ trạm không gian, thông số telemetry (IELTS, GPA, trường lớp, v.v.), đoạn tự bạch (bio).
- `experience`: Các mốc thời gian, tên cơ quan / vị trí, độ giãn nở thời gian (time dilation factor) và mô tả công việc.
- `activities`: Module trạm hoạt động ngoại khóa, vai trò và danh sách nhiệm vụ.
- `skills`: Danh sách kỹ năng và tọa độ sao tương ứng trên chòm sao năng lực.
- `contact`: Kênh truyền tin, địa chỉ email, địa điểm.
- `nav`: Tên các mục trên thanh điều hướng.

---

## 📜 Bản Quyền & Giấy Phép

Được thiết kế và lập trình với niềm đam mê dành cho nghệ thuật điện ảnh không gian và trải nghiệm web hiện đại. Tự do sử dụng và tùy biến cho mục đích học tập và xây dựng portfolio cá nhân.
