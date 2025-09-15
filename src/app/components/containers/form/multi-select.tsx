import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    forwardRef,
    useEffect,
    useState,
    type ComponentPropsWithoutRef,
    type ElementRef,
} from "react";
import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    FormControl,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ScrollArea,
    Badge,
} from "../../ui";
import { X } from "lucide-react"
export type Option = {
    value: string | number;
    label: string;
};

type MultiSelectProps = Omit<
    ComponentPropsWithoutRef<typeof Command>,
    "onChange" | "onValueChange" | "value"
> & {
    options?: Option[];
    placeholder?: string;
    emptyMessage?: string;
    onChange?: (values: Option[]) => void;
    value?: Option[];
    defaultValue?: Option[];
    disabled?: boolean;
    className?: string;
};

export const MultiSelect = forwardRef<
    ElementRef<typeof Command>,
    MultiSelectProps
>(({ options = [], placeholder = "Select...", emptyMessage = "No options found.", onChange, value = [], defaultValue = [], disabled = false, className, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<(string | number)[]>(defaultValue.map((opt) => opt.value));

    useEffect(() => {
        if (defaultValue.length && !value.length) {
            setInternalValue(defaultValue.map((opt) => opt.value));
        }
    }, [defaultValue, value]);

    const selectedValues = value.length ? value : internalValue;

    const handleSelect = (optionValue: string | number) => {
        let newValues;
        if (selectedValues.includes(optionValue as any)) {
            newValues = selectedValues.filter((val) => val !== optionValue);
        } else {
            newValues = [...selectedValues, optionValue];
        }
        if (!value.length) {
            setInternalValue(newValues as any);
        }
        onChange?.(newValues as any);
    };

    const handleClear = () => {
        setInternalValue([]);
        onChange?.([]);
    };

    return (
        <div className="flex gap-x-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            disabled={disabled}
                            className={cn(
                                "relative w-full  h-auto justify-between px-3",
                                !internalValue.length && "text-muted-foreground",
                                className,
                            )}
                        >
                            {selectedValues.length > 0 ? (
                                <span className="flex flex-wrap gap-2">
                                    {selectedValues.map((val, i) => {
                                        const selectedOption = options.find((opt) => opt.value === val);
                                        return selectedOption ? <Badge key={i}>{selectedOption.label}</Badge> : null;
                                    })}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                            <CaretSortIcon className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className={cn(
                        "p-0 w-[var(--radix-popover-trigger-width)] max-h-[var(--radix-popover-content-available-height)]",
                        className,
                    )}
                >
                    <Command ref={ref} {...props}>
                        <CommandInput placeholder="Search..." className="h-9 placeholder-[#818A91]" />
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            <ScrollArea className="overflow-y-auto max-h-52">
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        {option.label}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedValues.includes(option.value as any) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </ScrollArea>
                        </CommandGroup>
                    </Command>
                    {selectedValues.length > 0 && (
                        <div className="border-t p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="w-full text-muted-foreground hover:text-foreground"
                            >
                                Clear selected
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
});

MultiSelect.displayName = "MultiSelect";

