import { FormControl, Label, Switch as SwitchUI } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Content as SwitchContentType } from "@radix-ui/react-select";
import React, { forwardRef } from "react";

interface Switchrops {
  value?: boolean;
  onChange?: (value: boolean) => void;
  placeholder?: string;
  emptyMessage?: string;
  options?: any[];
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  require?: boolean;
}

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchContentType>,
  Switchrops
>((props, ref) => {
  const { value, onChange, activeLabel, inactiveLabel, className, require = true, ...rest } = props;
  return (
    <div className={cn(className, "flex items-center space-x-2 w-60 my-2")}>
      <FormControl>
        <SwitchUI checked={value} onCheckedChange={onChange} {...rest} />
      </FormControl>
      <Label htmlFor="active">{value ? activeLabel || 'ເປີດ' : inactiveLabel || 'ປິດ'}</Label>
    </div>
  );
});

Switch.displayName = "Switch";
