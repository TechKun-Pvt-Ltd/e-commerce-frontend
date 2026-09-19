"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CountryCode {
    code: string;       // ISO 2-letter
    name: string;
    dialCode: string;   // e.g. "+90"
    flag: string;       // emoji flag
}

export const PRIORITY_COUNTRIES: CountryCode[] = [
    { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
    { code: "TR", name: "Turkey", dialCode: "+90", flag: "🇹🇷" },
    { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
    { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
    { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
    { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
    { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
    { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
    { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
    { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
    { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
    { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
    { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
    { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
    { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
    { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
    { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
    { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
    { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
    { code: "AZ", name: "Azerbaijan", dialCode: "+994", flag: "🇦🇿" },
    { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
    { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
];

export const OTHER_COUNTRIES: CountryCode[] = [
    { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫" },
    { code: "AL", name: "Albania", dialCode: "+355", flag: "🇦🇱" },
    { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿" },
    { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
    { code: "AM", name: "Armenia", dialCode: "+374", flag: "🇦🇲" },
    { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
    { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
    { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
    { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "🇧🇬" },
    { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
    { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
    { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
    { code: "HR", name: "Croatia", dialCode: "+385", flag: "🇭🇷" },
    { code: "CY", name: "Cyprus", dialCode: "+357", flag: "🇨🇾" },
    { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿" },
    { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
    { code: "EE", name: "Estonia", dialCode: "+372", flag: "🇪🇪" },
    { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
    { code: "GE", name: "Georgia", dialCode: "+995", flag: "🇬🇪" },
    { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷" },
    { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺" },
    { code: "IS", name: "Iceland", dialCode: "+354", flag: "🇮🇸" },
    { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
    { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
    { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
    { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱" },
    { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
    { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴" },
    { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "🇰🇿" },
    { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
    { code: "LV", name: "Latvia", dialCode: "+371", flag: "🇱🇻" },
    { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧" },
    { code: "LT", name: "Lithuania", dialCode: "+370", flag: "🇱🇹" },
    { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "🇱🇺" },
    { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
    { code: "MT", name: "Malta", dialCode: "+356", flag: "🇲🇹" },
    { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
    { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦" },
    { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
    { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
    { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
    { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
    { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
    { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴" },
    { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
    { code: "SK", name: "Slovakia", dialCode: "+421", flag: "🇸🇰" },
    { code: "SI", name: "Slovenia", dialCode: "+386", flag: "🇸🇮" },
    { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
    { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦" },
    { code: "UZ", name: "Uzbekistan", dialCode: "+998", flag: "🇺🇿" },
].sort((a, b) => a.name.localeCompare(b.name));

const ALL_COUNTRIES = [...PRIORITY_COUNTRIES, ...OTHER_COUNTRIES];

interface PhoneInputProps {
    value?: string;
    onChange?: (fullNumber: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export function PhoneInput({
    value = "",
    onChange,
    onBlur,
    disabled = false,
    placeholder = "555 123 4567",
    className,
}: PhoneInputProps) {
    // Parse initial dial code and national number from value
    const parseValue = (raw: string): { dialCode: string; nationalNumber: string } => {
        if (!raw) return { dialCode: "+1", nationalNumber: "" };
        const cleaned = raw.trim();
        if (!cleaned.startsWith("+")) {
            return { dialCode: "+1", nationalNumber: cleaned.replace(/\D/g, "") };
        }
        // Match against known dial codes (longest first to avoid +1 matching before +1246 etc.)
        const sortedCodes = [...ALL_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
        for (const c of sortedCodes) {
            if (cleaned.startsWith(c.dialCode)) {
                return {
                    dialCode: c.dialCode,
                    nationalNumber: cleaned.slice(c.dialCode.length).replace(/\D/g, ""),
                };
            }
        }
        return { dialCode: "+1", nationalNumber: cleaned.replace(/\D/g, "") };
    };

    const parsed = useMemo(() => parseValue(value), [value]);
    const [selectedDialCode, setSelectedDialCode] = useState<string>(parsed.dialCode || "+1");
    const [nationalNumber, setNationalNumber] = useState<string>(parsed.nationalNumber || "");

    useEffect(() => {
        const { dialCode, nationalNumber: nat } = parseValue(value);
        if (dialCode) setSelectedDialCode(dialCode);
        setNationalNumber(nat);
    }, [value]);

    const handleDialCodeChange = (newCode: string) => {
        setSelectedDialCode(newCode);
        const full = nationalNumber ? `${newCode}${nationalNumber}` : "";
        onChange?.(full);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "");
        setNationalNumber(digits);
        const full = digits ? `${selectedDialCode}${digits}` : "";
        onChange?.(full);
    };

    const selectedCountry = ALL_COUNTRIES.find((c) => c.dialCode === selectedDialCode) || PRIORITY_COUNTRIES[0];

    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex gap-2">
                {/* Country Code Select */}
                <Select
                    value={selectedDialCode}
                    onValueChange={handleDialCodeChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-[120px] shrink-0 font-medium px-2.5 bg-background">
                        <SelectValue>
                            <span className="flex items-center gap-1.5 truncate">
                                <span className="text-base leading-none">{selectedCountry.flag}</span>
                                <span className="text-xs font-mono">{selectedCountry.dialCode}</span>
                            </span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                        <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider">Popular</SelectLabel>
                            {PRIORITY_COUNTRIES.map((c) => (
                                <SelectItem key={`priority-${c.code}`} value={c.dialCode}>
                                    <span className="flex items-center gap-2">
                                        <span>{c.flag}</span>
                                        <span>{c.name}</span>
                                        <span className="text-muted-foreground text-xs font-mono ml-auto">{c.dialCode}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground uppercase tracking-wider">All Countries</SelectLabel>
                            {OTHER_COUNTRIES.map((c) => (
                                <SelectItem key={`other-${c.code}`} value={c.dialCode}>
                                    <span className="flex items-center gap-2">
                                        <span>{c.flag}</span>
                                        <span>{c.name}</span>
                                        <span className="text-muted-foreground text-xs font-mono ml-auto">{c.dialCode}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {/* National Number Input */}
                <Input
                    type="tel"
                    inputMode="tel"
                    placeholder={placeholder}
                    value={nationalNumber}
                    onChange={handleNumberChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className="flex-1 font-mono tracking-wide"
                />
            </div>
            <p className="text-[11px] text-muted-foreground tracking-tight">
                Include your country code (e.g. +1 for US, +90 for Turkey)
            </p>
        </div>
    );
}

export default PhoneInput;
