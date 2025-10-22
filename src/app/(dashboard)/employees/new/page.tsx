import { EmployeeForm } from '@/components/employee-form';

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Add New Employee
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Create a new employee record
        </p>
      </div>

      <EmployeeForm />
    </div>
  );
}
