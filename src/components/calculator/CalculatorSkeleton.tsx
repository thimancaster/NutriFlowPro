
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CalculatorSkeletonProps {
  showMacros?: boolean;
  showAnthropometric?: boolean;
}

const CalculatorSkeleton: React.FC<CalculatorSkeletonProps> = ({ 
  showMacros = true,
  showAnthropometric = false 
}) => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Anthropometric Results Skeleton */}
      {showAnthropometric && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-4 w-20 mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  <Skeleton className="h-3 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Results Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-20 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Macronutrients Skeleton */}
          {showMacros && (
            <div>
              <Skeleton className="h-5 w-56 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Skeleton className="h-4 w-20 mx-auto mb-2" />
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorSkeleton;
