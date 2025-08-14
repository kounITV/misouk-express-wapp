# Dropdown Components

A collection of optimized, reusable dropdown components with smart positioning and accessibility features.

## Components

### 1. DropdownMenu (Base Component)

The foundation component that provides dropdown functionality with context management.

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => console.log('Action 1')}>
      Action 1
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => console.log('Action 2')}>
      Action 2
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 2. ActionsDropdown (Specialized Component)

Pre-built dropdown for table actions (Edit/Delete) with proper styling and icons.

```tsx
import { ActionsDropdown } from '@/components/ui/dropdown'

// Simple usage with default Edit/Delete actions
<ActionsDropdown
  onEdit={() => handleEdit(item.id)}
  onDelete={() => handleDelete(item.id)}
  align="end"
/>

// Custom actions
<ActionsDropdown
  actions={[
    {
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => handleView(item.id)
    },
    {
      label: "Clone",
      icon: <Copy className="w-4 h-4" />,
      onClick: () => handleClone(item.id)
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDelete(item.id),
      variant: 'destructive'
    }
  ]}
  align="end"
/>
```

## Features

### Smart Positioning
- **Automatic positioning**: Dropdowns automatically position themselves above or below the trigger based on available viewport space
- **Viewport boundaries**: Ensures dropdowns never go off-screen
- **Fixed positioning**: Uses fixed positioning to avoid issues with table overflow

### Accessibility
- **Keyboard navigation**: Supports Escape key to close
- **ARIA attributes**: Proper `role`, `aria-expanded`, `aria-haspopup` attributes
- **Screen reader support**: Includes screen reader labels

### Styling
- **Consistent design**: Matches the application's design system
- **Hover effects**: Smooth transitions and hover states
- **Destructive actions**: Special styling for delete/destructive actions
- **Icon support**: Built-in icon support with proper spacing

## Props

### DropdownMenuContent Props
- `align`: "start" | "center" | "end" - Horizontal alignment
- `className`: Additional CSS classes
- `children`: Menu items

### ActionsDropdown Props
- `onEdit`: () => void - Edit action handler
- `onDelete`: () => void - Delete action handler
- `actions`: ActionItem[] - Custom actions array
- `align`: "start" | "center" | "end" - Alignment (default: "end")
- `className`: Additional CSS classes for content
- `triggerClassName`: Additional CSS classes for trigger button

### ActionItem Interface
```tsx
interface ActionItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}
```

## Best Practices

1. **Use ActionsDropdown for table actions**: It's optimized for common CRUD operations
2. **Set proper alignment**: Use `align="end"` for dropdowns in the rightmost table column
3. **Provide meaningful labels**: Use clear, descriptive labels for actions
4. **Handle loading states**: Disable actions during async operations
5. **Confirm destructive actions**: Always confirm delete operations

## Examples

### Table Actions
```tsx
// In a table cell
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <ActionsDropdown
    onEdit={() => handleEdit(user.id)}
    onDelete={() => handleDelete(user.id)}
    align="end"
  />
</td>
```

### Custom Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      More Options
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem onClick={handleExport}>
      Export Data
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleSettings}>
      Settings
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```
