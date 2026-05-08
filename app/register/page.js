export default function RegisterPage() {
  return (
    <div>
      <section>
        <h1>Đăng ký Zenvy</h1>

        <div style={{ marginBottom: '20px' }}>
          <h3>Chọn loại tài khoản</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
            <button style={{ padding: '15px 30px', minWidth: '150px' }}>Đăng ký Người dùng</button>
            <button style={{ padding: '15px 30px', minWidth: '150px' }}>Đăng ký Reader</button>
          </div>
        </div>

        <form style={{ maxWidth: '400px', marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Họ và tên
            </label>
            <input
              type="text"
              id="name"
              placeholder="Nguyễn Văn A"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="your@email.com"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="confirm" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirm"
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px' }}>
            Tạo tài khoản
          </button>
        </form>

        <p style={{ marginTop: '20px' }}>
          Đã có tài khoản? <a href="/login">Đăng nhập tại đây</a>
        </p>
      </section>

      <section style={{ backgroundColor: '#f0f0f0', padding: '15px' }}>
        <p><strong>Lưu ý:</strong> Đây là bản prototype cấu trúc - chưa có chức năng đăng ký thật</p>
      </section>
    </div>
  );
}
