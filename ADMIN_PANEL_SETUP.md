# Admin Panel Setup Guide

## Overview
The admin panel is a separate, password-protected web application that allows you to manage:
- Bot types (add, edit, delete)
- Contact channels (WhatsApp, Telegram, Email, Discord)
- App settings

All changes are stored in `public/config.json` and automatically available to all users.

## Files Created

### Core Admin App
- `src/pages/admin-app/AdminApp.tsx` - Main admin application component
- `src/pages/admin-login/admin-login.tsx` - Login page with password authentication
- `src/pages/admin-panel/admin-panel.tsx` - Admin dashboard interface

### Styling
- `src/pages/admin-login/admin-login.scss` - Login page styles
- `src/pages/admin-panel/admin-panel.scss` - Admin panel styles

### Authentication & Context
- `src/contexts/AdminAuthContext.tsx` - Authentication state management
- `src/contexts/ConfigContext.tsx` - Configuration state accessible app-wide

### Data Storage
- `public/config.json` - Configuration file (persisted globally)

## Integration Steps

### Step 1: Add Admin Route
Update your `src/app/App.tsx` to include the admin app:

```tsx
import AdminApp from '@/pages/admin-app/AdminApp';

// In your routes:
const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminApp />
  },
  // ... other routes
]);
```

### Step 2: Wrap App with ConfigProvider
In your main App component or root:

```tsx
import { ConfigProvider } from '@/contexts/ConfigContext';

function App() {
  return (
    <ConfigProvider>
      {/* Your existing app */}
    </ConfigProvider>
  );
}
```

### Step 3: Access Admin Panel
Visit: `http://localhost:3000/admin`

### Step 4: Login with Key
Default admin key: `PulseTrader@2024`

## Changing the Admin Key

Edit `src/contexts/AdminAuthContext.tsx`:

```tsx
const ADMIN_PASSWORD = 'YOUR_NEW_KEY_HERE';
```

## Using Config in Your App

Access configuration anywhere using the `useConfig` hook:

```tsx
import { useConfig } from '@/contexts/ConfigContext';

function MyComponent() {
  const { config } = useConfig();

  return (
    <div>
      {/* Display bots from config */}
      {config.bots.map(bot => (
        <div key={bot.id}>{bot.name}</div>
      ))}

      {/* Display contact channels */}
      <p>Support: {config.channels.whatsapp}</p>
    </div>
  );
}
```

## Features

✅ **Secure Access** - Password-protected login  
✅ **Bot Management** - Add, edit, delete bot types  
✅ **Channel Management** - Update contact information  
✅ **Global Config** - Changes available to all users  
✅ **Persistent Storage** - Config saved in public/config.json  
✅ **Responsive Design** - Works on mobile, tablet, desktop  
✅ **Professional UI** - Matches PulseTrader branding  

## Security Notes

⚠️ This implementation stores the admin key in the frontend code. For production:
1. Implement a backend API with proper authentication
2. Use environment variables for the password
3. Add role-based access control
4. Implement audit logging
5. Use HTTPS only

## Configuration Structure

The `config.json` file structure:

```json
{
  "bots": [
    {
      "id": "bot-1",
      "name": "Bot Name",
      "description": "Bot description",
      "icon": "IconName"
    }
  ],
  "channels": {
    "whatsapp": "+1234567890",
    "telegram": "@handle",
    "email": "support@example.com",
    "discord": "https://discord.gg/..."
  },
  "appName": "PulseTrader",
  "supportEmail": "support@example.com"
}
```

## Logout
Click the "Logout" button in the top right of the admin panel to return to the login screen.

## Auto-Refresh
The app config is refreshed every 30 seconds from all users, ensuring changes propagate automatically.
