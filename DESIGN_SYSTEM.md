# Vault RAG - Design System & UI/UX Guide

## 🎨 Overview

The new Vault RAG UI is inspired by Perplexity.ai with a modern, clean design that features both light and dark modes with a custom color palette.

## 🌈 Color Palette

### Light Mode

```
Background:      #ffffff
Surface:         #f0f0f0
Primary:         #6061c0 (Deep Blue)
Primary Light:   #50a0e0 (Sky Blue)
Primary Dark:    #504090 (Dark Blue)
Accent 1:        #81334b (Plum)
Accent 2:        #6ea861 (Sage Green)
Accent 3:        #ee9e6e (Coral)
Muted:           #a0a0a0 (Gray)
Text:            #000000
Text Secondary:  #666666
Borders:         #e0e0e0
```

### Dark Mode

```
Background:      #0f0f0f
Surface:         #1a1a2e
Primary:         #55BBAD (Teal)
Primary Light:   #DD5794 (Magenta)
Primary Dark:    #6C4572 (Purple)
Accent 1:        #DD5794 (Magenta)
Accent 2:        #55BBAD (Teal)
Accent 3:        #DBC1CA (Mauve)
Text:            #ffffff
Text Secondary:  #e0e0e0
Borders:         #333333
```

## 📱 Components

### Chat Interface

**Features:**

- Hero section with illustration when empty
- Suggested questions with icons
- Real-time message streaming
- Source attribution with relevance scores
- Performance metrics display
- Smooth transitions and animations

**Key Elements:**

- Input field with rounded corners (24px border-radius)
- Send button with icon
- Message bubbles with different styles for user/bot
- Expandable source cards
- Performance breakdown table

### Dashboard

**Features:**

- System statistics with trend indicators
- Health status indicator
- Feature checklist with icons
- Auto-refresh interval selector
- Real-time metric updates

**Key Elements:**

- Stat cards with icons and trends
- Status indicator (green/red)
- Feature grid (2 columns on desktop, 1 on mobile)
- System info section

## 🎭 Theme Implementation

### Using the Theme

```tsx
import { useTheme } from "@/theme/ThemeContext";

const MyComponent: React.FC = () => {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      <button onClick={toggleTheme}>
        {mode === "dark" ? "Light" : "Dark"}
      </button>
    </div>
  );
};
```

### Theme Switching

- Automatically saves preference to localStorage
- Respects system preference on first load
- Smooth transitions between modes
- CSS variables updated in real-time

## 📐 Design Principles

### 1. **Minimalist Design**

- Clean whitespace
- Clear hierarchy
- Focus on content
- Minimal decorative elements

### 2. **Perplexity Inspiration**

- Large input area
- Hero section for empty state
- Suggested actions
- Clean message bubbles
- Expandable sources

### 3. **Accessibility**

- High contrast ratios
- Clear visual hierarchy
- Focus states for keyboard navigation
- Semantic HTML
- ARIA labels where needed

### 4. **Responsive Design**

- Mobile-first approach
- Fluid typography
- Flexible layouts
- Touch-friendly interactions

## 🎨 Styling Guidelines

### Colors

- Use `colors.primary` for primary actions
- Use `colors.primaryLight` for hover states
- Use `colors.accent1/2/3` for important information
- Use `colors.textMuted` for secondary text
- Use `colors.border` for dividers

### Spacing

- Use Tailwind's spacing scale (4px units)
- Use gap for flex layouts
- Use mb/mt for vertical spacing
- Consistent padding: 4px, 6px, 8px, 12px, 16px, 24px, 32px, 48px

### Typography

- Headings: Bold, large size, clear hierarchy
- Body: Regular weight, medium size
- Small text: Reduced opacity for secondary info
- Monospace: For code/timing information

### Borders & Shadows

- Border radius: 8px for cards, 24px for input
- Borders: 1px solid, subtle color
- Shadows: Subtle, used for depth
- Hover states: shadow increase + opacity change

## 🎬 Animations & Transitions

### Smooth Transitions

- Color changes: 300ms
- Hover effects: 200ms
- Loading spinner: Continuous
- Message appearance: Smooth scroll

### Loading States

- Show spinner on button
- Disable interactions during loading
- Display "Searching and thinking..." message

### Error States

- Alert box with icon
- Clear error message
- Retry button

## 📐 Spacing System

```
xs: 4px    (used for tiny gaps)
sm: 8px    (button padding)
md: 12px   (card padding)
lg: 16px   (section padding)
xl: 24px   (component gap)
2xl: 32px  (section gap)
3xl: 48px  (major gap)
```

