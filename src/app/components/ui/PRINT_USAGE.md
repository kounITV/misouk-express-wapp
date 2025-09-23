# Print Functionality with react-to-print

This document explains how to use the print functionality in your application using the `react-to-print` library.

## Components Available

### 1. PrintButton
A complete print button component that includes both the button and the content to be printed.

### 2. PrintWrapper
A wrapper component for content that will be printed, used with custom print buttons.

### 3. usePrint Hook
A custom hook that provides print functionality for custom implementations.

## Basic Usage

### Simple Print Button

```tsx
import { PrintButton } from '@/app/components/ui';

export const MyComponent = () => {
  return (
    <PrintButton
      printTitle="My Document"
      buttonText="Print Document"
      variant="outline"
    >
      <div className="p-6">
        <h1>Document Title</h1>
        <p>This content will be printed.</p>
      </div>
    </PrintButton>
  );
};
```

### Custom Print Button with PrintWrapper

```tsx
import { PrintWrapper, usePrint } from '@/app/components/ui';

export const MyComponent = () => {
  const { componentRef, handlePrint } = usePrint("My Document");

  return (
    <>
      <button onClick={handlePrint} className="custom-print-btn">
        Print
      </button>
      
      <PrintWrapper ref={componentRef}>
        <div className="p-6">
          <h1>Document Title</h1>
          <p>This content will be printed.</p>
        </div>
      </PrintWrapper>
    </>
  );
};
```

## PrintButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to be printed |
| `className` | `string` | - | Additional CSS classes for the button |
| `variant` | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"outline"` | Button variant |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `printTitle` | `string` | `"Document"` | Title for the printed document |
| `onBeforePrint` | `() => void` | - | Callback before printing |
| `onAfterPrint` | `() => void` | - | Callback after printing |
| `onPrintError` | `(errorLocation: string, error: Error) => void` | - | Error callback |
| `disabled` | `boolean` | `false` | Disable the print button |
| `buttonText` | `string` | `"Print"` | Text for the print button |
| `showIcon` | `boolean` | `true` | Show printer icon |

## Print Styles

Import the print styles in your global CSS or component:

```tsx
import '@/app/components/ui/print-styles.css';
```

### Available Print CSS Classes

- `.no-print` - Hide element when printing
- `.page-break-before` - Force page break before element
- `.page-break-after` - Force page break after element
- `.page-break-inside-avoid` - Avoid page break inside element
- `.print-bg-white` - Ensure white background when printing
- `.print-border` - Add black border when printing
- `.print-text-black` - Ensure black text when printing
- `.print-table` - Table styles optimized for printing
- `.print-card` - Card styles optimized for printing

## Examples

### Print a Table/Report

```tsx
import { PrintButton } from '@/app/components/ui';

export const ReportComponent = () => {
  const data = [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" },
  ];

  return (
    <PrintButton
      printTitle="User Report"
      buttonText="Print Report"
      onBeforePrint={() => console.log("Printing report...")}
    >
      <div className="p-6 print-bg-white">
        <h1 className="text-2xl font-bold mb-4 print-header">User Report</h1>
        
        <table className="print-table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {data.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="print-footer">
          Generated on: {new Date().toLocaleDateString()}
        </div>
      </div>
    </PrintButton>
  );
};
```

### Print with Callbacks

```tsx
import { PrintButton } from '@/app/components/ui';

export const CallbackExample = () => {
  const handleBeforePrint = () => {
    // Prepare data, show loading, etc.
    console.log("Preparing to print...");
  };

  const handleAfterPrint = () => {
    // Clean up, hide loading, etc.
    console.log("Print completed!");
  };

  const handlePrintError = (errorLocation: string, error: Error) => {
    console.error("Print failed:", errorLocation, error);
    // Show error message to user
  };

  return (
    <PrintButton
      printTitle="Document with Callbacks"
      onBeforePrint={handleBeforePrint}
      onAfterPrint={handleAfterPrint}
      onPrintError={handlePrintError}
    >
      <div className="p-6">
        <h1>Document with Callbacks</h1>
        <p>This will trigger callbacks during the print process.</p>
      </div>
    </PrintButton>
  );
};
```

### Hide Elements When Printing

```tsx
import { PrintButton } from '@/app/components/ui';

export const HideElementsExample = () => {
  return (
    <div>
      {/* This button won't be printed */}
      <button className="no-print">Edit</button>
      
      <PrintButton printTitle="Clean Document">
        <div className="p-6">
          <h1>Clean Document</h1>
          <p>Only this content will be printed.</p>
          
          {/* This navigation won't be printed */}
          <nav className="no-print">
            <a href="/home">Home</a>
            <a href="/about">About</a>
          </nav>
        </div>
      </PrintButton>
    </div>
  );
};
```

## Best Practices

1. **Use print-specific CSS classes** for better print formatting
2. **Hide navigation and UI elements** using `.no-print` class
3. **Use callbacks** to handle loading states and user feedback
4. **Test print layouts** in different browsers
5. **Keep print content simple** and focused
6. **Use page break classes** for multi-page documents
7. **Ensure good contrast** with `.print-text-black` and `.print-bg-white`

## Browser Compatibility

The `react-to-print` library works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Troubleshooting

### Print dialog not opening
- Ensure the component is properly mounted
- Check browser popup blockers
- Verify the content ref is correctly set

### Styling issues in print
- Use print-specific CSS classes
- Test in different browsers
- Check for conflicting CSS rules

### Content not printing correctly
- Ensure the content is inside the PrintWrapper or PrintButton children
- Check for CSS that might hide content in print mode
- Verify the component ref is properly connected
