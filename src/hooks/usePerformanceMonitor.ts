import {useEffect, useRef} from "react";

interface PerformanceMetrics {
	renderTime: number;
	componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
	const renderStartTime = useRef<number>(0);
	const renderCount = useRef<number>(0);

	useEffect(() => {
		renderStartTime.current = performance.now();
		renderCount.current++;
	});

	useEffect(() => {
		const renderTime = performance.now() - renderStartTime.current;

		// Only log slow renders in development
		if (process.env.NODE_ENV === "development" && renderTime > 16) {
			console.warn(
				`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (render #${
					renderCount.current
				})`
			);
		}

		// Track metrics for performance monitoring
		if (window.performance && window.performance.mark) {
			window.performance.mark(`${componentName}-render-end`);

			if (renderCount.current > 1) {
				window.performance.measure(
					`${componentName}-render`,
					`${componentName}-render-start`,
					`${componentName}-render-end`
				);
			}

			window.performance.mark(`${componentName}-render-start`);
		}
	});

	return {
		renderCount: renderCount.current,
	};
};
