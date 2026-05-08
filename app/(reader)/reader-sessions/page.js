export default function ReaderSessionsPage() {
  return (
    <div>
      <section>
        <h1>Quản lý phiên</h1>
      </section>

      <section>
        <h2>Phiên sắp tới</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Ngày & Giờ</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Người dùng</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thời lượng</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Giá</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>May 5, 2026 - 10:00 AM</td>
              <td style={{ padding: '10px' }}>Sarah M.</td>
              <td style={{ padding: '10px' }}>30 min</td>
              <td style={{ padding: '10px' }}>$50</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Bắt đầu</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>May 5, 2026 - 2:00 PM</td>
              <td style={{ padding: '10px' }}>John D.</td>
              <td style={{ padding: '10px' }}>60 min</td>
              <td style={{ padding: '10px' }}>$90</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Bắt đầu</button></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>May 6, 2026 - 3:00 PM</td>
              <td style={{ padding: '10px' }}>Emily R.</td>
              <td style={{ padding: '10px' }}>45 min</td>
              <td style={{ padding: '10px' }}>$70</td>
              <td style={{ padding: '10px' }}>⏳ Đã đặt</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Bắt đầu</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Phiên đã hoàn tất</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Ngày</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Người dùng</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thời lượng</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Giá</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Đánh giá</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>May 2, 2026</td>
              <td style={{ padding: '10px' }}>Sarah M.</td>
              <td style={{ padding: '10px' }}>30 min</td>
              <td style={{ padding: '10px' }}>$50</td>
              <td style={{ padding: '10px' }}>⭐⭐⭐⭐⭐</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Chi tiết</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>May 1, 2026</td>
              <td style={{ padding: '10px' }}>Michael T.</td>
              <td style={{ padding: '10px' }}>60 min</td>
              <td style={{ padding: '10px' }}>$90</td>
              <td style={{ padding: '10px' }}>⭐⭐⭐⭐⭐</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Chi tiết</button></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>Apr 28, 2026</td>
              <td style={{ padding: '10px' }}>Lisa K.</td>
              <td style={{ padding: '10px' }}>45 min</td>
              <td style={{ padding: '10px' }}>$70</td>
              <td style={{ padding: '10px' }}>⭐⭐⭐⭐</td>
              <td style={{ padding: '10px' }}><button style={{ padding: '5px 10px' }}>Chi tiết</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Tùy chọn phiên</h2>
        <button style={{ marginRight: '10px' }}>Dời lịch</button>
        <button style={{ backgroundColor: '#ff6b6b' }}>Hủy phiên</button>
      </section>
    </div>
  );
}
