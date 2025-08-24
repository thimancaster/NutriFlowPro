import React, {useMemo, useState, useEffect} from "react";

interface VirtualizedListProps<T> {
	items: T[];
	itemHeight: number;
	containerHeight: number;
	renderItem: (item: T, index: number) => React.ReactNode;
	overscan?: number;
}

function VirtualizedList<T>({
	items,
	itemHeight,
	containerHeight,
	renderItem,
	overscan = 5,
}: VirtualizedListProps<T>) {
	const [scrollTop, setScrollTop] = useState(0);

	const visibleItemCount = Math.ceil(containerHeight / itemHeight);
	const totalHeight = items.length * itemHeight;

	const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
	const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount + overscan * 2);

	const visibleItems = useMemo(() => {
		return items.slice(startIndex, endIndex + 1).map((item, index) => ({
			item,
			index: startIndex + index,
		}));
	}, [items, startIndex, endIndex]);

	const offsetY = startIndex * itemHeight;

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	};

	return (
		<div style={{height: containerHeight, overflow: "auto"}} onScroll={handleScroll}>
			<div style={{height: totalHeight, position: "relative"}}>
				<div style={{transform: `translateY(${offsetY}px)`}}>
					{visibleItems.map(({item, index}) => (
						<div key={index} style={{height: itemHeight}}>
							{renderItem(item, index)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default VirtualizedList;
