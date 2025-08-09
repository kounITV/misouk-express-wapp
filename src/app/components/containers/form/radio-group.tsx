import React, { forwardRef } from "react";
import { FormControl, FormLabel, RadioGroup, RadioGroupItem } from "@/components/ui";
import { cn } from "@/lib/utils";


interface Option {
    value: string | number;
    label: string;
}

type RadioGroupFiledProps = {
    onChange?: (value: string) => void;
    className?: string;
    defaultValue?: string;
    value?: string;
    options: Option[];
    isSquare?: boolean;
    disableSaveButton?: boolean;
    disabled?: boolean;
};

export const RadioGroupField = forwardRef<
    React.ElementRef<typeof RadioGroup>,
    RadioGroupFiledProps
>((props, ref) => {
    return (
        <div className={cn(props, "mx-2")}>
            <FormControl>
                <RadioGroup
                    ref={ref}
                    disabled={props.disabled}
                    className={cn("flex my-2", props.className)}
                    onValueChange={props.onChange}
                    defaultValue={props.defaultValue}
                    value={props.value}
                >
                    {props.options.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                            <RadioGroupItem
                                value={option.value.toString()}
                                checked={props.value?.toString() === option.value.toString()}
                            >
                                {option.label}
                            </RadioGroupItem>
                            <FormLabel>{option.label}</FormLabel>
                        </div>
                    ))}
                </RadioGroup>
            </FormControl>
        </div>
    );
});

RadioGroupField.displayName = "RadioGroupField";