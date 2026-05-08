import { Suspense } from 'react';
import { BookingClient } from './BookingClient';

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <BookingClient />
    </Suspense>
  );
}
