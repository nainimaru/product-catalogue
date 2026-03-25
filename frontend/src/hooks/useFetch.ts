import {useState, useEffect} from 'react';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useFetch<T>(fetchFn: () => Promise<T>): FetchState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load= async () => {
            setLoading(true);
            setError(null);
            try{
                const result= await fetchFn();
                if(!cancelled) setData(result);
            } catch (err) {
                if(!cancelled) setError('Something went wrong. Please try again.');
            } finally {
                if(!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled= true;
        };
    }, []);

    return {data, loading, error};
}