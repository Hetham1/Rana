import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-right text-sm text-slate-800 shadow-sm outline-none transition-[border-color,box-shadow,background-color] hover:border-blue-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.Icon className="shrink-0 text-slate-400">
      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
    </SelectPrimitive.Icon>
    {children}
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Popup> & {
  sideOffset?: number;
  align?: "start" | "center" | "end";
};

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Popup>,
  SelectContentProps
>(({ className, children, sideOffset = 6, align = "start", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      sideOffset={sideOffset}
      align={align}
      alignItemWithTrigger={false}
      className="z-[100] outline-none"
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          "min-w-[var(--anchor-width)] max-w-[min(24rem,var(--available-width))] origin-[var(--transform-origin)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-[0_18px_55px_-22px_rgba(15,23,42,.45)] outline-none transition-[transform,scale,opacity] duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpArrow className="flex h-7 items-center justify-center text-slate-400">
          <ChevronUp className="h-4 w-4" />
        </SelectPrimitive.ScrollUpArrow>
        <SelectPrimitive.List className="max-h-72 overflow-y-auto overscroll-contain py-0.5">
          {children}
        </SelectPrimitive.List>
        <SelectPrimitive.ScrollDownArrow className="flex h-7 items-center justify-center text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownArrow>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.GroupLabel>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.GroupLabel
    ref={ref}
    className={cn("px-3 py-2 text-xs font-semibold text-slate-500", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex min-h-10 cursor-default select-none items-center justify-between gap-3 rounded-xl px-3 py-2 text-right text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900 data-[selected]:font-semibold data-[selected]:text-blue-800",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="shrink-0 text-blue-700">
      <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText className="flex-1">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("my-1 h-px bg-slate-100", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
