'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, UserCheck, UserX, ArrowLeft, Calendar, Mail, Building, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  dateOfJoining: string;
  status: 'ACTIVE' | 'RESIGNED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: any;
  createdAt: string;
  actor?: {
    email: string;
  };
}

interface EmployeeDetailProps {
  employee: Employee;
}

export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch activity log
  const { data: activityData } = useQuery<{
    activities: ActivityLog[];
    pagination: any;
  }>({
    queryKey: ['employee-activity', employee.id],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employee.id}/activity`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }
      return response.json();
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (status: 'ACTIVE' | 'RESIGNED') => {
      const response = await fetch(`/api/employees/${employee.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-activity', employee.id] });
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
      router.push('/employees');
    },
    onError: () => {
      toast.error('Failed to delete employee');
    },
  });

  const handleStatusToggle = () => {
    const newStatus = employee.status === 'ACTIVE' ? 'RESIGNED' : 'ACTIVE';
    toggleStatusMutation.mutate(newStatus);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return '👤';
      case 'UPDATED':
        return '✏️';
      case 'STATUS_CHANGED':
        return '🔄';
      case 'DELETED':
        return '🗑️';
      case 'IMPORTED':
        return '📥';
      default:
        return '📝';
    }
  };

  const getActionDescription = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'CREATED':
        return 'Employee record created';
      case 'UPDATED':
        return 'Employee information updated';
      case 'STATUS_CHANGED':
        return `Status changed from ${activity.details.previousStatus} to ${activity.details.newStatus}`;
      case 'DELETED':
        return 'Employee record deleted';
      case 'IMPORTED':
        return 'Employee imported from CSV';
      default:
        return 'Activity logged';
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {employee.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Employee Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/employees/${employee.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              onClick={handleStatusToggle}
              disabled={toggleStatusMutation.isPending}
            >
              {employee.status === 'ACTIVE' ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Mark as Resigned
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark as Active
                </>
              )}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Employee Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">{employee.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100">{employee.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Department
                  </label>
                  <p className="text-slate-900 dark:text-slate-100">{employee.department}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Position
                  </label>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100">{employee.position}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Date of Joining
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100">
                      {format(new Date(employee.dateOfJoining), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Status
                  </label>
                  <Badge
                    variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={
                      employee.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }
                  >
                    {employee.status}
                  </Badge>
                </div>
              </div>
              {employee.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Notes
                    </label>
                    <p className="text-slate-900 dark:text-slate-100">{employee.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData?.activities.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                  No activity recorded yet
                </p>
              ) : (
                <div className="space-y-4">
                  {activityData?.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="text-2xl">{getActionIcon(activity.action)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {getActionDescription(activity)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(activity.createdAt), 'MMM dd, yyyy • h:mm a')}
                          </p>
                          {activity.actor && (
                            <>
                              <span className="text-xs text-slate-400">•</span>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                by {activity.actor.email}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.floor((new Date().getTime() - new Date(employee.dateOfJoining).getTime()) / (1000 * 60 * 60 * 24 * 365))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Years with company</p>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {activityData?.activities.length || 0}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Activity entries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to delete <strong>{employee.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
