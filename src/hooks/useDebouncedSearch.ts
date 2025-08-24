import {useState, useEffect, useRef, useCallback} from "react";

interface UseDebouncedSearchOptions {
	delay?: number;
	minLength?: number;
}

export const useDebouncedSearch = (
	searchFunction: (query: string) => Promise<any>,
	options: UseDebouncedSearchOptions = {}
) => {
	const {delay = 300, minLength = 2} = options;

	const [query, setQuery] = useState("");
	const [results, setResults] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const timeoutRef = useRef<NodeJS.Timeout>();
	const abortControllerRef = useRef<AbortController>();

	const search = useCallback(
		async (searchQuery: string) => {
			if (searchQuery.length < minLength) {
				setResults([]);
				setIsLoading(false);
				return;
			}

			// Cancel previous request
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			// Create new abort controller
			abortControllerRef.current = new AbortController();

			setIsLoading(true);
			setError(null);

			try {
				const result = await searchFunction(searchQuery);
				if (!abortControllerRef.current.signal.aborted) {
					setResults(result);
				}
			} catch (err) {
				if (!abortControllerRef.current.signal.aborted) {
					setError(err as Error);
					setResults([]);
				}
			} finally {
				if (!abortControllerRef.current.signal.aborted) {
					setIsLoading(false);
				}
			}
		},
		[searchFunction, minLength]
	);

	useEffect(() => {
		// Clear previous timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// Set new timeout
		timeoutRef.current = setTimeout(() => {
			search(query);
		}, delay);

		// Cleanup
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [query, search, delay]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return {
		query,
		setQuery,
		results,
		isLoading,
		error,
		clearResults: () => setResults([]),
	};
};
