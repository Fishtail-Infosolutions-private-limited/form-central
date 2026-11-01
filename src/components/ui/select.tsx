"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SelectContextType {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  registerItem: (value: string, label: React.ReactNode) => void;
  unregisterItem: (value: string) => void;
  getItemLabel: (value: string) => React.ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select compound components must be rendered inside a <Select>");
  }
  return context;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [itemsMap, setItemsMap] = React.useState<Record<string, React.ReactNode>>({});

  const isControlledValue = controlledValue !== undefined;
  const value = isControlledValue ? controlledValue : uncontrolledValue;

  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : uncontrolledOpen;

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const registerItem = React.useCallback((val: string, label: React.ReactNode) => {
    setItemsMap((prev) => {
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  }, []);

  const unregisterItem = React.useCallback((val: string) => {
    setItemsMap((prev) => {
      if (!(val in prev)) return prev;
      const copy = { ...prev };
      delete copy[val];
      return copy;
    });
  }, []);

  const getItemLabel = React.useCallback((val: string) => itemsMap[val], [itemsMap]);

  const setOpen = React.useCallback(
    (newOpen: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof newOpen === "function" ? newOpen(open) : newOpen;
      if (!isControlledOpen) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlledOpen, onOpenChange, open]
  );

  const handleValueChange = React.useCallback(
    (newVal: string) => {
      if (!isControlledValue) {
        setUncontrolledValue(newVal);
      }
      onValueChange?.(newVal);
      setOpen(false);
    },
    [isControlledValue, onValueChange, setOpen]
  );

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        contentRef.current &&
        !contentRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        registerItem,
        unregisterItem,
        getItemLabel,
        triggerRef,
        contentRef,
        disabled,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  error?: boolean;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, error, ...props }, ref) => {
    const { open, setOpen, triggerRef, disabled } = useSelect();

    // Combine refs
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    return (
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || props.disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2 text-xs font-medium text-charcoal transition-all",
          "hover:border-saffron/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/30 focus-visible:border-saffron",
          "disabled:cursor-not-allowed disabled:bg-soft-cream disabled:opacity-60",
          error ? "border-rose-500" : "border-cream-dark shadow-xs",
          open && "border-saffron ring-2 ring-saffron/20",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 truncate text-left">{children}</div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200",
            open && "rotate-180 text-saffron"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SelectValue({ placeholder = "Select option...", className, children }: SelectValueProps) {
  const { getItemLabel, value } = useSelect();

  const label = children || (value ? getItemLabel(value) || value : null);

  if (!value && !label) {
    return <span className={cn("text-stone-400 font-normal truncate", className)}>{placeholder}</span>;
  }

  return <span className={cn("truncate font-medium text-stone-900", className)}>{label}</span>;
}

export interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
  position?: "bottom" | "top";
}

export function SelectContent({
  className,
  children,
  position = "bottom",
}: SelectContentProps) {
  const { open, contentRef } = useSelect();

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-xl border border-cream-dark bg-white shadow-xl transition-all duration-150 ease-out",
        position === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
        open
          ? "opacity-100 scale-100 pointer-events-auto visible translate-y-0"
          : "opacity-0 scale-95 pointer-events-none invisible -translate-y-1",
        className
      )}
    >
      <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 divide-y-0 text-xs">
        {children}
      </div>
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SelectItem({
  value: itemValue,
  disabled = false,
  className,
  children,
}: SelectItemProps) {
  const { value, onValueChange, registerItem, unregisterItem } = useSelect();
  const isSelected = value === itemValue;

  React.useEffect(() => {
    registerItem(itemValue, children);
    return () => {
      unregisterItem(itemValue);
    };
  }, [itemValue, children, registerItem, unregisterItem]);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onValueChange(itemValue);
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-stone-700 outline-none transition-colors",
        "hover:bg-soft-cream hover:text-maroon focus:bg-soft-cream focus:text-maroon",
        isSelected && "bg-soft-cream/80 text-maroon font-bold",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      <span className="truncate pr-2">{children}</span>
      {isSelected && (
        <Check className="h-3.5 w-3.5 text-saffron shrink-0 stroke-[2.5]" />
      )}
    </button>
  );
}

export function SelectGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-1 space-y-0.5", className)}>{children}</div>;
}

export function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-saffron font-sans", className)}>
      {children}
    </div>
  );
}

export function SelectSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-[1px] bg-cream-dark/60", className)} />;
}
