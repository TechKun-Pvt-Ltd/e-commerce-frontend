import { ServiceFunction } from "@/types/api";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type DataFetchState<T> = {
    response?: T,
    hasError: boolean,
    isLoading: boolean,
};

const useDataFetch = <T, R>(apiFunc: ServiceFunction<T, R>, options?: {
    defaultValue?: R,
    onResponseReceived?: (res: R) => void
}): {
    request: (...args: T extends any[]? T : [T]) => Promise<void>,
} & DataFetchState<R> => {
    const [dataFetchState, setDataFetchState] = useState<DataFetchState<R>>({
        response: options?.defaultValue,
        hasError: false,
        isLoading: false
    });

    const request = useCallback(async (...args: T extends any[] ? T : [T]) => {
        let { hasError, response } = dataFetchState;
        setDataFetchState(prev => ({...prev, hasError: false, isLoading: true}));
        try {
            const result = await apiFunc(...args);
            if (!result.success) {
                hasError = true;
                toast.error(result.error, {richColors: true});
            } else {
                response = result.data;
                hasError = false;
                if (options?.onResponseReceived)
                    options.onResponseReceived(result.data);
            }
        } catch (e) {
            hasError = true;
            if (e instanceof Error)
                toast.error(e.message);
        }

        setDataFetchState({
            response,
            hasError,
            isLoading: false
        });
    }, [dataFetchState, options?.onResponseReceived]);

    return { request, ...dataFetchState };
};

export default useDataFetch;

