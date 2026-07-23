import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}
interface SelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  ariaLabel,
}: SelectFieldProps) {
  return (
    <Select
      value={value || null}
      onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      disabled={disabled}
      items={options}
    >
      <SelectTrigger className={cn("field-control h-12 py-0", className)} aria-label={ariaLabel || placeholder}>
        <SelectValue>
          {(selectedValue) => options.find((option) => option.value === selectedValue)?.label || placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
