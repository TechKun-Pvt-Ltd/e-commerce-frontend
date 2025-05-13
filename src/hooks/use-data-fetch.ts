import { ServiceFunction } from "@/types/api";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const useDataFetch = <T, R>(apiFunc: ServiceFunction<T, R>, options?: {
    defaultValue?: R,
    onResponseReceived?: (res: R) => void
}) => {
    const [dataFetchState, setDataFetchState] = useState({
        response: options?.defaultValue,
        hasError: false,
        isLoading: true
    });

    const request = useCallback(async (...args: T extends any[] ? T : [T]) => {
        let { hasError, response } = dataFetchState;
        setDataFetchState(prev => ({...prev, isLoading: true}));
        try {
            const result = await apiFunc(...args);
            if (!result.success) {
                hasError = true;
                toast.error(result.error, {richColors: true});
            } else {
                if (options?.onResponseReceived)
                    options.onResponseReceived(result.data);
            }

            response = result.data;
        } catch (e) {
            hasError = true;
            if (e instanceof Error)
                toast.error(e.message);
        }
        setDataFetchState({ response, hasError, isLoading: false });
    }, [dataFetchState]);

    return { request, ...dataFetchState };
}

export default useDataFetch;

