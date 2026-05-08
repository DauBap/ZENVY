export default function AdminReadersPage() {
  return (
    <div>
      <section>
        <h1>Quản lý reader</h1>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button>Tìm</button>
          <button style={{ backgroundColor: '#28a745' }}>Thêm reader</button>
        </div>
      </section>

      <section>
        <h2>Danh sách reader</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Tên</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Chuyên môn</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Đánh giá</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Xác minh</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#R001</td>
              <td style={{ padding: '10px' }}>Luna</td>
              <td style={{ padding: '10px' }}>Tarot & Astrology</td>
              <td style={{ padding: '10px' }}>⭐ 4.9</td>
              <td style={{ padding: '10px' }}>🟢 Hoạt động</td>
              <td style={{ padding: '10px' }}>✅ Có</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Sửa</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#ff6b6b' }}>Vô hiệu</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#R002</td>
              <td style={{ padding: '10px' }}>Celestine</td>
              <td style={{ padding: '10px' }}>Love & Relationships</td>
              <td style={{ padding: '10px' }}>⭐ 4.8</td>
              <td style={{ padding: '10px' }}>🟢 Hoạt động</td>
              <td style={{ padding: '10px' }}>✅ Có</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Sửa</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#ff6b6b' }}>Vô hiệu</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#R003</td>
              <td style={{ padding: '10px' }}>Phoenix</td>
              <td style={{ padding: '10px' }}>Career & Business</td>
              <td style={{ padding: '10px' }}>⭐ 4.7</td>
              <td style={{ padding: '10px' }}>🟡 Chờ xác minh</td>
              <td style={{ padding: '10px' }}>⏳ Chờ</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Xem</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#28a745' }}>Xác minh</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>#R004</td>
              <td style={{ padding: '10px' }}>Mystica</td>
              <td style={{ padding: '10px' }}>General Tarot</td>
              <td style={{ padding: '10px' }}>N/A</td>
              <td style={{ padding: '10px' }}>🔴 Banned</td>
              <td style={{ padding: '10px' }}>❌ Không</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Chi tiết</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#999' }}>Disabled</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Hàng chờ duyệt reader</h2>
        <p>Chờ xác minh: 5</p>
        <button style={{ marginTop: '10px' }}>Xem hồ sơ chờ duyệt</button>
      </section>
    </div>
  );
}
