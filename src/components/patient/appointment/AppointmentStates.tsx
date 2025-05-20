
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface EmptyStateProps {
  message: string;
}

export const LoadingState: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-[120px] w-full" />
    <Skeleton className="h-[120px] w-full" />
    <Skeleton className="h-[120px] w-full" />
  </div>
);

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="text-center py-8 border rounded-lg bg-gray-50">
    <p className="text-gray-500">{message}</p>
  </div>
);
