"use client";

import { useAppDispatch } from "@/store/hooks";
import { getMyInformation } from "@/store/slices/authSlice";
import { useEffect } from "react";

export function Wrapper({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getMyInformation());
    },[]);

    return <>
        {children}
    </>;
};
