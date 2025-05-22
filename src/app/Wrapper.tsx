"use client";

import { useAppDispatch } from "@/store/hooks";
import { setAutoFreeze } from 'immer';
import { getMyInformation } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { fetchCategories } from "@/store/slices/categorySlice";
import { fetchVariations } from "@/store/slices/variationSlice";
import { fetchAttributes } from "@/store/slices/attributeSlice";

setAutoFreeze(false);

export function Wrapper({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getMyInformation());
        dispatch(fetchCategories());
        dispatch(fetchVariations());
        dispatch(fetchAttributes());
    },[]);

    return <>
        {children}
    </>;
};
