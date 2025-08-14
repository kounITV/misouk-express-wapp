"use client"

import * as React from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu"
import { cn } from "@/components/lib/utils"

interface ActionItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

interface ActionsDropdownProps {
  actions?: ActionItem[]
  onEdit?: () => void
  onDelete?: () => void
  className?: string
  triggerClassName?: string
  align?: "start" | "center" | "end"
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  actions,
  onEdit,
  onDelete,
  className,
  triggerClassName,
  align = "end"
}) => {
  // Default actions if none provided
  const defaultActions: ActionItem[] = React.useMemo(() => {
    const items: ActionItem[] = []
    
    if (onEdit) {
      items.push({
        label: "ແກ້ໄຂ",
        icon: <Edit className="w-4 h-4" />,
        onClick: onEdit,
      })
    }
    
    if (onDelete) {
      items.push({
        label: "ລຶບ",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: onDelete,
        variant: 'destructive' as const,
      })
    }
    
    return items
  }, [onEdit, onDelete])

  const finalActions = actions || defaultActions

  if (finalActions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100 focus:bg-gray-100",
            triggerClassName
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="sr-only">ເປີດເມນູການກະທຳ</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        {finalActions.map((action, index) => (
          <React.Fragment key={index}>
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center gap-2",
                action.variant === 'destructive' && "text-red-600 hover:bg-red-50 focus:bg-red-50"
              )}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
            {/* Add separator before last destructive action */}
            {index === finalActions.length - 2 && 
             finalActions[finalActions.length - 1]?.variant === 'destructive' && (
              <DropdownMenuSeparator />
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ActionsDropdown }
export type { ActionItem, ActionsDropdownProps }
