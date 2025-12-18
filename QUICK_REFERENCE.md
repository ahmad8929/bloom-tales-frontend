# Quick Reference Guide - Bloom Frontend

## 🚀 Key Improvements Made

### 1. API Error Handling
```typescript
// All API calls now have:
- 30-second timeout
- Automatic retry (2 attempts with exponential backoff)
- User-friendly error messages
- Network failure detection
```

### 2. Toast Notifications
```typescript
// Fixed settings:
TOAST_LIMIT = 3 (was 1)
TOAST_REMOVE_DELAY = 5000ms (was 1,000,000ms)
```

### 3. Error Boundary
```typescript
// Wrap components with ErrorBoundary:
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 4. Offline Detection
```typescript
// Automatic offline indicator added to layout
// Shows banner when user loses internet connection
```

---

## 📝 Code Patterns to Follow

### API Calls
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.get('/endpoint');
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    setData(response.data);
  } catch (error: any) {
    console.error('Error:', error);
    setError(error.message || 'Failed to load data');
    
    toast({
      title: 'Error',
      description: error.message || 'An error occurred',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

### Loading States
```typescript
// Always show loading indicators
{loading ? (
  <Loader2 className="w-4 h-4 animate-spin" />
) : (
  <YourContent />
)}
```

### Empty States
```typescript
// Always handle empty data
{items.length === 0 ? (
  <div className="text-center py-8">
    <p>No items found</p>
    <Button onClick={refresh}>Refresh</Button>
  </div>
) : (
  <ItemsList items={items} />
)}
```

### Error States
```typescript
// Always provide retry options
{error ? (
  <div className="text-center py-8">
    <p className="text-red-600">{error}</p>
    <Button onClick={retry}>Try Again</Button>
  </div>
) : (
  <YourContent />
)}
```

---

## 🎯 Testing Scenarios

### Network Issues
```bash
# Test offline functionality:
1. Open DevTools → Network
2. Set throttling to "Offline"
3. Verify offline indicator appears
4. Verify error messages are user-friendly
```

### API Timeouts
```bash
# Test timeout handling:
1. Open DevTools → Network
2. Set throttling to "Slow 3G"
3. Trigger API call
4. Should timeout after 30 seconds with message
```

### Error Boundaries
```bash
# Test error recovery:
1. Trigger a component error (invalid data)
2. Error boundary should catch it
3. User should see friendly error message
4. "Try Again" should work
```

---

## 🔧 Common Issues & Solutions

### Issue: API calls hanging
**Solution**: Already fixed - 30s timeout added

### Issue: Toasts not disappearing
**Solution**: Already fixed - 5s duration set

### Issue: Multiple nested timeouts
**Solution**: Already fixed - simplified auth flow

### Issue: Loading state stuck
**Solution**: Already fixed - added finally blocks

### Issue: Blank screen on error
**Solution**: Already fixed - error boundaries added

---

## 📱 Responsive Design

### Breakpoints Used
```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Mobile-First Approach
```typescript
// Always test mobile first
className="text-sm md:text-base lg:text-lg"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 🎨 Toast Usage

### Success Toast
```typescript
toast({
  title: 'Success',
  description: 'Operation completed successfully',
});
```

### Error Toast
```typescript
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});
```

### Warning Toast
```typescript
toast({
  title: 'Warning',
  description: 'Please review before continuing',
  variant: 'default', // or use custom styling
});
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 🚦 Pre-Deployment Checklist

- [ ] Test all major user flows
- [ ] Test on mobile devices
- [ ] Test offline functionality
- [ ] Verify error messages are user-friendly
- [ ] Check loading states work
- [ ] Test cart and checkout flow
- [ ] Verify admin panel works
- [ ] Test authentication flow
- [ ] Check API timeout handling
- [ ] Verify toast notifications

---

## 📊 Monitoring (To Setup)

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics / Mixpanel
- **Performance**: Vercel Analytics / Lighthouse
- **Uptime**: UptimeRobot / Pingdom

---

## 🔐 Security Notes

- Tokens stored in httpOnly cookies
- CORS properly configured
- No sensitive data in console (production)
- Input validation on all forms
- XSS protection via React

---

## 💡 Best Practices

1. **Always handle errors** - Never leave try/catch empty
2. **Always show loading** - Users need feedback
3. **Always have fallbacks** - Handle empty/error states
4. **Use TypeScript** - Catch errors at compile time
5. **Test on mobile** - Mobile-first approach
6. **Keep it simple** - Avoid complex nested logic
7. **User-friendly errors** - No technical jargon
8. **Consistent patterns** - Follow established patterns
9. **Clean up effects** - Remove event listeners
10. **Defensive coding** - Always validate data

---

## 📞 Support

For technical questions or issues:
1. Check `IMPROVEMENTS_SUMMARY.md`
2. Review error logs in browser console
3. Check Network tab in DevTools
4. Verify environment variables

---

**Remember**: The goal is a smooth, resilient user experience with graceful error handling!

