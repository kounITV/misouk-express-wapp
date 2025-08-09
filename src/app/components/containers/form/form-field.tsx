import {
  FormField as Field,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/";
import { Asterisk } from "lucide-react";
import { type ReactElement, cloneElement } from "react";
import {
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type FormFieldProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UseControllerProps<TFieldValues, TName> & {
    label?: string;
    required?: boolean;
    description?: string;
    children: ReactElement<{
        field: ControllerRenderProps<TFieldValues, TName>;
    }>;
};

export const FormField = <
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>
>(
    props: FormFieldProps<TFieldValues, TName>,
  ) => {
  const { label, required = true, description, control, name, children } = props;
  return (
    <Field
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="flex items-center text-gray-800 dark:text-gray-200">
              {required && (
                <Asterisk
                  size={14}
                  className="mr-1  text-red-500 shrink-0 animate-pulse"
                />
              )}
              <span className="font-medium">{label}</span>
            </FormLabel>
          )}
          <FormControl>
            {cloneElement(children, {
              ...field,
              ...children.props,
            })}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
