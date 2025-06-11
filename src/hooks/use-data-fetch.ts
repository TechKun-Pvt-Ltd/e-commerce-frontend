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
}): {
    request: (...args: T extends any[]? T : [T]) => { onSuccess: (callback: (res: R) => void) => void },
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
            apiResultPromise: promise,
            onSuccess(callback: (res: R) => void) {
                this.apiResultPromise = this.apiResultPromise.then(res => {
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
