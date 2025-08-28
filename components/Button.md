# Button Component

A flexible, standardized button component that supports various configurations and themes.

## Features

- **Multiple Variants**: `primary`, `secondary`, `outline`, `ghost`
- **Flexible Content**: Support for text, icons, or both
- **Size Options**: `small`, `medium`, `large`
- **Theme Aware**: Automatically adapts to light/dark themes
- **Loading States**: Built-in loading indicator
- **Accessibility**: Proper accessibility labels and focus handling

## Usage Examples

### Basic Text Button
```tsx
<Button
  variant="primary"
  title="Click Me"
  onPress={() => console.log('Pressed!')}
/>
```

### Icon Only Button
```tsx
<Button
  variant="outline"
  icon="arrow-up"
  onPress={() => console.log('Upload!')}
/>
```

### Text + Icon Button
```tsx
<Button
  variant="primary"
  title="Send Message"
  icon="send"
  iconPosition="left"
  onPress={() => console.log('Sending...')}
/>
```

### Loading Button
```tsx
<Button
  variant="primary"
  title="Save"
  loading={isLoading}
  onPress={() => console.log('Saving...')}
/>
```

### Full Width Button
```tsx
<Button
  variant="primary"
  title="Continue"
  fullWidth
  onPress={() => console.log('Continue!')}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `title` | `string` | - | Button text |
| `icon` | `IconName` | - | Ionicon name |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to text |
| `iconSize` | `number` | auto | Custom icon size |
| `onPress` | `() => void` | - | Press handler |
| `disabled` | `boolean` | `false` | Disable button |
| `loading` | `boolean` | `false` | Show loading state |
| `fullWidth` | `boolean` | `false` | Stretch to full width |
| `style` | `ViewStyle` | - | Custom button styles |
| `textStyle` | `TextStyle` | - | Custom text styles |
| `testID` | `string` | - | Test identifier |
| `accessibilityLabel` | `string` | - | Accessibility label |

## Variants

- **Primary**: Main action button with brand color background
- **Secondary**: Secondary action with surface background and border
- **Outline**: Transparent background with colored border and text
- **Ghost**: Minimal style with no background or border

## Theme Integration

The button automatically adapts to the current theme:
- **Light Mode**: Dark text on light backgrounds, proper contrast ratios
- **Dark Mode**: Light text on dark backgrounds, adjusted colors for visibility