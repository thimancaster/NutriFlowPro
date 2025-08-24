import React from "react";

const LoadingSpinner: React.FC = () => {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="flex flex-col items-center space-y-4">
				<div className="w-8 h-8 border-4 border-nutri-blue border-t-transparent rounded-full animate-spin"></div>
				<p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
			</div>
		</div>
	);
};

export default LoadingSpinner;
