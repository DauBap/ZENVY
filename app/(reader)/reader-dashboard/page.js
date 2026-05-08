export default function ReaderDashboardPage() {
  return (
    <div>
      <section>
        <h1>Bảng điều khiển Reader</h1>
        <p>Chào mừng quay lại, Luna! Đây là tổng quan hôm nay.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <section style={{ textAlign: 'center' }}>
          <h3>Tổng thu nhập</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>$2,450</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Tháng này</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Tổng phiên</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>47</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Tất cả thời gian</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Đánh giá</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>⭐ 4.9</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Dựa trên 237 đánh giá</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Phiên hôm nay</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>3</p>
          <p style={{ fontSize: '12px', color: '#666' }}>Sắp diễn ra</p>
        </section>
      </div>

      <section>
        <h2>Phiên sắp tới hôm nay</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Giờ</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Người dùng</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thời lượng</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>10:00 AM</td>
              <td style={{ padding: '10px' }}>Sarah M.</td>
              <td style={{ padding: '10px' }}>30 min</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}><button>Vào</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>2:00 PM</td>
              <td style={{ padding: '10px' }}>John D.</td>
              <td style={{ padding: '10px' }}>60 min</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}><button>Vào</button></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>4:30 PM</td>
              <td style={{ padding: '10px' }}>Emily R.</td>
              <td style={{ padding: '10px' }}>30 min</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}><button>Vào</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Hoạt động gần đây</h2>
        <ul style={{ marginTop: '20px' }}>
          <li>Hoàn tất phiên với Sarah M. (30 phút) - Đánh giá: ⭐⭐⭐⭐⭐</li>
          <li>Đã xử lý payout: $450 - 01/05/2026</li>
          <li>Đánh giá mới từ John D.: "Xem bài rất hay!"</li>
          <li>Hoàn tất phiên với Emily R. (60 phút)</li>
        </ul>
      </section>
    </div>
  );
}
