export default function AdminDashboardPage() {
  return (
    <div>
      <section>
        <h1>Bảng điều khiển Admin</h1>
        <p>Tổng quan & phân tích nền tảng</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <section style={{ textAlign: 'center' }}>
          <h3>Tổng người dùng</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>1,234</p>
          <p style={{ fontSize: '12px', color: '#666' }}>↑ 12% tháng này</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Tổng reader</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>156</p>
          <p style={{ fontSize: '12px', color: '#666' }}>↑ 8% tháng này</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Phiên đang hoạt động</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>42</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Đang diễn ra</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Doanh thu</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>$45,320</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Tháng này</p>
        </section>
      </div>

      <section>
        <h2>Sự cố gần đây</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Loại</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Người báo</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#IR-001</td>
              <td style={{ padding: '10px' }}>Vấn đề thanh toán</td>
              <td style={{ padding: '10px' }}>User#456</td>
              <td style={{ padding: '10px' }}>🔴 Chờ xử lý</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Xem</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#IR-002</td>
              <td style={{ padding: '10px' }}>Khiếu nại reader</td>
              <td style={{ padding: '10px' }}>Reader#78</td>
              <td style={{ padding: '10px' }}>🟡 Đang xem xét</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Xem</button></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>#IR-003</td>
              <td style={{ padding: '10px' }}>Lỗi kỹ thuật</td>
              <td style={{ padding: '10px' }}>User#123</td>
              <td style={{ padding: '10px' }}>🟢 Đã xử lý</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Chi tiết</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Thao tác nhanh</h2>
        <button style={{ marginRight: '10px' }}>Gửi thông báo nền tảng</button>
        <button style={{ marginRight: '10px' }}>Tạo báo cáo tháng</button>
        <button>Cài đặt hệ thống</button>
      </section>
    </div>
  );
}
