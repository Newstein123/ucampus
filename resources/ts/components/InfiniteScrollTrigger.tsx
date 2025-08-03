import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
    onIntersect: () => void;
    isLoading: boolean;
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ onIntersect, isLoading, hasNextPage, isFetchingNextPage }) => {
    const observerRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
                onIntersect();
            }
        },
        [onIntersect, hasNextPage, isFetchingNextPage, isLoading],
    );

    useEffect(() => {
        const element = observerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px', // Start loading 100px before the element comes into view
            threshold: 0.1,
        });

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [handleObserver]);

    if (!hasNextPage) {
        return (
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    No more contributions to load
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            ref={observerRef}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 3,
                minHeight: 60,
            }}
        >
            {isFetchingNextPage && <CircularProgress size={24} sx={{ color: '#1F8505' }} />}
        </Box>
    );
};

export default InfiniteScrollTrigger;
