export default function UserProfilePage() {
  return (
    <div>
      <section>
        <h1>Hồ sơ của tôi</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section>
          <h2>Thông tin hồ sơ</h2>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Họ tên:</strong> John Doe</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
            <p><strong>SĐT:</strong> +1 (555) 123-4567</p>
            <p><strong>Khu vực:</strong> New York, USA</p>
            <p><strong>Tham gia từ:</strong> 01/2026</p>
            <p><strong>Trạng thái:</strong> Đang hoạt động</p>
          </div>

          <button style={{ marginTop: '20px' }}>Chỉnh sửa hồ sơ</button>
          <button style={{ marginTop: '10px', backgroundColor: '#999', marginLeft: '10px' }}>Đổi mật khẩu</button>
        </section>

        <section>
          <h2>Cài đặt tài khoản</h2>
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ marginLeft: '10px' }}>Nhận thông báo qua email</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input type="checkbox" defaultChecked />
              <span style={{ marginLeft: '10px' }}>Nhận cập nhật qua SMS</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input type="checkbox" />
              <span style={{ marginLeft: '10px' }}>Cho phép email khuyến mãi</span>
            </label>
          </div>

          <button style={{ marginTop: '20px', backgroundColor: '#ff6b6b' }}>Xóa tài khoản</button>
        </section>
      </div>

      <section style={{ marginTop: '30px' }}>
        <h2>Lịch sử đặt lịch</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Reader</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Ngày</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Giá</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>Luna</td>
              <td style={{ padding: '10px' }}>2026-05-02</td>
              <td style={{ padding: '10px' }}>✅ Hoàn tất</td>
              <td style={{ padding: '10px' }}>$50</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>Celestine</td>
              <td style={{ padding: '10px' }}>2026-04-28</td>
              <td style={{ padding: '10px' }}>✅ Hoàn tất</td>
              <td style={{ padding: '10px' }}>$60</td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>Phoenix</td>
              <td style={{ padding: '10px' }}>2026-05-10</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}>$45</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
