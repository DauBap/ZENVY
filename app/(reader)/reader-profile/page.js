export default function ReaderProfilePage() {
  return (
    <div>
      <section>
        <h1>Chỉnh sửa hồ sơ</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section>
          <h2>Thông tin cá nhân</h2>
          <form style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tên hiển thị
              </label>
              <input
                type="text"
                id="name"
                defaultValue="Luna"
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
                defaultValue="luna@example.com"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                SĐT
              </label>
              <input
                type="tel"
                id="phone"
                defaultValue="+1 (555) 987-6543"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="bio" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Giới thiệu
              </label>
              <textarea
                id="bio"
                defaultValue="Tarot reader nhiều kinh nghiệm (10+ năm). Chuyên về tình cảm, sự nghiệp và phát triển bản thân."
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
              />
            </div>

            <button type="submit">Lưu thay đổi</button>
          </form>
        </section>

        <section>
          <h2>Chuyên môn & Giá</h2>
          <form style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="specialty" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Chuyên môn chính
              </label>
              <input
                type="text"
                id="specialty"
                defaultValue="Tarot & Astrology"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="rate30" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Giá / 30 phút
              </label>
              <input
                type="number"
                id="rate30"
                defaultValue="50"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="rate60" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Giá / 60 phút
              </label>
              <input
                type="number"
                id="rate60"
                defaultValue="90"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="availability" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Trạng thái
              </label>
              <select
                id="availability"
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option>Sẵn sàng</option>
                <option>Bận</option>
                <option>Đang nghỉ</option>
              </select>
            </div>

            <button type="submit">Lưu giá</button>
          </form>
        </section>
      </div>

      <section style={{ marginTop: '30px' }}>
        <h2>Trạng thái xác minh</h2>
        <p style={{ marginTop: '10px' }}>
          ✅ Đã xác minh email<br />
          ✅ Đã xác minh SĐT<br />
          ✅ Đã xác minh danh tính<br />
          ✅ Đạt kiểm tra nền
        </p>
      </section>
    </div>
  );
}
