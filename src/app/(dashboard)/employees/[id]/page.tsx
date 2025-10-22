import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeDetail } from '@/components/employee-detail';

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    notFound();
  }

  return <EmployeeDetail employee={employee} />;
}
