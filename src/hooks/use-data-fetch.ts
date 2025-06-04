import { ServiceFunction } from "@/types/api";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type DataFetchState<T> = {
    response?: T,
    hasError: boolean,
    isLoading: boolean,
};

const useDataFetch = <T, R>(apiFunc: ServiceFunction<T, R>, options?: {
    defaultValue?: R,
    onSuccess?: (res: R) => void
}): {
    request: (...args: T extends any[]? T : [T]) => Promise<void>,
} & DataFetchState<R> => {
    const [dataFetchState, setDataFetchState] = useState<DataFetchState<R>>({
        response: options?.defaultValue,
        hasError: false,
        isLoading: false
    });

    const request = useCallback(async (...args: T extends any[] ? T : [T]) => {
        let hasError = false;
        let response = options?.defaultValue;
        setDataFetchState(prev => ({...prev, hasError: false, isLoading: true}));
        try {
            const result = await apiFunc(...args);
            if (!result.success) {
                hasError = true;
                toast.error(result.error, {richColors: true});
            } else {
                response = result.data;
                if (options?.onSuccess)
                    options.onSuccess(result.data);
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
    }, [options?.onSuccess]);

    return useMemo(() => ({ request, ...dataFetchState }), [request, dataFetchState]);
};

export default useDataFetch;

