# Toast System - Quick Usage Guide

## ✅ Problem Fixed

**Before**: Toasts appeared inside Leaflet map containers  
**After**: Toasts render via React Portal at document.body level with z-[9999]

## 🚀 Usage

### In Any Component

```jsx
import { useToast } from '../components/ui/ToastProvider';

function MyComponent() {
  const { showSuccess, showError, showWarning } = useToast();

  const handleAction = async () => {
    try {
      await someAPI.call();
      showSuccess('Operation completed successfully');
    } catch (err) {
      showError('Something went wrong');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

## 📋 API

```javascript
const { showSuccess, showError, showWarning } = useToast();

// Success toast (green)
showSuccess('Heritage site approved successfully');

// Error toast (red)
showError('Failed to load data');

// Warning toast (yellow)
showWarning('Please review this action');
```

## 🎨 Features

- ✅ Renders via React Portal to document.body
- ✅ z-index: 9999 (above all content including Leaflet)
- ✅ Fixed position: top-6 right-6
- ✅ Auto-dismiss after 4 seconds
- ✅ Manual close button
- ✅ Only one toast visible at a time
- ✅ Custom colors: #008000 (green), #8b0000 (red), #FFED29 (yellow)

## 🏗️ Architecture

```
App.jsx
└── ToastProvider (wraps entire app)
    ├── Your Components
    │   └── useToast() hook
    └── Toast (renders via portal to document.body)
```

## 🔧 Already Integrated

The following pages already use the new system:
- ✅ HeritageList.jsx
- ✅ HeritageDetail.jsx
- ✅ HeritageCreate.jsx

## 🎯 Why This Works

**Portal Rendering**:
```jsx
return createPortal(
  <div className="fixed top-6 right-6 z-[9999]">
    {/* Toast content */}
  </div>,
  document.body  // ← Renders here, not in component tree
);
```

This escapes the Leaflet stacking context completely.

## 🚫 Don't Do This Anymore

```jsx
// ❌ OLD WAY (local state)
const [toast, setToast] = useState(null);
{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

// ✅ NEW WAY (context hook)
const { showSuccess } = useToast();
showSuccess('Message');
```

## 🎉 Result

Toasts now appear correctly above ALL content, including:
- Leaflet maps
- Modals
- Fixed headers
- Any other z-indexed content

Production-quality global UI overlay system.
