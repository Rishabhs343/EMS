import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeForm } from '@/components/employee-form';

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Edit Employee
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Update employee information
        </p>
      </div>

      <EmployeeForm employee={employee} />
    </div>
  );
}
