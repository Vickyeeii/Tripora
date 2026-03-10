# Tourist Dashboard - Design Documentation

## Design Philosophy

**Editorial Minimalism**: Inspired by Awwwards and Framer, prioritizing whitespace, confident typography, and subtle interactions.

## Color System

### Primary (Muted Indigo)
- Used for secondary emphasis and hover states
- Avoids default Tailwind blue
- Range: 50-900 for flexibility

### Accent (Soft Emerald)
- Used for positive states (confirmed bookings)
- Gentle, not loud
- Range: 50-900

### Neutral (Stone-based)
- Off-white backgrounds (neutral-50)
- Charcoal text (neutral-900)
- Subtle grays for secondary text

## Typography Hierarchy

**Inter Font Only**
- Headings: 5xl-6xl, semibold, tight tracking
- Body: lg, medium weight
- Labels: sm, uppercase, wide tracking
- Stat values: 4xl-5xl, semibold

## Layout Principles

1. **Generous Spacing**: py-12 to py-16, mb-12 to mb-20
2. **No Hard Borders**: Soft shadows on hover only
3. **Airy Cards**: Large padding (p-8 to p-10)
4. **Full-Width**: Max-w-7xl container with responsive padding

## Component Architecture

### StatCard
- Hover scale effect (1.02)
- Variant system for background colors
- Large stat values for impact

### BookingRow
- Clean dividers (border-b)
- Status badges with semantic colors
- Date formatting for readability

### EmptyState
- Icon + message pattern
- Friendly, not harsh
- Centered with generous padding

### LoadingState
- Spinning border animation
- Neutral colors
- Centered with message

## Responsive Strategy

- Mobile-first approach
- Stats stack on small screens (grid-cols-1)
- 3-column on md+ (md:grid-cols-3)
- Padding adjusts: px-6 → lg:px-8

## Motion Readiness

- Hover transitions on cards
- Scale transforms prepared
- No complex animations (Framer Motion ready)
- Transition-all for smooth changes

## API Integration

- Real backend calls (no mocks)
- Loading states handled
- Error states graceful
- Empty states friendly

## Production Considerations

- Token stored in localStorage
- Axios interceptor for auth
- Promise.all for parallel requests
- Error handling with fallbacks
