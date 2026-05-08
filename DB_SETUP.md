# DB setup (Neon + Prisma)

1. Đăng ký Neon: https://neon.tech/ — tạo project, tạo branch (main) và lấy `DATABASE_URL`.

2. Tại máy local, tạo file `.env` trong root và dán `DATABASE_URL` (xem `.env.example`).

3. Cài dependencies và generate client:

```bash
npm install
npm run prisma:generate
```

4. Chạy migration local (dev) — sẽ tạo bảng `User`:

```bash
npm run prisma:migrate
```

5. Để áp migration lên Neon (production), dùng:

```bash
npm run prisma:generate
npm run prisma:deploy
```

6. Kiểm tra API endpoints (dev):

GET  /api/users  — lấy danh sách users
POST /api/users  — body JSON `{ "name": "Nguyen", "email": "a@b.com" }`

7. Triển khai: trên Vercel (hoặc host khác), đặt `DATABASE_URL` trong Environment Variables trỏ tới Neon và chạy build.