## 🎨 Component Examples

### Input Field

```tsx
<input
  style={{
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
  }}
  className="px-4 py-3 rounded-2xl outline-none placeholder-gray-400"
  placeholder="Ask anything..."
/>
```

### Button

```tsx
<button
  style={{
    backgroundColor: colors.primary,
    color: "#ffffff",
  }}
  className="px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
>
  Send
</button>
```

### Card

```tsx
<Card
  style={{
    backgroundColor: colors.surface,
    borderColor: colors.border,
  }}
  className="border p-6 rounded-lg hover:shadow-lg transition-shadow"
>
  Content
</Card>
```

### Message Bubble

```tsx
<div
  style={{
    backgroundColor: colors.primary,
    color: "#ffffff",
  }}
  className="max-w-2xl rounded-2xl px-6 py-4"
>
  {message}
</div>
```

## 🌙 Dark Mode Considerations

### Contrast

- Ensure text is readable on dark backgrounds
- Use lighter colors for text in dark mode
- Use borders for definition

### Reduced Motion

- Respect `prefers-reduced-motion`
- Disable animations if requested
- Keep interactions responsive

### Color Accessibility

- Test with color blindness simulators
- Use distinct colors for status
- Don't rely on color alone

## 📱 Responsive Breakpoints

```
Mobile:   320px - 767px (1 column)
Tablet:   768px - 1023px (2 columns)
Desktop:  1024px+ (3+ columns)
```

## 🎭 State Management

### Theme State

```tsx
interface ThemeContextType {
  mode: "light" | "dark";
  colors: Theme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}
```

## 🚀 Implementation Checklist

- [x] Color palette defined
- [x] Theme context created
- [x] Chat interface redesigned
- [x] Dashboard redesigned
- [x] Dark mode implemented
- [x] Light mode implemented
- [x] Responsive design
- [x] Animations added
- [x] Accessibility reviewed
- [ ] Illustrations added (external library links below)

## 🎨 Illustration Resources

For free illustrations that match your design:

### Vector Illustration Sites

1. **Undraw.co** - Consistency across illustrations
   - Search: "search", "chat", "dashboard", "document"
   - License: Free for personal & commercial use

2. **Blush.design** - Customizable illustrations
   - Can match your color palette
   - Multiple styles available

3. **Humaaans.com** - Character-based illustrations
   - Great for conversational UI
   - Customizable

4. **Icons.getbootstrap.com** - Simple icons
   - Lightweight
   - Easy to integrate

### How to Add Illustrations

```tsx
// Option 1: Direct SVG import
import SearchIllustration from "@/assets/illustrations/search.svg";

<img src={SearchIllustration} alt="Search" className="w-48 h-48" />

// Option 2: Icon component
import { Search } from "lucide-react";

<Search style={{ color: colors.primary }} className="w-48 h-48" />

// Option 3: External image
<img
  src="https://undraw.co/api/illustration/search?color=#6061c0"
  alt="Search"
  className="w-48 h-48"
/>
```

### Recommended Illustrations to Add

1. **Empty State (Chat)**
   - Search/Chat illustration
   - "Welcome to Vault RAG" message

2. **Loading State**
   - Animated loader
   - "Searching and thinking..."

3. **Error State**
   - Error illustration
   - "Something went wrong"

4. **Dashboard Hero**
   - Analytics/Dashboard illustration
   - System status visual

## 🔮 Future Enhancements

- [ ] Add custom illustrations from Undraw/Blush
- [ ] Implement animation library (Framer Motion)
- [ ] Add gradient backgrounds
- [ ] Add micro-interactions
- [ ] Implement light/dark mode transition animations
- [ ] Add custom cursors
- [ ] Implement scroll animations
- [ ] Add data visualization charts

## 📚 Style Reference

### Hierarchy

```
H1: 32px, bold     (Page title)
H2: 24px, bold     (Section title)
H3: 20px, bold     (Subsection)
H4: 16px, semibold (Component title)
Body: 14px, regular (Content)
Small: 12px, regular (Meta info)
Tiny: 11px, regular (Timestamp)
```

### Font Stack

```
Primary: 'Roboto', system fonts
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI'
Monospace: 'Menlo', 'Monaco', monospace
```

## 🎯 Performance

- Lazy load illustrations
- Optimize image sizes
- Use CSS instead of images where possible
- Minimize repaints/reflows
- Cache theme preference

---

**Design System Version:** 1.0  
**Last Updated:** 2026-01-24  
**Status:** Complete & Ready to Use
