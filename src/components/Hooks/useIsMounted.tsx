import { useCallback, useEffect, useRef } from 'react';

export function useIsMounted(): boolean {
    const isMounted = useRef(true);
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const mounted = useCallback(() => {
        return isMounted.current;
    }, []);

    return mounted();
}
