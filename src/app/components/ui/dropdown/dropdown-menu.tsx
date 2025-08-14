"use client"

import * as React from "react"
import { cn } from "@/components/lib/utils"

// Types
export interface DropdownMenuProps {
  children: React.ReactNode
}

export interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

export interface DropdownMenuContentProps {
  align?: "start" | "center" | "end"
  children: React.ReactNode
  className?: string
}

export interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export interface DropdownMenuSeparatorProps {
  className?: string
}

// Context
interface DropdownContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownContextValue>({
  open: false,
  setOpen: () => {},
})

// Custom hook for using dropdown context
const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu')
  }
  return context
}

// Position calculation utility
const calculatePosition = (
  triggerRect: DOMRect,
  align: DropdownMenuContentProps['align'] = 'center'
) => {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const menuHeight = 80 // Approximate height for 2-3 items
  const menuWidth = 128 // 8rem = 128px
  const padding = 8

  // Vertical positioning
  const spaceBelow = viewportHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const showAbove = spaceBelow < menuHeight && spaceAbove > menuHeight
  
  let top = showAbove 
    ? triggerRect.top - menuHeight - padding 
    : triggerRect.bottom + padding

  // Horizontal positioning
  let left = triggerRect.left
  switch (align) {
    case 'end':
      left = triggerRect.right - menuWidth
      break
    case 'center':
      left = triggerRect.left + (triggerRect.width / 2) - (menuWidth / 2)
      break
    case 'start':
    default:
      left = triggerRect.left
      break
  }

  // Viewport boundary checks
  if (left < padding) left = padding
  if (left + menuWidth > viewportWidth - padding) {
    left = viewportWidth - menuWidth - padding
  }
  if (top < padding) top = padding
  if (top + menuHeight > viewportHeight - padding) {
    top = viewportHeight - menuHeight - padding
  }

  return { top, left, showAbove }
}

// Main Components
const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  // Close dropdown when clicking outside or pressing Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  asChild, 
  children,
  className 
}) => {
  const { open, setOpen } = useDropdownMenu()

  const handleClick = React.useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      className: cn(className, (children.props as any).className),
      'aria-expanded': open,
      'aria-haspopup': true,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button 
      onClick={handleClick}
      className={cn("outline-none", className)}
      aria-expanded={open}
      aria-haspopup={true}
    >
      {children}
    </button>
  )
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  align = "center", 
  children, 
  className 
}) => {
  const { open, setOpen } = useDropdownMenu()
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  // Calculate position when opened
  React.useEffect(() => {
    if (open && ref.current) {
      const triggerElement = ref.current.parentElement?.querySelector('button')
      if (!triggerElement) return
      
      const rect = triggerElement.getBoundingClientRect()
      const newPosition = calculatePosition(rect, align)
      setPosition(newPosition)
    }
  }, [open, align])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg",
        "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  )
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  className,
  onClick,
  disabled = false
}) => {
  const { setOpen } = useDropdownMenu()

  const handleClick = React.useCallback(() => {
    if (disabled) return
    onClick?.()
    setOpen(false)
  }, [onClick, disabled, setOpen])

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "hover:bg-gray-100 focus:bg-gray-100 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      role="menuitem"
      aria-disabled={disabled}
    >
      {children}
    </div>
  )
}

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ 
  className 
}) => (
  <div 
    className={cn("mx-1 my-1 h-px bg-gray-200", className)} 
    role="separator"
  />
)

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  useDropdownMenu,
}
