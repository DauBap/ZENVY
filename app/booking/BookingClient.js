'use client';

import { useSearchParams } from 'next/navigation';

export function BookingClient() {
  const searchParams = useSearchParams();
  const readerId = searchParams.get('reader') || '1';

  return (
    <div>
      <section>
        <h1>Đặt lịch & Thanh toán</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <section>
          <h2>Thông tin đặt lịch</h2>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Reader:</strong> Luna (ID: {readerId})</p>
            <p><strong>Dịch vụ:</strong> Tarot Reading - 30 phút</p>
            <p><strong>Giá:</strong> $50</p>
          </div>

          <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Chọn ngày
            </label>
            <input
              type="date"
              id="date"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}
            />

            <label htmlFor="time" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Chọn giờ
            </label>
            <select
              id="time"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}
            >
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>2:00 PM</option>
              <option>4:00 PM</option>
            </select>

            <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Yêu cầu thêm (không bắt buộc)
            </label>
            <textarea
              id="notes"
              placeholder="Bạn muốn hỏi/chia sẻ chủ đề cụ thể nào không?"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', marginBottom: '15px' }}
            />
          </div>
        </section>

        <section>
          <h2>Tóm tắt đơn</h2>
          <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <span>Tarot Reading (30 phút)</span>
              <span>$50.00</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <span>Phí nền tảng</span>
              <span>$2.50</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Tổng</span>
              <span>$52.50</span>
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Phương thức thanh toán</h3>
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input type="radio" name="payment" defaultChecked />
              <span style={{ marginLeft: '10px' }}>Thẻ tín dụng (demo)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input type="radio" name="payment" />
              <span style={{ marginLeft: '10px' }}>PayPal (demo)</span>
            </label>
          </div>

          <button style={{ width: '100%', padding: '15px', marginTop: '20px', fontSize: '16px' }}>
            Hoàn tất đặt lịch
          </button>
        </section>
      </div>

      <section style={{ marginTop: '30px', backgroundColor: '#f0f0f0', padding: '15px' }}>
        <p><strong>Lưu ý:</strong> Đây là bản prototype cấu trúc - chưa có xử lý thanh toán thật</p>
      </section>
    </div>
  );
}
