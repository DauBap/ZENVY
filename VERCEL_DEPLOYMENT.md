# Triển khai lên Vercel + Neon

## Bước 1: Chuẩn bị GitHub repo

1. Tạo repo GitHub mới (ví dụ: `zenvy-app`)
2. Push code lên GitHub (nếu chưa):
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zenvy-app.git
git push -u origin main
```

## Bước 2: Kết nối Vercel với GitHub

1. Truy cập https://vercel.com và đăng nhập/tạo tài khoản.
2. Bấm "Add New ..." → "Project"
3. Chọn "Import Git Repository"
4. Tìm và chọn repo `zenvy-app` (Vercel sẽ hiển thị danh sách)
5. Bấm "Import"

## Bước 3: Cấu hình Build

Vercel tự phát hiện Next.js, nên:
- **Framework Preset**: Next.js (tự động)
- **Build Command**: `npm run build` (tự động)
- **Output Directory**: `.next` (tự động)
- **Install Command**: `npm install` (tự động)

**Không cần thay đổi** — bấm "Deploy" để test build trước.

## Bước 4: Đặt Environment Variables

Trước khi deploy, cần đặt `DATABASE_URL` để Vercel kết nối Neon.

### Cách 1: Trong giao diện Vercel
1. Sau khi import repo, bấm **Settings** → **Environment Variables**
2. Thêm biến:
   - **Name**: `DATABASE_URL`
   - **Value**: Dán connection string từ Neon (ví dụ):
   ```
   postgresql://neondb_owner:npg_arEFwib3xtT0@ep-curly-frog-aoh8o0fz-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   - **Environments**: Chọn `Production` (bạn có thể thêm Development sau)
3. Bấm "Save"

### Cách 2: Qua .env.production.local (nên dùng Cách 1 để an toàn)
Không push `.env` có secret lên GitHub — dùng Vercel UI là an toàn nhất.

## Bước 5: Deploy

1. Quay lại tab "Deployments" hoặc bấm "Continue to Dashboard"
2. Nếu chưa deploy, bấm "Deploy now" (Vercel sẽ chạy build)
3. Chờ build hoàn tất (~ 2-3 phút)
4. Nếu build thành công, sẽ thấy dòng xanh "✓ Ready" với domain live (ví dụ: `zenvy-app.vercel.app`)

## Bước 6: Áp dụng Database Migrations trên Vercel

Mặc định, `npm run build` không chạy migration (chỉ build Next.js).
Nếu bạn cần áp migration tự động, hãy thêm **Build Command**:

```bash
npm run prisma:generate && npm run prisma:deploy && npm run build
```

Hoặc chỉ để mặc định nếu schema đã được đẩy lên Neon bằng `prisma db push` (bạn đã làm rồi).

## Bước 7: Kiểm tra Live App

1. Truy cập domain live: `https://zenvy-app.vercel.app`
2. Kiểm tra API:
   - GET: `https://zenvy-app.vercel.app/api/users`
   - POST: `https://zenvy-app.vercel.app/api/users` với body:
   ```json
   {
     "name": "Live Test",
     "email": "live@example.com"
   }
   ```

## Bước 8: Cập nhật liên tục

- Bất cứ khi nào push code lên GitHub (branch `main`), Vercel tự động deploy.
- Kiểm tra "Deployments" tab trên Vercel để xem logs.

## Troubleshooting

### Build failed
- Kiểm tra logs: Vercel → Deployments → chọn failed deploy → xem output
- Thường là lỗi dependencies hoặc env var không set

### Database connection error (502 / connection timeout)
- Đảm bảo `DATABASE_URL` đúng trong Vercel Environment Variables
- Vercel IP có thể cần whitelist trên Neon (nếu Neon bật IP restrictions)
  - Mặc định Neon cho phép all IPs

### API trả về 500
- Kiểm tra Vercel logs: Deployments → select deploy → Logs (realtime)
- Thường là schema Prisma không sync với DB

## File quan trọng

- `.env`: Local dev (chứa DATABASE_URL, KHÔNG push lên GitHub)
- `.env.example`: Mẫu (push lên GitHub để hướng dẫn)
- `prisma/schema.prisma`: Định nghĩa DB (push lên GitHub)
- `app/api/users/route.js`: API endpoint (push lên GitHub)

## Link tham khảo

- Vercel docs: https://vercel.com/docs
- Next.js + Vercel: https://nextjs.org/learn/basics/deploying-nextjs-app
- Neon docs: https://neon.tech/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
