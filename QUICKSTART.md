# 🚀 Zenvy Quick Start Guide

## Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 🎮 Testing the App

### Default Role: USER

When you first load the app, you're logged in as a **USER** (customer).

### Switch Roles

Use the role switcher buttons in the top-right corner of the header:
- **User** - Browse readers, book sessions
- **Reader** - Manage profile, view earnings
- **Admin** - Manage platform

### Explore Pages

**As a USER:**
1. Click "Home" to see featured readers
2. Click "View Profile" to see reader details
3. Click "Book Now" to go to booking page
4. Click "Messages" to see chat interface
5. Click "My Profile" to view your bookings

**As a READER:**
1. Go to "Dashboard" to see stats and upcoming sessions
2. Go to "Sessions" to manage bookings
3. Go to "Earnings" to view payouts
4. Go to "Edit Profile" to manage rates

**As an ADMIN:**
1. Go to "Dashboard" to see platform overview
2. Go to "Users" to manage user accounts
3. Go to "Readers" to manage readers
4. Go to "Reports" to handle complaints

## 📁 Project Structure

```
zenvy/
├── app/                    # Pages & routing
│   ├── (admin)/           # Admin pages
│   ├── (reader)/          # Reader pages
│   └── ...                # Public pages
├── components/            # Header, Footer
├── lib/                   # Role system
├── package.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎨 Customization

### Add a New Page

Create a new file in the `app/` directory:

```javascript
// app/new-page/page.js
export default function NewPage() {
  return (
    <section>
      <h1>New Page</h1>
      <p>Your content here</p>
    </section>
  );
}
```

Access it at: `http://localhost:3000/new-page`

### Add Navigation Link

Edit `components/Header.js` to add links for each role.

### Change Mock Role

Edit `lib/roles.js` to change the default role:

```javascript
let currentRole = 'user'; // Change to 'reader' or 'admin'
```

## 📋 What's Included

✅ 17 complete pages
✅ 3 role-based layouts
✅ Header with navigation
✅ Role switcher
✅ Mock role system
✅ Placeholder components
✅ Responsive tables
✅ Form layouts

## 🚫 What's NOT Included

❌ Real authentication
❌ API calls
❌ Database
❌ Real payment processing
❌ Real-time chat
❌ CSS styling (Tailwind, etc.)
❌ State management libraries

## 📚 File Locations

| File | Purpose |
|------|---------|
| `components/Header.js` | Main navigation |
| `lib/roles.js` | Role system |
| `app/layout.js` | Root layout |
| `app/page.js` | Home page |
| `app/(reader)/layout.js` | Reader sidebar |
| `app/(admin)/layout.js` | Admin sidebar |

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
npm run dev -- -p 3001
```

### Changes not showing?
1. Refresh the browser
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart the dev server

### Styling looks off?
This is intentional - only minimal CSS is applied. Styling will be added in next phase.

## 🎯 Next Steps

1. **Review the code** - Read through pages to understand structure
2. **Map the flows** - Understand how pages connect
3. **Add API calls** - Replace placeholder data with real API
4. **Implement auth** - Add real authentication
5. **Add styling** - Apply CSS/Tailwind
6. **Test thoroughly** - Test each role and page

## 📞 Support

For questions or issues:
1. Check `README.md` for full documentation
2. Check `STRUCTURE.md` for architecture details
3. Review component code - it's well-commented

## 🎓 Learning Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [File-based Routing](https://nextjs.org/docs/app/building-your-application/routing)

---

**You're all set! Start exploring the Zenvy platform structure.**

Happy coding! 🚀
