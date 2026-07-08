# Reader-Reader Interaction Restrictions Analysis

## Executive Summary
The codebase has multiple layers of restrictions preventing readers from interacting with other readers. These restrictions exist in both the backend API layer and the frontend UI layer. Below is a detailed breakdown of each restriction area.

---

## 1. BOOKING SYSTEM ❌ BLOCKED

### Files Analyzed
- `app/api/bookings/route.ts` (POST - create booking)
- `app/api/bookings/[id]/route.ts` (GET/PATCH - update booking)
- `app/api/bookings/[id]/complete/route.ts` (POST - mark complete)

### Permission Restrictions

#### 🔴 Complete Session (Exclusive to Readers)
**File:** `app/api/bookings/[id]/complete/route.ts:14`
```typescript
if (session.role !== 'READER') 
  return NextResponse.json({ error: 'Chỉ reader mới thực hiện được.' }, { status: 403 })
```
- Only readers can mark sessions as complete
- But check on line 29 verifies that `booking.reader.user_id === session.sub`

#### ⚠️ Booking Creation (Implicit Customer-Only)
**File:** `app/api/bookings/route.ts:19-28`
```typescript
const customerInfo = await prisma.customerInfo.findUnique({
  where: { user_id: Number(session.sub) },
})

if (!customerInfo) {
  return NextResponse.json({ error: 'Không tìm thấy thông tin khách hàng.' }, { status: 404 })
}
```
- **Issue:** Requires `customerInfo` to exist - readers typically don't have this
- **Effect:** Readers cannot create bookings because they lack `customerInfo` records
- **This is an IMPLICIT restriction, not an explicit role check**

#### 📊 Booking Status Updates
**File:** `app/api/bookings/[id]/route.ts:156`
```typescript
if (session.role === 'READER') {
  // Reader-specific logic for confirming bookings
  // Only after payment_confirmed status
}
```
- Reader can only confirm (not create or modify other aspects)
- No validation preventing two readers from being in a booking together
- **Architectural issue:** The system assumes `customer_id` and `reader_id`, not `participant1` and `participant2`

### Root Cause
- The booking schema has `customer_id` and `reader_id` fields, not generic participant fields
- Only users with `customerInfo` records can create bookings
- API does NOT explicitly validate that booker ≠ reader, relies on data structure

### What Needs to Change
1. **Option A (Explicit Role Check):** Add validation in `POST /api/bookings`:
   ```typescript
   const readerId = Number(readerId);
   if (session.role === 'READER') {
     return NextResponse.json({ error: 'Readers cannot create bookings.' }, { status: 403 });
   }
   ```

2. **Option B (Allow Reader Bookings):** 
   - Create `customerInfo` records for readers who want to book
   - Remove role-based restriction
   - Let `customer_id` and `reader_id` naturally allow reader-reader bookings

---

## 2. CHAT SYSTEM ❌ BLOCKED

### Files Analyzed
- `app/api/conversations/route.ts` (GET/POST)
- `app/api/conversations/[id]/messages/route.ts` (GET/POST)
- `lib/chat.ts` (isParticipant check)
- `prisma/schema.prisma` (conversation schema)

### Permission Restrictions

#### 🔴 Conversation Role-Based Routing
**File:** `app/api/conversations/route.ts:91-124`
```typescript
if (session.role === 'READER') {
  // Reader mở hội thoại với một khách hàng (customerId = CustomerInfo.id)
  const customerId = Number(body.customerId)
  // ... get customerInfo ...
  customerUserId = ci.user_id
  readerUserId = userId
} else {
  // Khách mở hội thoại với một reader (readerId = ReaderInfo.id)
  const readerId = Number(body.readerId)
  // ... get readerInfo ...
  customerUserId = userId
  readerUserId = ri.user_id
}
```

#### 🔴 Hardcoded Unique Constraint
**File:** `prisma/schema.prisma:257`
```prisma
model Conversation {
  customer_user_id Int
  reader_user_id Int
  
  @@unique([customer_user_id, reader_user_id])
}
```
- **Critical Issue:** The schema enforces exactly TWO roles: customer and reader
- There is NO way to create a reader-reader conversation within this schema
- The unique constraint prevents duplicate customer-reader pairs, but also prevents reader-reader pairs

#### 📊 Conversation Access Control
**File:** `lib/chat.ts:27-30`
```typescript
function isParticipant(
  conv: { customer_user_id: number; reader_user_id: number },
  userId: number
): boolean {
  return conv.customer_user_id === userId || conv.reader_user_id === userId
}
```
- This check allows either participant to access
- But only works if the schema supports reader-reader conversations

### Root Cause
- **Primary:** Database schema explicitly models a two-role system (customer ↔ reader)
- **Secondary:** POST conversation endpoint routes based on role, forcing one to be customer, one to be reader
- **Tertiary:** UI components (below) disable chat for reader-viewer

