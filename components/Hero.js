export default function Hero() {
  return (
    <div className="heroFullscreen">
      <div style={{ textAlign: 'center', maxWidth: '920px', width: '100%' }}>
        <h1 style={{ fontSize: '48px', lineHeight: 1.05, margin: '0 0 10px', letterSpacing: '-1px' }}>ZENVY</h1>
        <p style={{ fontSize: '16px', color: '#666', margin: '0 0 20px' }}>
          khám phá bản thân - hỗ trợ cảm xúc - nền tảng định hướng
        </p>

        <div className="heroCtas">
          <a href="/home" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '12px 20px', fontSize: '16px' }}>Bắt đầu</button>
          </a>
        </div>
       
      </div>
    </div>
  );
}
