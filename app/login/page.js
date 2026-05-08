export default function LoginPage() {
  return (
    <div>
      <section>
        <h1>Đăng nhập Zenvy</h1>
        <form style={{ maxWidth: '400px', marginTop: '20px' }}>
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

          <button type="submit" style={{ width: '100%', padding: '12px' }}>
            Đăng nhập
          </button>
        </form>

        <p style={{ marginTop: '20px' }}>
          Chưa có tài khoản? <a href="/register">Đăng ký tại đây</a>
        </p>
      </section>

      <section style={{ backgroundColor: '#f0f0f0', padding: '15px' }}>
        <p><strong>Lưu ý:</strong> Đây là bản prototype cấu trúc - chưa có chức năng đăng nhập thật</p>
      </section>
    </div>
  );
}
