export default function ReaderChatPage() {
  return (
    <div>
      <section>
        <h1>Tin nhắn</h1>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
        <section style={{ height: 'fit-content' }}>
          <h3>Cuộc trò chuyện</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Sarah M.</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>Hôm nay lúc 2:30</p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #ddd' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>John D.</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>Hôm qua</p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '4px', marginBottom: '10px', cursor: 'pointer', border: '1px solid #ddd' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Emily R.</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>3 ngày trước</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Đang chat với Sarah M.</h3>
          <div style={{ height: '400px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '15px', overflowY: 'auto', marginBottom: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '4px', margin: 0, textAlign: 'left', display: 'inline-block' }}>
                Chào Luna! Mình có vài câu hỏi trước phiên ngày mai
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Sarah M. - Hôm nay lúc 2:20</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', margin: 0 }}>
                Dĩ nhiên rồi! Bạn cứ hỏi nhé, mình sẵn sàng hỗ trợ.
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Bạn - Hôm nay lúc 2:25</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '4px', margin: 0, textAlign: 'left', display: 'inline-block' }}>
                Mình có thể xem bài tập trung về việc chuyển hướng sự nghiệp không?
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Sarah M. - Hôm nay lúc 2:30</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', margin: 0 }}>
                Hoàn toàn được. Đây là câu hỏi rất phù hợp để khai thác bằng tarot. Hẹn gặp bạn ngày mai!
              </p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Bạn - Hôm nay lúc 2:32</p>
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
    </div>
  );
}
