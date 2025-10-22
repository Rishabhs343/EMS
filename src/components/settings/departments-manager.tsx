'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, type DepartmentData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export function DepartmentsManager() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartmentData>({
    resolver: zodResolver(departmentSchema),
  });

  // Load departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/settings/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const onSubmit = async (data: DepartmentData) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/settings/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Department added successfully!');
        reset();
        loadDepartments(); // Reload the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add department');
      }
    } catch (error) {
      toast.error('Failed to add department');
    } finally {
      setIsAdding(false);
    }
  };

  const removeDepartment = async (departmentName: string) => {
    if (!confirm(`Are you sure you want to remove "${departmentName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/settings/departments?name=${encodeURIComponent(departmentName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Department removed successfully!');
        loadDepartments(); // Reload the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove department');
      }
    } catch (error) {
      toast.error('Failed to remove department');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          placeholder="Add new department"
          className="flex-1"
          {...register('name')}
        />
        <Button type="submit" size="sm" disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </form>
      {errors.name && (
        <p className="text-sm text-red-500">{errors.name.message}</p>
      )}
      
      <div className="grid gap-2">
        {departments.map((dept) => (
          <div
            key={dept}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <span className="font-medium">{dept}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {departments.filter(d => d === dept).length} employees
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeDepartment(dept)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No departments found. Add some departments to organize your employees.
          </p>
        )}
      </div>
    </div>
  );
}
