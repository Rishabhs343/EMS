'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSettingsSchema, type OrganizationSettingsData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationSettingsFormProps {
  initialData?: {
    name: string;
    email: string;
    address: string;
  };
}

export function OrganizationSettingsForm({ initialData }: OrganizationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationSettingsData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: initialData || {
      name: 'Employee Management System',
      email: 'admin@company.com',
      address: '',
    },
  });

  // Load initial data when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/organization');
        if (response.ok) {
          const data = await response.json();
          reset(data);
        }
      } catch (error) {
        console.error('Failed to load organization settings:', error);
      }
    };

    loadSettings();
  }, [reset]);

  const onSubmit = async (data: OrganizationSettingsData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Organization settings saved successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save organization settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <Input
          id="org-name"
          placeholder="Your Company Name"
          {...register('name')}
          className={errors.name && 'border-red-500'}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="org-email">Contact Email</Label>
        <Input
          id="org-email"
          type="email"
          placeholder="contact@company.com"
          {...register('email')}
          className={errors.email && 'border-red-500'}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="org-address">Address</Label>
        <Input
          id="org-address"
          placeholder="123 Business St, City, State 12345"
          {...register('address')}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        <Save className="mr-2 h-4 w-4" />
        {isLoading ? 'Saving...' : 'Save Organization Settings'}
      </Button>
    </form>
  );
}
