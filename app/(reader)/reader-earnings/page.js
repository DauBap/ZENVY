export default function ReaderEarningsPage() {
  return (
    <div>
      <section>
        <h1>Thu nhập & Payout</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <section style={{ textAlign: 'center' }}>
          <h3>Tháng này</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>$2,450</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Tổng thu nhập</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>$12,340</p>
        </section>

        <section style={{ textAlign: 'center' }}>
          <h3>Payout chờ</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>$1,250</p>
        </section>
      </div>

      <section>
        <h2>Giao dịch gần đây</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Ngày</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Loại</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Mô tả</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Số tiền</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>May 1, 2026</td>
              <td style={{ padding: '10px' }}>Payout</td>
              <td style={{ padding: '10px' }}>Payout tháng - 04/2026</td>
              <td style={{ padding: '10px', color: '#00aa00' }}>+$2,100</td>
              <td style={{ padding: '10px' }}>✅ Hoàn tất</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>Apr 30, 2026</td>
              <td style={{ padding: '10px' }}>Thu</td>
              <td style={{ padding: '10px' }}>Phiên với John D. (60 phút)</td>
              <td style={{ padding: '10px', color: '#00aa00' }}>+$90</td>
              <td style={{ padding: '10px' }}>✅ Hoàn tất</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>Apr 29, 2026</td>
              <td style={{ padding: '10px' }}>Thu</td>
              <td style={{ padding: '10px' }}>Phiên với Sarah M. (30 phút)</td>
              <td style={{ padding: '10px', color: '#00aa00' }}>+$50</td>
              <td style={{ padding: '10px' }}>✅ Hoàn tất</td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>Apr 28, 2026</td>
              <td style={{ padding: '10px' }}>Phí</td>
              <td style={{ padding: '10px' }}>Phí nền tảng (2%)</td>
              <td style={{ padding: '10px', color: '#ff0000' }}>-$2.50</td>
              <td style={{ padding: '10px' }}>✅ Hoàn tất</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Cài đặt payout</h2>
        <div style={{ marginTop: '20px' }}>
          <p><strong>Tài khoản ngân hàng:</strong> ••••••••5678 (Wells Fargo)</p>
          <p><strong>Lịch payout:</strong> Hàng tháng vào ngày 1</p>
          <p><strong>Payout tiếp theo:</strong> 01/06/2026 - $2,450</p>
          <button style={{ marginTop: '15px' }}>Cập nhật phương thức payout</button>
        </div>
      </section>

      <section>
        <h2>Tải báo cáo</h2>
        <button style={{ marginRight: '10px' }}>📊 Báo cáo tháng 4</button>
        <button style={{ marginRight: '10px' }}>📊 Báo cáo tháng 3</button>
        <button>📊 Tổng kết năm</button>
      </section>
    </div>
  );
}
