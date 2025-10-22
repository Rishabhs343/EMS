'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSettingsSchema, type ProfileSettingsData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSettingsFormProps {
  user: {
    email: string;
    role: string;
  };
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileSettingsData>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ProfileSettingsData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        reset(); // Clear password fields
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'VIEWER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-email">Email Address</Label>
        <Input
          id="user-email"
          type="email"
          value={user.email}
          disabled
          className="bg-slate-50 dark:bg-slate-800"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-role">Role</Label>
        <div className="flex items-center gap-2">
          <Badge className={getRoleColor(user.role)}>
            {user.role}
          </Badge>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="change-password">Change Password</Label>
          <Input
            id="change-password"
            type="password"
            placeholder="Enter new password"
            {...register('password')}
            className={errors.password && 'border-red-500'}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm new password"
            {...register('confirmPassword')}
            className={errors.confirmPassword && 'border-red-500'}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
}
