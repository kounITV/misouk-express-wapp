"use client"

import * as React from "react"
import { cn } from "@/components/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DropdownMenuContentProps {
  align?: "start" | "center" | "end"
  children: React.ReactNode
  className?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false)

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
  children 
}) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  align = "center", 
  children, 
  className 
}) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState<{ top: number; left: number; showAbove: boolean }>({ 
    top: 0, 
    left: 0, 
    showAbove: false 
  })

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  React.useEffect(() => {
    if (open && ref.current) {
      const triggerElement = ref.current.parentElement?.querySelector('button')
      if (!triggerElement) return
      
      const rect = triggerElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      const menuHeight = 80 // Approximate menu height for 2 items
      const menuWidth = 128 // 8rem = 128px
      
      // Determine vertical position
      const showAbove = spaceBelow < menuHeight && spaceAbove > menuHeight
      
      // Calculate top position
      let top = showAbove ? rect.top - menuHeight - 8 : rect.bottom + 8
      
      // Calculate left position based on align prop
      let left = rect.left
      if (align === 'end') {
        left = rect.right - menuWidth
      } else if (align === 'center') {
        left = rect.left + (rect.width / 2) - (menuWidth / 2)
      }
      
      // Ensure dropdown doesn't go off screen horizontally
      if (left < 8) left = 8
      if (left + menuWidth > viewportWidth - 8) left = viewportWidth - menuWidth - 8
      
      // Ensure dropdown doesn't go off screen vertically
      if (top < 8) top = 8
      if (top + menuHeight > viewportHeight - 8) top = viewportHeight - menuHeight - 8
      
      setPosition({ top, left, showAbove })
    }
  }, [open, align])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: 'fit-content',
        overflow: 'visible'
      }}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  className,
  onClick 
}) => {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
