import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";

const DropdownMenu = MenuPrimitive.Root;
const DropdownMenuGroup = MenuPrimitive.Group;
const DropdownMenuLabel = MenuPrimitive.GroupLabel;
const DropdownMenuSeparator = MenuPrimitive.Separator;

type TriggerProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Trigger> & {
  asChild?: boolean;
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  TriggerProps
>(({ asChild, children, render, ...props }, ref) => (
  <MenuPrimitive.Trigger
    ref={ref}
    render={render ?? (asChild && React.isValidElement(children) ? children : undefined)}
    {...props}
  >
    {asChild ? undefined : children}
  </MenuPrimitive.Trigger>
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

type ContentProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Popup> & {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  sideOffset?: number;
};

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Popup>,
  ContentProps
>(({ className, align = "start", side = "bottom", sideOffset = 6, ...props }, ref) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner className="z-[110] outline-none" align={align} side={side} sideOffset={sideOffset}>
      <MenuPrimitive.Popup
        ref={ref}
        className={cn(
          "min-w-44 origin-[var(--transform-origin)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-[0_18px_55px_-22px_rgba(15,23,42,.5)] outline-none transition-[transform,scale,opacity] duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <MenuPrimitive.Item
    ref={ref}
    className={cn(
      "flex min-h-10 cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-900",
      inset && "pr-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("mr-auto text-xs text-slate-400", className)} {...props} />
);

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
};
