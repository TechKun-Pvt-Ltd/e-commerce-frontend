"use client";

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Search } from "lucide-react";
import { Checkbox } from "./checkbox";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

const MultiSelectContext = React.createContext<{
    searchInput: string,
    setSearchInput: React.Dispatch<React.SetStateAction<string>>
}>({
    searchInput: "",
    setSearchInput: () => {}
});

export function MultiSelect(props: React.ComponentProps<typeof Popover>) {
    const [searchInput, setSearchInput] = React.useState("");

    return <MultiSelectContext.Provider value={{ searchInput, setSearchInput }}>
        <Popover {...props} />
    </MultiSelectContext.Provider>;
};

export function MultiSelectTrigger(props: React.ComponentProps<typeof PopoverTrigger>) {
    return <PopoverTrigger {...props} />;
};

export function MultiSelectContent({className, ...props}: React.ComponentProps<typeof PopoverContent>) {
    return <PopoverContent align="start"
        className={cn("p-0", className)}
        {...props} />;
};

export function MultiSelectSearchInput({className, ...props}: React.ComponentProps<"input">) {
    const { searchInput, setSearchInput } = React.useContext(MultiSelectContext);

    return <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className={cn(
                "w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    </div>;
};

export function MultiSelectMenu({className, ...props}: React.ComponentProps<"div">) {
    const { searchInput } = React.useContext(MultiSelectContext);
    const menuItems = React.Children.toArray(props.children).filter(child => {
        if (React.isValidElement(child) && child.type === MultiSelectMenuItem) {
            const { props } = (child as React.ReactElement<React.ComponentProps<typeof MultiSelectMenuItem>, typeof MultiSelectMenuItem>)
            return props.label.toLowerCase().includes(searchInput.toLowerCase());
        }
    });
    props.children = menuItems.length ? menuItems : <div className="px-2 py-1.5 text-muted-foreground text-sm">No items found</div>;

    return <div className={cn('border-b p-1', className)} {...props}/>;
};

export function MultiSelectMenuItem({
    className = "", label, checked = false, toggle,
    disabled = false, disabledMessage = ""
}: {
    checked: boolean,
    toggle: () => void,
    disabled?: boolean,
    disabledMessage?: string,
    className?: string,
    label: string
}) {
    const menuItemEl = <div
        className={cn(
            `rounded-sm px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-accent ${disabled? "opacity-50 cursor-not-allowed" : ""}`,
            className
        )}
        onClick={toggle}
    >
        <Checkbox
            checked={checked}
            onChange={toggle}
        />
        <span className="text-sm">{label}</span>
    </div>;

    return disabled ? (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{menuItemEl}</TooltipTrigger>
                <TooltipContent>
                    <p>{disabledMessage}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>) : menuItemEl;
};

export function MultiSelectFooter({className, ...props}: React.ComponentProps<"div">) {
    return <div className="p-1">
        <div className={cn(
            "rounded-sm px-2 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-accent",
            className
        )} {...props} />
    </div>;
};