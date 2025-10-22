import { Suspense } from 'react';
import { EmployeeList } from '@/components/employee-list';
import { EmployeeListSkeleton } from '@/components/employee-list-skeleton';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Employees
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your organization's employee records
        </p>
      </div>

      <Suspense fallback={<EmployeeListSkeleton />}>
        <EmployeeList />
      </Suspense>
    </div>
  );
}