### What Needs to Change
1. **Redesign Conversation Schema** - Currently requires changing the entire data model:
   ```prisma
   // BEFORE (role-based)
   model Conversation {
     customer_user_id Int
     reader_user_id Int
   }
   
   // AFTER (participant-based)
   model Conversation {
     user1_id Int
     user2_id Int
     @@unique([user1_id, user2_id])
   }
   ```

2. **Update API Logic** in `app/api/conversations/route.ts`:
   ```typescript
   // Remove role-based routing
   const targetUserId = Number(body.targetUserId)
   if (userId === targetUserId) {
     return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
   }
   const [user1_id, user2_id] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId]
   ```

---

## 3. FOLLOW/FAVORITES ⚠️ PARTIALLY BLOCKED

### Files Analyzed
- `app/api/readers/[id]/favorite/route.ts` (GET/POST)
- `components/readers/reader-profile-page.tsx` (UI disable)

### Permission Restrictions

#### 🟡 Backend API - NO EXPLICIT RESTRICTION
**File:** `app/api/readers/[id]/favorite/route.ts:54-90`
```typescript
// POST /api/readers/[id]/favorite
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  
  // ✅ NO ROLE CHECK HERE - Any authenticated user can favorite any reader
  const userId = Number(session.sub)
  const existing = await readerFavorite.findUnique(...)
  
  // Just toggle the favorite
  if (existing) {
    await readerFavorite.delete(...)
  } else {
    await readerFavorite.create({ data: { user_id: userId, reader_id: readerId } })
  }
}
```
- **No role check** in the API
- Readers CAN technically favorite other readers via API
- This is a **frontend-only restriction**

#### 🔴 Frontend UI - DISABLED FOR READERS
**File:** `components/readers/reader-profile-page.tsx:36 & 284-286`
```typescript
const isReaderViewer = user?.role === 'READER' && user?.readerStatus === 'ACTIVE'

<button
  onClick={toggleFav}
  disabled={isReaderViewer}
  title={isReaderViewer ? 'Reader không thể theo dõi reader khác' : undefined}
  className={cn('...', isFav ? '...' : '...', 'disabled:opacity-60')}
>
```

### Root Cause
- **Backend:** No restriction - this is actually working as intended
- **Frontend:** UI disables button with message "Reader không thể theo dõi reader khác" (Readers cannot follow other readers)
- **Mismatch:** Backend and frontend don't agree

### What Needs to Change
**Option 1 (Enforce Backend):**
```typescript
// Add to POST /api/readers/[id]/favorite
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { reader_info: true }
})
const isReader = user?.role?.name === 'READER' && user.reader_info?.status === 'ACTIVE'
if (isReader) {
  return NextResponse.json({ error: 'Readers cannot favorite other readers' }, { status: 403 })
}
```

**Option 2 (Enable in Frontend):**
```typescript
// Remove the disabled state
disabled={false} // Allow readers to favorite
```

---

## 4. PROFILE VIEWING ✅ ALLOWED

### Files Analyzed
- `app/readers/[id]/page.tsx`
- `components/readers/reader-profile-page.tsx`

### Permission Status
**No restrictions on viewing profiles** - Any user (authenticated or not) can view any reader's profile.

```typescript
// app/readers/[id]/page.tsx
export default async function ReaderRoutePage(...) {
  const reader = await prisma.readerInfo.findUnique({
    where: { id: Number(id) },
    // ... no permission check
  })
  return <ReaderProfilePage reader={serializeReader(reader)} />
}
```

### Restrictions on ACTIONS
While viewing is allowed, **actions are restricted**:

#### 🔴 Follow Button Disabled
**File:** `reader-profile-page.tsx:284-286`
```typescript
<button
  disabled={isReaderViewer}
  title={isReaderViewer ? 'Reader không thể theo dõi reader khác' : undefined}
>
```

#### 🔴 Chat Button Disabled
**File:** `reader-profile-page.tsx:301-303`
```typescript
{isReaderViewer ? (
  <button disabled title="Reader không thể nhắn tin với reader khác">
    <MessageCircle />
    Trò chuyện
  </button>
) : (
  <Link href={`/chat?reader=${reader.id}`}>
    {/* Chat available for non-readers */}
  </Link>
)}
```

#### 🔴 Booking Button Disabled
**File:** `reader-profile-page.tsx:326-343`
```typescript
{isReaderViewer ? (
  <>
    <Button disabled title="Reader không thể đặt lịch với reader khác">
      <Calendar /> Đặt lịch ngay
    </Button>
    <Button disabled variant="outline" title="Reader không thể nhắn tin với reader khác">
      <MessageCircle /> Nhắn tin
    </Button>
  </>
) : (
  // Booking/chat available for non-readers
)}
```

### Root Cause
- Viewing profiles is unrestricted (good design)
- Actions (follow, chat, book) are disabled via UI
- No backend validation for chat/booking (relies on schema + role-based routing)

