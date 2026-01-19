# Admin Panel Quick Access

## Accessing the Admin Panel

1. **URL**: `http://localhost:3000/admin`

2. **Authentication**:
   - Password: `PulseTrader@2024` (change this in `src/contexts/AdminAuthContext.tsx`)

3. **Features**:
   - Manage bot types (add, edit, delete)
   - Update contact channels (WhatsApp, Telegram, Email, Discord)
   - Configure app settings
   - All changes are saved to `public/config.json`
   - Changes are visible to all users in real-time

## Security

✅ **Password Protected** - Only authenticated users can access  
✅ **Separate App** - Admin panel is isolated at `/admin` route  
✅ **Auto-Logout** - Session stored in localStorage  
✅ **No Access in Main App** - Regular users cannot see or access admin features  

## Integration Points

### Admin Context (AdminAuthContext.tsx)
```tsx
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const { isAuthenticated, login, logout } = useAdminAuth();
```

### Config Context (ConfigContext.tsx)
```tsx
import { useConfig } from '@/contexts/ConfigContext';

const { config, loading } = useConfig();
// Access: config.bots, config.channels, config.appName
```

## Changing Admin Key

Edit `src/contexts/AdminAuthContext.tsx` line 14:

```tsx
const ADMIN_PASSWORD = 'your-new-secure-key';
```

## Features After Authentication

Once logged in with the admin key, you can:

✅ Add new bot types  
✅ Edit existing bots  
✅ Delete bots  
✅ Update WhatsApp, Telegram, Email, Discord  
✅ Change app name and support email  
✅ Save all changes globally  
✅ Logout when done  

All changes are immediately saved and available to all app users.
