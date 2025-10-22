'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  dateOfJoining: string;
  status: 'ACTIVE' | 'RESIGNED';
  notes?: string;
}

interface EmployeeFormProps {
  employee?: Employee;
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          name: employee.name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          dateOfJoining: new Date(employee.dateOfJoining).toISOString().split('T')[0], // Convert to YYYY-MM-DD format
          status: employee.status,
          notes: employee.notes || '',
        }
      : {
          status: 'ACTIVE',
        },
  });

  const watchedStatus = watch('status');

  const departments = ['Engineering', 'HR', 'Finance', 'Sales'];
  const positions = [
    'Software Engineer',
    'Senior Software Engineer',
    'DevOps Engineer',
    'Frontend Developer',
    'Backend Developer',
    'HR Manager',
    'Recruiter',
    'Finance Manager',
    'Accountant',
    'Sales Director',
    'Sales Representative',
  ];

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees';
      const method = employee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(employee ? 'Employee updated successfully!' : 'Employee created successfully!');
        router.push('/employees');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || 'An error occurred');
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowLeft
              className="h-5 w-5 cursor-pointer"
              onClick={() => router.back()}
            />
            <span>{employee ? 'Edit Employee' : 'New Employee'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name')}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('department')}
                  onValueChange={(value) => setValue('department', value)}
                >
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">
                  Position <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('position')}
                  onValueChange={(value) => setValue('position', value)}
                >
                  <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">
                  Date of Joining <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register('dateOfJoining')}
                  className={errors.dateOfJoining ? 'border-red-500' : ''}
                />
                {errors.dateOfJoining && (
                  <p className="text-sm text-red-500">{errors.dateOfJoining.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(value) => setValue('status', value as 'ACTIVE' | 'RESIGNED')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="RESIGNED">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the employee..."
                {...register('notes')}
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? employee
                    ? 'Updating...'
                    : 'Creating...'
                  : employee
                  ? 'Update Employee'
                  : 'Create Employee'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
