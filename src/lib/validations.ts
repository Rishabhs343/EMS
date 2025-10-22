import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  dateOfJoining: z.string().refine((date) => {
    const joinDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return joinDate <= today;
  }, 'Join date cannot be in the future'),
  status: z.enum(['ACTIVE', 'RESIGNED']).default('ACTIVE'),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const employeeFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['ACTIVE', 'RESIGNED']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional().default('1'),
  size: z.string().optional().default('20'),
});

export const organizationSettingsSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().optional(),
});

export const profileSettingsSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(50, 'Name must be less than 50 characters'),
});

export const positionSchema = z.object({
  name: z.string().min(1, 'Position name is required').max(50, 'Name must be less than 50 characters'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type EmployeeFilters = z.infer<typeof employeeFiltersSchema>;
export type OrganizationSettingsData = z.infer<typeof organizationSettingsSchema>;
export type ProfileSettingsData = z.infer<typeof profileSettingsSchema>;
export type DepartmentData = z.infer<typeof departmentSchema>;
export type PositionData = z.infer<typeof positionSchema>;
