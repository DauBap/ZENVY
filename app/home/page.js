import Link from 'next/link';

export default function HomeReadersPage() {
  const mockReaders = [
    { id: 1, name: 'Luna', specialty: 'Tarot & Astrology', rating: 4.9 },
    { id: 2, name: 'Celestine', specialty: 'Love & Relationships', rating: 4.8 },
    { id: 3, name: 'Phoenix', specialty: 'Career & Business', rating: 4.7 },
  ];

  const newReaders = [
    { id: 4, name: 'Mystica', specialty: 'General Tarot', rating: 4.6 },
    { id: 5, name: 'Nova', specialty: 'Self Growth', rating: 4.7 },
    { id: 6, name: 'Aurora', specialty: 'Love & Relationships', rating: 4.8 },
  ];

  return (
    <div>
      <section>
        <h1>Reader mới</h1>

        <div className="readerHorizontalList" style={{ marginTop: '16px' }}>
          {newReaders.map((reader) => (
            <div
              key={reader.id}
              className="readerCardHorizontal"
              style={{
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: '#fff',
              }}
            >
              <h3 style={{ marginBottom: '6px' }}>{reader.name}</h3>
              <p style={{ marginBottom: '6px' }}>
                <strong>Chuyên môn:</strong> {reader.specialty}
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>Đánh giá:</strong> ⭐ {reader.rating}
              </p>
              <Link href={`/reader/${reader.id}`}>
                <button style={{ width: '100%' }}>Xem hồ sơ</button>
              </Link>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h1>Danh sách Reader</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
          {mockReaders.map((reader) => (
            <div
              key={reader.id}
              style={{
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: '#fff',
              }}
            >
              <h3 style={{ marginBottom: '6px' }}>{reader.name}</h3>
              <p style={{ marginBottom: '6px' }}>
                <strong>Chuyên môn:</strong> {reader.specialty}
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>Đánh giá:</strong> ⭐ {reader.rating}
              </p>
              <Link href={`/reader/${reader.id}`}>
                <button style={{ width: '100%' }}>Xem hồ sơ</button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