### What Needs to Change
If allowing reader-reader interactions:
1. Remove `disabled={isReaderViewer}` from buttons
2. Update conditional routing to allow reader-reader chat/booking
3. Backend changes covered in sections 1 & 2

---

## 5. VOICE ACCESS ✅ ALLOWED (Reader-Only)

### Files Analyzed
- `app/api/reader/voice/route.ts` (PATCH/DELETE)

### Permission Status
**Voice upload is reader-only, but allows readers to upload:**

```typescript
// PATCH /api/reader/voice
export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || !session.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const userId = Number(session.sub)
  const readerInfo = await prisma.readerInfo.findUnique({ where: { user_id: userId } })
  const isReader = session.role === 'READER' || readerInfo?.status === 'ACTIVE'
  if (!isReader) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  
  // Readers can upload voice samples
  const updated = await prisma.readerInfo.upsert({...})
}
```

### Verdict
- ✅ Works as intended
- ✅ Allows readers to manage their voice samples
- ✅ Prevents customers from uploading voice samples
- ✅ No reader-reader restriction issues here

---

## 6. AVAILABILITY MANAGEMENT ✅ Allowed (Reader-Only)

### Files Analyzed
- `app/api/reader/availability/route.ts` (PUT/GET)

### Permission Status
**Availability is reader-only:**

```typescript
export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '...' }, { status: 401 })
  if (session.role !== 'READER') {
    return NextResponse.json({ error: 'Chỉ reader mới quản lý được lịch trống.' }, { status: 403 })
  }
}
```

### Verdict
- ✅ Appropriate restriction
- ✅ Only service providers (readers) should set availability
- ✅ No reader-reader interaction issues here

---

## Summary Table

| Feature | Backend Check | Frontend Block | Issue Type | Severity |
|---------|---------------|----------------|-----------|----------|
| **Booking** | Implicit (no customerInfo) | Disabled for readers | Schema design + implicit restriction | 🔴 High |
| **Chat** | Role-based routing + schema constraint | Disabled for readers | Schema + role routing | 🔴 High |
| **Favorites** | ❌ NONE | Disabled for readers | Frontend-only, backend allows! | 🟡 Medium |
| **Profile View** | ✅ Allowed | Disabled actions only | Intentional | ✅ OK |
| **Voice Upload** | Reader-only | N/A | Appropriate | ✅ OK |
| **Availability** | Reader-only | N/A | Appropriate | ✅ OK |

---

## Recommendations for Reader-Reader Interactions

### Priority 1: Database Schema (Required First)
Redesign `Conversation` model to support arbitrary user pairs, not just customer↔reader:
```prisma
model Conversation {
  id Int @id @default(autoincrement())
  user1_id Int
  user2_id Int
  created_at DateTime @default(now())
  
  @@unique([user1_id, user2_id])
  @@index([user1_id])
  @@index([user2_id])
}
```

### Priority 2: Booking Schema
Consider making booking generic or adding explicit reader-reader booking support:
```prisma
model Booking {
  // Current
  customer_id Int
  reader_id Int
  
  // OR add this for reader-reader:
  booking_type String // 'CUSTOMER_READER' | 'READER_READER' | 'CUSTOM'
}
```

### Priority 3: API Changes
1. **`POST /api/bookings`** - Remove customerInfo requirement OR create customerInfo for readers
2. **`POST /api/conversations`** - Remove role-based routing, use generic user lookup
3. **`POST /api/readers/[id]/favorite`** - Add backend check (if needed) or document that restriction is frontend-only

### Priority 4: UI Updates
Remove `isReaderViewer` disabling from:
- `components/readers/reader-profile-page.tsx` - buttons for chat, book, follow
- `components/booking/booking-form.tsx` - if exists
- Any other reader-profile-related components

---

## Files Requiring Changes

### Database Changes
- `prisma/schema.prisma` - Conversation model redesign

### Backend API Changes
- `app/api/conversations/route.ts` - Remove role-based routing
- `app/api/bookings/route.ts` - Remove customerInfo requirement OR ensure readers have customerInfo
- `app/api/readers/[id]/favorite/route.ts` - Optional: add backend restriction

### Frontend UI Changes
- `components/readers/reader-profile-page.tsx` - Remove isReaderViewer disabling
- `components/chat/chat-page.tsx` - Update if needed
- `components/booking/booking-form.tsx` - Check for reader restrictions

### Supporting Files
- `lib/chat.ts` - Update isParticipant logic if schema changes
- Migration scripts - Create Prisma migration for schema changes

---

## Testing Checklist

- [ ] Reader A can create booking with Reader B
- [ ] Reader A can chat with Reader B
- [ ] Reader A can follow/favorite Reader B
- [ ] Reader A can view Reader B profile
- [ ] Existing customer-reader bookings still work
- [ ] Existing customer-reader chats still work
- [ ] No regressions in admin functionality
