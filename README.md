# 🌟 Zenvy - Tarot Marketplace Platform

A structural prototype/wireframe of a marketplace platform connecting users with tarot readers.

## 📋 Project Overview

This is a **skeleton application** that demonstrates the complete structure and routing of the Zenvy platform. It includes all necessary pages, navigation flows, and role-based access patterns - but with **NO real data, API calls, or business logic**.

## 🏗️ Project Structure

```
zenvy/
├── app/
│   ├── layout.js                 # Root layout with Header & Footer
│   ├── globals.css               # Minimal global styles
│   ├── page.js                   # Home page (list readers)
│   ├── login/page.js             # User login
│   ├── register/page.js          # User registration
│   ├── profile/page.js           # User profile & booking history
│   ├── booking/page.js           # Booking & checkout flow
│   ├── chat/page.js              # Chat with reader
│   ├── reader/
│   │   └── [id]/page.js          # Reader profile page
│   ├── (reader)/                 # Reader role group
│   │   ├── layout.js             # Reader layout with sidebar
│   │   ├── reader-dashboard/page.js
│   │   ├── reader-profile/page.js
│   │   ├── reader-sessions/page.js
│   │   ├── reader-earnings/page.js
│   │   └── reader-chat/page.js
│   └── (admin)/                  # Admin role group
│       ├── layout.js             # Admin layout with sidebar
│       ├── admin-dashboard/page.js
│       ├── admin-users/page.js
│       ├── admin-readers/page.js
│       ├── admin-transactions/page.js
│       └── admin-reports/page.js
├── components/
│   ├── Header.js                 # Navigation header
│   └── Footer.js                 # Footer
├── lib/
│   └── roles.js                  # Mock role system
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md

```

## 👥 Roles

### 1. **USER** (Customer/Client)
- Browse tarot readers
- View reader profiles
- Book sessions
- Chat with readers
- Manage profile & booking history

### 2. **READER** (Service Provider)
- Dashboard with stats
- Manage profile & rates
- View upcoming & completed sessions
- Track earnings & payouts
- Chat with users

### 3. **ADMIN** (Platform Manager)
- Dashboard with platform analytics
- Manage users & readers
- Transaction management
- Reports & complaints handling

## 🚀 Getting Started

### Installation

```bash
cd zenvy
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will start with **USER role** by default. Use the role switcher buttons in the header to change roles and explore different sections.

## 🔄 Role Switching

- Switch roles using the buttons in the header:
  - **User** - Browse readers, book sessions
  - **Reader** - Manage profile, view earnings
  - **Admin** - Manage platform

The mock role system is hardcoded in `lib/roles.js` and resets on page navigation.

## 📄 Pages & Routes

### Public Pages
- `/` - Home (reader list)
- `/login` - Login page
- `/register` - Registration page
- `/reader/:id` - Reader profile page
- `/booking` - Booking & checkout
- `/chat` - Chat interface
- `/profile` - User profile

### Reader Pages (Role-Protected)
- `/reader-dashboard` - Dashboard & stats
- `/reader-profile` - Edit profile & rates
- `/reader-sessions` - Session management
- `/reader-earnings` - Earnings & payouts
- `/reader-chat` - Messages with users

### Admin Pages (Role-Protected)
- `/admin-dashboard` - Platform overview
- `/admin-users` - User management
- `/admin-readers` - Reader management
- `/admin-transactions` - Transaction logs
- `/admin-reports` - Reports & complaints

## 🧩 Component Breakdown

### Header.js
- Navigation based on current role
- Role switcher buttons
- Links to role-specific pages

### Footer.js
- Basic footer with disclaimer

### Role System (lib/roles.js)
- `getRole()` - Get current role
- `setRole(role)` - Set current role
- `isUser()`, `isReader()`, `isAdmin()` - Helper functions

## 🎨 Styling

- **No CSS frameworks** (Tailwind, Bootstrap, etc.)
- Minimal inline styles for demonstration
- Plain HTML structure with basic CSS blocks
- Focus on **structure over appearance**

## ✨ Features Demonstrated

✅ Page structure & routing
✅ Role-based navigation
✅ Grouped routes (reader, admin)
✅ Dynamic URL parameters (`/reader/:id`)
✅ Layout system
✅ Placeholder components
✅ Mock data structures

## ❌ Not Implemented

- ❌ Real authentication
- ❌ API calls or backend integration
- ❌ Database queries
- ❌ State management (Redux, Zustand, etc.)
- ❌ Real payment processing
- ❌ Real-time chat functionality
- ❌ CSS styling (Tailwind, custom CSS, etc.)
- ❌ Complex UI libraries

## 📝 Next Steps

To turn this into a real application, you would need to:

1. **Add Authentication** - Implement real login/signup with JWT or similar
2. **Connect Backend API** - Replace placeholders with API calls
3. **Add State Management** - Use Context API, Redux, or Zustand
4. **Implement Real Features** - Payment processing, real-time chat, etc.
5. **Add Styling** - Implement UI design with CSS/Tailwind
6. **Add Testing** - Unit & integration tests
7. **Deploy** - Deploy to Vercel, AWS, or other platforms

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **JavaScript** - No TypeScript for simplicity

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Documentation](https://react.dev)

## 📄 License

This is a structural prototype for demonstration purposes.

---

**Note:** This is a wireframe/skeleton application. All data is hardcoded and no real functionality is implemented.
