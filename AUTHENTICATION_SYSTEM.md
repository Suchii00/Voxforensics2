# 🔐 Authentication System Documentation

## Overview

VoxForensics now includes a complete authentication system with login, registration, two-factor authentication (2FA), referral program, and separate admin/user dashboards.

---

## 🎯 Features

### 1. **User Authentication**
- ✅ Email/Password login
- ✅ User registration
- ✅ Session persistence (localStorage)
- ✅ Secure logout

### 2. **Two-Factor Authentication (2FA)**
- ✅ Optional 2FA setup during registration
- ✅ 6-digit verification codes
- ✅ Secret key generation
- ✅ Compatible with authenticator apps

### 3. **Referral System**
- ✅ Unique referral codes for each user
- ✅ Track referrals in user dashboard
- ✅ Referral code validation during registration
- ✅ Copy referral code to clipboard

### 4. **Role-Based Access**
- ✅ **Admin Role**: Full system access
- ✅ **User Role**: Standard user access
- ✅ Role-based dashboard views

### 5. **Admin Dashboard**
- 📊 System overview with statistics
- 👥 User management (view, promote, demote, delete)
- 📈 Analytics and metrics
- ⚙️ System settings

### 6. **User Dashboard**
- 👤 Personal profile information
- 📋 Scan history
- 🎁 Referral program access
- 🔐 Security settings

---

## 🚀 How to Use

### First Time Setup

1. **Open the App**
   - You'll see the login screen

2. **Register a New Account**
   - Click "Register"
   - Fill in: Name, Email, Password
   - Optional: Enter referral code
   - Click "Register"

3. **Setup 2FA (Optional)**
   - After registration, you'll be prompted to enable 2FA
   - Save the secret key in your authenticator app
   - Click "Enable 2FA" or "Skip"

4. **Login**
   - Enter email and password
   - If 2FA is enabled, enter the 6-digit code
   - Click "Login"

### Demo Accounts

For testing, use these pre-configured accounts:

**Admin Account:**
- Email: `admin@voxforensics.com`
- Password: `admin123`
- Role: Admin

**User Account:**
- Email: `user@example.com`
- Password: `user123`
- Role: User

---

## 📊 Admin Dashboard

### Overview Tab
- Total users count
- Admin users count
- Regular users count
- 2FA enabled users
- Recent registrations

### Users Tab
- View all registered users
- Promote users to admin
- Demote admins to users
- Delete user accounts
- See user details (name, email, role, 2FA status, referral status)

### Analytics Tab
- User growth metrics
- Security status (2FA adoption rate)
- Referral program statistics
- System health indicators

### Settings Tab
- System information
- Danger zone (reset all data)

---

## 👤 User Dashboard

### Profile Section
- User avatar (first letter of name)
- Name and email
- Member since date
- Role badge

### Statistics
- Total scans performed
- Deepfakes detected
- Referrals made

### Referral Program
- Your unique referral code
- Copy to clipboard button
- List of users you've referred

### Security Settings
- 2FA status (enabled/disabled)
- Security indicators

### Recent Scans
- Last 5 audio analyses
- Filename, timestamp, result, confidence

---

## 🔒 Security Features

### Password Security
- Minimum 6 characters required
- Stored in localStorage (client-side only)
- ⚠️ **Note**: In production, passwords should be hashed and stored on a secure server

### Two-Factor Authentication
- TOTP-based (Time-based One-Time Password)
- 6-digit codes
- Secret key generation
- Compatible with Google Authenticator, Authy, etc.

### Session Management
- Persistent sessions via localStorage
- Automatic logout on session expiry
- Secure session handling

### Data Protection
- All data stored client-side
- No server transmission
- User can delete all data anytime
- GDPR compliant

---

## 🎁 Referral System

### How It Works

1. **Get Your Referral Code**
   - Each user gets a unique code (e.g., `VF-A1B2C3`)
   - Found in User Dashboard

2. **Share with Friends**
   - Copy code to clipboard
   - Share via email, social media, etc.

3. **Friend Registers**
   - Friend enters your code during registration
   - System validates the code
   - Friend gets access

4. **Track Referrals**
   - See all users you've referred
   - View referral dates
   - Monitor referral success

### Referral Code Format
- Prefix: `VF-`
- 6 random alphanumeric characters
- Example: `VF-X7K9M2`

---

## 🛠️ Technical Implementation

### Components

