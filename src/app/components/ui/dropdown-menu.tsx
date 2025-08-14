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
  const [position, setPosition] = React.useState<'bottom' | 'top'>('bottom')

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
      const rect = ref.current.parentElement?.getBoundingClientRect()
      if (!rect) return
      
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const menuHeight = 100 // Approximate menu height
      
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
  }, [open])

  if (!open) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0"
  }

  const positionClasses = position === 'top' 
    ? "bottom-full mb-1" 
    : "top-full mt-1"

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg",
        positionClasses,
        alignmentClasses[align],
        className
      )}
      style={{
        maxHeight: '200px',
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
