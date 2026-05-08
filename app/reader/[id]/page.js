import Link from 'next/link';

export default function ReaderProfilePage({ params }) {
  const readerId = params.id;

  // Mock reader data
  const readerData = {
    id: readerId,
    name: 'Luna',
    specialty: 'Tarot & Astrology',
    rating: 4.9,
    reviews: 237,
    bio: 'Tarot reader nhiều kinh nghiệm (10+ năm). Chuyên về tình cảm, sự nghiệp và phát triển bản thân.',
    price: 50,
    availability: 'Có thể nhận lịch hôm nay',
    experience: '10+ years',
  };

  return (
    <div>
      <section>
        <h1>{readerData.name}</h1>
        <p><strong>Chuyên môn:</strong> {readerData.specialty}</p>
        <p><strong>Đánh giá:</strong> ⭐ {readerData.rating} ({readerData.reviews} lượt đánh giá)</p>
        <p><strong>Kinh nghiệm:</strong> {readerData.experience}</p>
        <p><strong>Giá mỗi phiên:</strong> ${readerData.price}</p>
        <p><strong>Tình trạng:</strong> {readerData.availability}</p>
      </section>

      <section>
        <h2>Giới thiệu</h2>
        <p>{readerData.bio}</p>
      </section>

      <section>
        <h2>Dịch vụ</h2>
        <ul style={{ marginTop: '20px' }}>
          <li>Tarot Reading - 30 phút</li>
          <li>Tarot chuyên sâu - 60 phút</li>
          <li>Tư vấn chiêm tinh - 30 phút</li>
          <li>Phiên định hướng - 45 phút</li>
        </ul>
      </section>

      <section>
        <h2>Đánh giá</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f9f9f9', marginBottom: '10px', borderRadius: '4px' }}>
            <p><strong>Sarah K.</strong> - ⭐⭐⭐⭐⭐</p>
            <p>"Xem bài rất hay! Rất sâu sắc và đúng."</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f9f9f9', marginBottom: '10px', borderRadius: '4px' }}>
            <p><strong>John D.</strong> - ⭐⭐⭐⭐⭐</p>
            <p>"Luna rất chuyên nghiệp và có tâm. Rất đáng thử!"</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Đặt lịch</h2>
        <Link href={`/booking?reader=${readerId}`}>
          <button style={{ padding: '15px 30px', fontSize: '16px' }}>
            Đặt ngay - ${readerData.price}
          </button>
        </Link>
      </section>
    </div>
  );
}
