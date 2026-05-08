export default function ChatPage() {
  return (
    <div>
      <section>
        <h1>Chat với Reader</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
        <section style={{ height: 'fit-content' }}>
          <h3>Cuộc trò chuyện</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Luna</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>Hôm nay lúc 2:30</p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #ddd' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Celestine</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>Hôm qua</p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #ddd' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Phoenix</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>3 ngày trước</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Đang chat với Luna</h3>
          <div style={{ height: '400px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '15px', overflowY: 'auto', marginBottom: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', margin: 0 }}>
                Chào bạn! Mình sẵn sàng bắt đầu phiên xem bài. Bạn đang băn khoăn điều gì?
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Luna - 2:30</p>
            </div>

            <div style={{ marginBottom: '15px', textAlign: 'right' }}>
              <p style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '4px', margin: 0, textAlign: 'left', display: 'inline-block' }}>
                Mình muốn được định hướng về con đường sự nghiệp
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Bạn - 2:45</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', margin: 0 }}>
                Để mình rút vài lá bài cho bạn...
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Luna - 2:50</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button>Gửi</button>
          </div>
        </section>
      </div>

      <section style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '15px' }}>
        <p><strong>Lưu ý:</strong> Đây là bản prototype cấu trúc - chưa có chat realtime thật</p>
      </section>
    </div>
  );
}
