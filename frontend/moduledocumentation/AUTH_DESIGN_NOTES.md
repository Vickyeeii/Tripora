# Authentication Module - Design Documentation

## Design Philosophy

**Editorial Tourism Experience**: Calm, welcoming, and premium. Inspired by modern SaaS onboarding with a tourism-friendly twist.

## Visual Language

### Typography
- **Font**: Inter only (imported via Google Fonts)
- **Headings**: 4xl, semibold, tight tracking
- **Body**: lg for subtitles, base for labels
- **Hierarchy**: Clear distinction between heading, subtitle, and form elements

### Color System
- **Primary**: Deep slate (700-800) - trustworthy, not loud
- **Accent**: Soft emerald (used in dashboard)
- **Neutral**: Stone-based grays (50 for bg, 900 for text)
- **Error**: Soft red (50 bg, 700 text) - calm, not aggressive

### Spacing
- **Card padding**: p-10 to p-12 (generous)
- **Input spacing**: mb-6 (breathing room)
- **Section spacing**: mb-10 (clear separation)
- **Button padding**: py-4 (substantial, clickable)

## Component Architecture

### AuthLayout
- Centers content vertically and horizontally
- Off-white background (neutral-50)
- Max-width constraint (max-w-md)
- Responsive padding

### AuthCard
- White background with rounded-3xl
- No borders (clean, minimal)
- Large padding for editorial feel
- Contains all form content

### TextInput
- Clean label above input
- Soft border (neutral-200)
- Focus ring (primary-500)
- Error state with red accent
- Rounded-xl for modern feel
- Generous padding (py-3)

### PrimaryButton
- Full width for mobile-first
- Deep primary color (700)
- Hover state (800)
- Loading state with disabled styling
- Rounded-xl consistency
- py-4 for substantial feel

### InlineError
- Soft red background (red-50)
- Subtle border (red-100)
- Calm text color (red-700)
- Rounded-xl consistency
- Only shows when error exists

## User Experience

### Login Flow
1. Large welcoming heading: "Welcome back"
2. Tourism-friendly subtitle
3. Email + password (minimal friction)
4. Primary CTA: "Continue" (not "Login")
5. Secondary link to register
6. Inline error handling (no alerts)
7. Loading state during submission

### Register Flow
1. Inviting heading: "Start exploring"
2. Heritage-focused subtitle
3. Essential fields only (name, email, phone, password)
4. Auto-login after registration
5. Primary CTA: "Create account"
6. Secondary link to login
7. Same error/loading patterns

## Technical Implementation

### Authentication
- Token stored in localStorage
- Axios interceptor adds Bearer token
- 401 response clears token and redirects
- Auto-login after registration

### Routing
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Protected route
- `/` - Redirects to login
- Authentication guard on dashboard

### API Integration
- Real backend calls (no mocks)
- POST /auth/login
- POST /auth/tourist/signup
- Error handling with user-friendly messages
- Loading states prevent double submission

## Responsive Design
- Mobile-first approach
- Single column layout
- Generous touch targets
- Readable text sizes
- Adaptive padding

## Motion Readiness
- Transition-all on interactive elements
- Hover states on buttons and links
- Focus rings with transitions
- Compatible with Framer Motion
- No brittle positioning

## Production Quality
- No default Tailwind blue
- No Bootstrap aesthetics
- No admin-panel feel
- Calm error messages
- Premium, intentional design
- Tourism-friendly language
