# Zenvy Platform - File Structure & Navigation Map

## 📁 Complete Directory Tree

```
zenvy/
│
├── 📄 package.json
├── 📄 next.config.js
├── 📄 tsconfig.json
├── 📄 .gitignore
├── 📄 README.md
│
├── 📂 app/ (Next.js App Router)
│   ├── 📄 layout.js (Root layout with Header & Footer)
│   ├── 📄 globals.css (Minimal CSS)
│   ├── 📄 page.js (HOME - Reader list)
│   │
│   ├── 🔓 PUBLIC PAGES
│   ├── 📂 login/
│   │   └── 📄 page.js
│   ├── 📂 register/
│   │   └── 📄 page.js
│   ├── 📂 profile/
│   │   └── 📄 page.js (User profile & booking history)
│   ├── 📂 booking/
│   │   └── 📄 page.js (Checkout & booking)
│   ├── 📂 chat/
│   │   └── 📄 page.js (Chat interface)
│   ├── 📂 reader/
│   │   └── 📂 [id]/
│   │       └── 📄 page.js (Dynamic reader profile)
│   │
│   ├── 👤 READER PAGES (Role Group)
│   ├── 📂 (reader)/
│   │   ├── 📄 layout.js (Sidebar + protected layout)
│   │   ├── 📂 reader-dashboard/
│   │   │   └── 📄 page.js
│   │   ├── 📂 reader-profile/
│   │   │   └── 📄 page.js
│   │   ├── 📂 reader-sessions/
│   │   │   └── 📄 page.js
│   │   ├── 📂 reader-earnings/
│   │   │   └── 📄 page.js
│   │   └── 📂 reader-chat/
│   │       └── 📄 page.js
│   │
│   └── 🔧 ADMIN PAGES (Role Group)
│       └── 📂 (admin)/
│           ├── 📄 layout.js (Sidebar + protected layout)
│           ├── 📂 admin-dashboard/
│           │   └── 📄 page.js
│           ├── 📂 admin-users/
│           │   └── 📄 page.js
│           ├── 📂 admin-readers/
│           │   └── 📄 page.js
│           ├── 📂 admin-transactions/
│           │   └── 📄 page.js
│           └── 📂 admin-reports/
│               └── 📄 page.js
│
├── 📂 components/
│   ├── 📄 Header.js (Navigation & Role Switcher)
│   └── 📄 Footer.js (Footer)
│
└── 📂 lib/
    └── 📄 roles.js (Mock Role System)
```

## 🗺️ Navigation Flow

### 🏠 Home Page (/)
- Public access
- Featured readers list
- How it works section
- Quick links

### 👤 USER ROLE
```
/ (Home)
├── /login
├── /register
├── /profile (User Profile)
├── /reader/:id (Reader Profile)
├── /booking (Book Session)
└── /chat (Messages)
```

### 🔮 READER ROLE
```
/ (Home)
├── /reader-dashboard (Overview & Stats)
├── /reader-profile (Edit Profile & Rates)
├── /reader-sessions (Session Management)
├── /reader-earnings (Earnings & Payouts)
└── /reader-chat (Messages)
```

### 🛠️ ADMIN ROLE
```
/ (Home)
├── /admin-dashboard (Platform Overview)
├── /admin-users (User Management)
├── /admin-readers (Reader Management)
├── /admin-transactions (Transaction Logs)
└── /admin-reports (Reports & Complaints)
```

## 📊 Page Details

### Public Pages

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Reader discovery, platform overview |
| Login | `/login` | User authentication |
| Register | `/register` | Account creation |
| Reader Profile | `/reader/:id` | View reader details, book session |
| Booking | `/booking` | Session checkout flow |
| Chat | `/chat` | Messaging interface |
| User Profile | `/profile` | User account management |

### Reader Pages (Protected)

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/reader-dashboard` | Stats, upcoming sessions |
| Edit Profile | `/reader-profile` | Manage profile, rates, specialty |
| Sessions | `/reader-sessions` | Upcoming and completed sessions |
| Earnings | `/reader-earnings` | Income tracking, payouts |
| Chat | `/reader-chat` | Messages with users |

### Admin Pages (Protected)

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/admin-dashboard` | Platform stats, recent issues |
| Users | `/admin-users` | Manage user accounts |
| Readers | `/admin-readers` | Manage reader accounts, verification |
| Transactions | `/admin-transactions` | Payment logs, disputes |
| Reports | `/admin-reports` | Issues, complaints, fraud reports |

## 🔐 Role-Based Access

The Header component detects the current role and displays appropriate navigation:

- **USER**: See user links (Profile, Chat)
- **READER**: See reader links (Dashboard, Sessions, Earnings)
- **ADMIN**: See admin links (Users, Readers, Transactions)

Role Switching buttons allow testing different roles during development.

## 🧩 Component Breakdown

### Header.js
- Shows current role
- Displays role-specific navigation
- Role switcher buttons
- Responsive layout

### Footer.js
- Copyright info
- Disclaimer note

### Layout System
- Root layout (app/layout.js)
- Reader layout (app/(reader)/layout.js) - Sidebar navigation
- Admin layout (app/(admin)/layout.js) - Sidebar navigation

## 📋 Key Features

✅ **Complete page structure** for all 3 roles
✅ **Dynamic routing** with URL parameters
✅ **Role-based layouts** with grouping
✅ **Mock role system** for testing
✅ **Placeholder components** with clear sections
✅ **Responsive grid layouts** for data tables
✅ **Sidebar navigation** for role-specific pages
✅ **Consistent styling** across pages
✅ **Clear information hierarchy** in each page

## 🚀 How to Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Switch Roles
- Use buttons in header to change roles
- See page automatically update to show role-specific navigation
- Navigate to different sections

### 4. Explore Pages
- Each page has clear section labels
- Placeholder content shows page structure
- Tables, forms, and components are laid out for easy implementation

## ⚙️ Mock Role System

Located in `lib/roles.js`:

```javascript
import { setRole, getRole, isUser, isReader, isAdmin } from '@/lib/roles';

// Get current role
const role = getRole(); // Returns: 'user' | 'reader' | 'admin'

// Change role
setRole('reader');

// Check role
if (isReader()) { /* ... */ }
```

## 🎯 Development Next Steps

1. **Authentication**: Replace mock role system with real auth
2. **API Integration**: Add API calls to backend
3. **State Management**: Implement React Context or Redux
4. **Real Data**: Connect to database
5. **Styling**: Add CSS/Tailwind for polished UI
6. **Features**: Implement real chat, payments, etc.

## 📝 Notes

- All data is hardcoded/mocked
- No API calls are made
- Roles reset on page reload (development feature)
- No real authentication implemented
- Minimal CSS - focus on structure

---

This is a **structural prototype** showing the complete application layout and routing.
