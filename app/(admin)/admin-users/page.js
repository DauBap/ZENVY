export default function AdminUsersPage() {
  return (
    <div>
      <section>
        <h1>Quản lý người dùng</h1>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên..."
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button>Tìm</button>
          <button style={{ backgroundColor: '#28a745' }}>Thêm người dùng</button>
        </div>
      </section>

      <section>
        <h2>Danh sách người dùng</h2>
        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Tên</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Trạng thái</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Tham gia</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#U001</td>
              <td style={{ padding: '10px' }}>John Doe</td>
              <td style={{ padding: '10px' }}>john@example.com</td>
              <td style={{ padding: '10px' }}>🟢 Hoạt động</td>
              <td style={{ padding: '10px' }}>Jan 15, 2026</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Sửa</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#ff6b6b' }}>Vô hiệu</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#U002</td>
              <td style={{ padding: '10px' }}>Sarah M.</td>
              <td style={{ padding: '10px' }}>sarah@example.com</td>
              <td style={{ padding: '10px' }}>🟢 Hoạt động</td>
              <td style={{ padding: '10px' }}>Feb 3, 2026</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Sửa</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#ff6b6b' }}>Vô hiệu</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>#U003</td>
              <td style={{ padding: '10px' }}>Emily R.</td>
              <td style={{ padding: '10px' }}>emily@example.com</td>
              <td style={{ padding: '10px' }}>🔴 Tạm khóa</td>
              <td style={{ padding: '10px' }}>Mar 20, 2026</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Xem</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#28a745' }}>Mở lại</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>#U004</td>
              <td style={{ padding: '10px' }}>Michael T.</td>
              <td style={{ padding: '10px' }}>michael@example.com</td>
              <td style={{ padding: '10px' }}>🟢 Hoạt động</td>
              <td style={{ padding: '10px' }}>Apr 1, 2026</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px' }}>Sửa</button>
                <button style={{ padding: '5px 10px', backgroundColor: '#ff6b6b' }}>Vô hiệu</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Bộ lọc</h2>
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <input type="checkbox" defaultChecked /> Người dùng hoạt động
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <input type="checkbox" /> Người dùng tạm khóa
          </label>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <input type="checkbox" /> Người dùng đã xác minh
          </label>
        </div>
      </section>
    </div>
  );
}
