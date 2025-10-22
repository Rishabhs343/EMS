import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-6 gap-4 p-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div>Name</div>
                <div>Department</div>
                <div>Position</div>
                <div>Join Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className="grid grid-cols-6 gap-4 p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
