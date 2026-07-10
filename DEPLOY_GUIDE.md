# 🚀 ZENVY — Hướng dẫn Deploy lên Vercel

## Tổng quan

| Thành phần | Dịch vụ |
|---|---|
| Frontend + API | [Vercel](https://vercel.com) (Free tier) |
| Database | [Neon PostgreSQL](https://neon.tech) (Free tier) |
| Email SMTP | Gmail App Password |
| AI Tarot | OpenAI API |

---

## Bước 1 — Chuẩn bị Neon Database

1. Đăng ký tại [neon.tech](https://neon.tech)
2. Tạo Project mới → chọn region gần nhất (Singapore)
3. Vào **Connection Details** → copy **Connection string** (dạng `postgresql://...`)
4. Chạy migration lần đầu từ máy local:
   ```bash
   npx prisma db push
   ```

---

## Bước 2 — Deploy lên Vercel

1. Đăng nhập [vercel.com](https://vercel.com) → **Add New Project**
2. Import từ GitHub repo `DauBap/ZENVY`
3. Framework: **Next.js** (tự detect)
4. **KHÔNG** cần sửa Build Command — đã được cấu hình đúng trong `package.json`:
   ```
   prisma generate && next build
   ```

---

## Bước 3 — Cấu hình Environment Variables trên Vercel

Vào **Project → Settings → Environment Variables**, thêm từng biến sau:

### 🔴 Bắt buộc (app sẽ crash nếu thiếu)

| Tên biến | Mô tả | Lấy ở đâu |
|---|---|---|
| `DATABASE_URL` | Connection string Neon DB | Neon Console → Connection Details |
| `JWT_SECRET` | Key ký JWT token (≥32 ký tự) | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Domain production | VD: `https://zenvy.vercel.app` |

### 🟡 Quan trọng (tính năng bị vô hiệu nếu thiếu)

| Tên biến | Mô tả | Lấy ở đâu |
|---|---|---|
| `EMAIL_USER` | Gmail dùng gửi mail | Gmail account |
| `EMAIL_PASSWORD` | Gmail App Password (16 ký tự) | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `ADMIN_EMAIL` | Email nhận thông báo booking | Email của admin |
| `OPENAI_API_KEY` | Key dùng cho AI Tarot | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

### 🟢 Tuỳ chọn (Web Push Notifications)

| Tên biến | Mô tả | Lấy ở đâu |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | VAPID private key | Cùng lệnh trên |
| `VAPID_MAILTO` | Email liên hệ VAPID | VD: `mailto:admin@zenvy.vn` |

---

## Bước 4 — Tạo tài khoản Admin sau khi deploy

Sau khi deploy thành công, chạy lệnh seed từ máy local (với DATABASE_URL production):

```bash
# Tạm thời set DATABASE_URL production vào .env.local rồi chạy:
npx prisma db seed
```

Hoặc tạo thủ công qua Neon SQL Editor:

```sql
-- Tạo role ADMIN nếu chưa có
INSERT INTO roles (name, description) VALUES ('ADMIN', 'Administrator')
ON CONFLICT (name) DO NOTHING;

-- Xem id của role ADMIN
SELECT id FROM roles WHERE name = 'ADMIN';
```

Tài khoản demo đã được seed:
- **Admin**: `admin@zenvy.vn` / `Admin@123`
- **Customer**: `customer@zenvy.vn` / `Customer@123`
- **Reader**: `reader@zenvy.vn` / `Reader@123`

> ⚠️ Đổi mật khẩu ngay sau khi deploy production!

---

## Bước 5 — Kiểm tra sau deploy

- [ ] Trang chủ load được: `https://your-domain.vercel.app`
- [ ] Danh sách readers hiển thị
- [ ] Đăng nhập User/Reader hoạt động
- [ ] Admin panel hoạt động tại `/admin/login`
- [ ] Đặt lịch thành công (test end-to-end)

---

## Lưu ý quan trọng

- **Không bao giờ** commit file `.env` lên Git (đã được bảo vệ trong `.gitignore`)
- Mỗi lần thay đổi schema Prisma, chạy `npx prisma db push` trên Neon trước khi push code
- Vercel Free tier giới hạn **100GB bandwidth/tháng** và **6000 phút build/tháng** — đủ dùng cho giai đoạn đầu
- Neon Free tier: **0.5 GB storage**, **190 compute hours/tháng** — đủ cho ~500 users
