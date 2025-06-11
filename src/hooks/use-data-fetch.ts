import { ApiResponse, ServiceFunction } from "@/types/api";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

type DataFetchState<T> = {
    response?: T,
    hasError: boolean,
    isLoading: boolean,
};

type RequestSuccessHandler<R> = {
    apiResponsePromise: ApiResponse<R>,
    onSuccess: (callback: (res: R) => void) => RequestSuccessHandler<R>
}

const useDataFetch = <T, R>(apiFunc: ServiceFunction<T, R>, options?: {
    defaultValue?: R,
}): {
    request: (...args: T extends any[]? T : [T]) => RequestSuccessHandler<R>,
} & DataFetchState<R> => {
    const [dataFetchState, setDataFetchState] = useState<DataFetchState<R>>({
        response: options?.defaultValue,
        hasError: false,
        isLoading: false
    });

    const request = useCallback((...args: T extends any[] ? T : [T]) => {
        setDataFetchState(prev => ({...prev, hasError: false, isLoading: true}));
        const promise = apiFunc(...args).then(result => {
            let hasError = false;
            let response = options?.defaultValue;
            try {
                if (!result.success) {
                    hasError = true;
                    toast.error(result.error, {richColors: true});
                } else {
                    response = result.data;
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
            return result;
        });

        return {
            apiResponsePromise: promise,
            onSuccess(callback: (res: R) => void) {
                this.apiResponsePromise = this.apiResponsePromise.then(res => {
                    res.success && callback(res.data);
                    return res;
                });
                return this;
            }
        }
    }, []);

    return useMemo(() => ({ request, ...dataFetchState }), [dataFetchState]);
};

export default useDataFetch;
