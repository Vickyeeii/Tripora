# Toast System - Portal Architecture

## Problem Solved

**Issue**: Toast notifications were rendering inside Leaflet map containers, causing visual overlap and poor UX.

**Root Cause**: 
- Toasts rendered in component tree
- Leaflet creates its own stacking context with high z-index
- Result: Toasts constrained by map container

## Solution

### React Portal Architecture

Toasts now use `ReactDOM.createPortal` to render directly to `document.body`, completely outside the component tree hierarchy.

**Key Changes**:
1. Toast renders via portal to `document.body`
2. Uses `z-[9999]` to ensure it's above all content
3. Fixed positioning: `top-6 right-6`
4. Global ToastProvider context for app-wide access

### Why This Works

```
Before (BROKEN):
<DashboardLayout>
  <HeritageDetail>
    <MapContainer z-index:1000>  ← Leaflet stacking context
      <Toast z-index:50>          ← Trapped inside map
    </MapContainer>
  </HeritageDetail>
</DashboardLayout>

After (FIXED):
<DashboardLayout>
  <HeritageDetail>
    <MapContainer z-index:1000>
    </MapContainer>
  </HeritageDetail>
</DashboardLayout>

<body>
  <Toast z-index:9999>  ← Portal renders here, above everything
</body>
```

## Usage

### 1. Wrap App with ToastProvider

```jsx
// App.jsx or main.jsx
import { ToastProvider } from './components/ui/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

### 2. Use Toast in Components

```jsx
import { useToast } from '../components/ui/ToastProvider';

function HeritageDetail() {
  const { showSuccess, showError } = useToast();

  const handleApprove = async () => {
    try {
      await heritageAPI.approve(id);
      showSuccess('Heritage site approved successfully');
    } catch (err) {
      showError('Failed to approve site');
    }
  };

  return <button onClick={handleApprove}>Approve</button>;
}
```

### 3. Available Methods

```javascript
const { showSuccess, showError, showWarning } = useToast();

showSuccess('Operation completed');
showError('Something went wrong');
showWarning('Please review this');
```

## Technical Details

### Portal Benefits
- **Escapes stacking context**: Not affected by parent z-index
- **Global positioning**: Always relative to viewport
- **Clean DOM**: Renders at body level, not nested
- **No CSS hacks**: Proper architectural solution

### Z-Index Strategy
- Toast: `z-[9999]` (highest in app)
- Leaflet: `z-index: 1000` (default)
- Modals: `z-50` (below toast)
- Regular content: `z-10` or lower

### Auto-Dismiss
- Toasts auto-dismiss after 4 seconds
- Manual close via X button
- Only one toast visible at a time (latest replaces previous)

## Migration from Old System

**Before**:
```jsx
const [toast, setToast] = useState(null);
{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
```

**After**:
```jsx
const { showSuccess, showError } = useToast();
showSuccess('Message');
```

## Production Quality

✅ Portal-based rendering  
✅ Escapes Leaflet stacking context  
✅ Global z-index management  
✅ Clean API with context  
✅ Auto-dismiss + manual close  
✅ No CSS hacks  
✅ Proper React architecture  

This is the correct way to handle global UI overlays in React.