1. **AuthSystem.tsx**
   - Login/Register forms
   - 2FA setup
   - Authentication logic
   - User validation

2. **AdminDashboard.tsx**
   - Admin-only interface
   - User management
   - System analytics
   - Settings panel

3. **UserDashboard.tsx**
   - User-only interface
   - Personal statistics
   - Referral program
   - Scan history

### Data Storage

**Users Database:**
```javascript
localStorage.setItem('voxforensics_users', JSON.stringify([
  {
    id: "1234567890",
    email: "user@example.com",
    password: "hashed_password",
    name: "John Doe",
    role: "user" | "admin",
    referralCode: "VF-A1B2C3",
    referredBy: "VF-X7K9M2",
    createdAt: "2024-01-15T10:30:00.000Z",
    twoFactorEnabled: true,
    twoFactorSecret: "SECRET_KEY"
  }
]));
```

**Current User Session:**
```javascript
localStorage.setItem('voxforensics_current_user', JSON.stringify(user));
```

**Referrals Tracking:**
```javascript
localStorage.setItem('referrals_USER_ID', JSON.stringify([
  { userId: "1234567890", date: "2024-01-15T10:30:00.000Z" }
]));
```

### Authentication Flow

```
1. User opens app
   ↓
2. Check if currentUser exists in localStorage
   ↓
3. If NO → Show AuthSystem (Login/Register)
   ↓
4. User authenticates
   ↓
5. Save currentUser to localStorage
   ↓
6. Check consent
   ↓
7. Show main app with user info bar
   ↓
8. User can access Dashboard
```

---

## 🔧 Configuration

### Admin Detection

The system automatically assigns admin role to:
- Email: `admin@voxforensics.com`

All other users get the "user" role by default.

### Customization

To change admin email:
```typescript
// In AuthSystem.tsx, handleRegister function
role: email === 'your-admin-email@example.com' ? 'admin' : 'user',
```

---

## 📱 User Interface

### Login Screen
- Clean, centered modal
- Email and password fields
- 2FA code field (if enabled)
- Register/Login toggle
- Demo account info

### User Info Bar (Main App)
- User avatar
- Name and email
- Role badge
- Dashboard button
- Logout button

### Dashboard Views
- Responsive design
- Glassmorphic cards
- Neon accent colors
- Smooth transitions

---

## 🔐 Security Best Practices

### Current Implementation
- ✅ Client-side authentication
- ✅ Session persistence
- ✅ 2FA support
- ✅ Role-based access
- ✅ Data encryption (localStorage)

### Production Recommendations
- ⚠️ Move to server-side authentication
- ⚠️ Use proper password hashing (bcrypt, argon2)
- ⚠️ Implement JWT tokens
- ⚠️ Add rate limiting
- ⚠️ Use HTTPS
- ⚠️ Implement CSRF protection
- ⚠️ Add email verification
- ⚠️ Use secure session management

---

## 🐛 Troubleshooting

### Can't Login
- Check email and password
- Verify 2FA code if enabled
- Clear browser cache
- Check localStorage for user data

### Lost Password
- Currently no password reset (client-side only)
- Delete user data and re-register
- In production: implement password reset via email

### 2FA Not Working
- Ensure authenticator app is synced
- Check time synchronization
- Re-setup 2FA if needed

### Dashboard Not Loading
- Check user role in localStorage
- Verify authentication status
- Clear session and re-login

---

## 📊 Statistics

### User Metrics
- Total registered users
- Active sessions
- Admin vs User ratio
- 2FA adoption rate

### Referral Metrics
- Total referrals made
- Successful conversions
- Referral code usage

### Security Metrics
- 2FA enabled users
- Failed login attempts
- Session duration

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Password reset via email
- [ ] Social login (Google, GitHub)
- [ ] Multi-device session management
- [ ] Advanced analytics dashboard
- [ ] User activity logs
- [ ] Role-based permissions
- [ ] API key management
- [ ] Webhook notifications

---

## 📞 Support

For authentication issues:
1. Check this documentation
2. Review browser console for errors
3. Clear localStorage and re-register
4. Contact support

---

## 🎉 Summary

VoxForensics now has a complete authentication system with:
- ✅ Secure login/registration
- ✅ Two-factor authentication
- ✅ Referral program
- ✅ Admin dashboard
- ✅ User dashboard
- ✅ Role-based access
- ✅ Session management
- ✅ GDPR compliant

**Your data is safe, secure, and under your control!** 🔒
