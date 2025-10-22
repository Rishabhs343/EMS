import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Settings, Building2, Users } from 'lucide-react';
import { OrganizationSettingsForm } from '@/components/settings/organization-settings-form';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { DepartmentsManager } from '@/components/settings/departments-manager';
import { PositionsManager } from '@/components/settings/positions-manager';

export default async function SettingsPage() {
  const user = await requireAuth();

  // Get system statistics
  const [totalEmployees, totalUsers] = await Promise.all([
    prisma.employee.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your organization settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Profile
            </CardTitle>
            <CardDescription>
              Update your organization information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationSettingsForm />
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>
              Manage your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSettingsForm user={user} />
          </CardContent>
        </Card>
      </div>

      {/* Departments Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Departments
          </CardTitle>
          <CardDescription>
            Manage available departments for employee records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentsManager />
        </CardContent>
      </Card>

      {/* Positions Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Positions
          </CardTitle>
          <CardDescription>
            Manage available positions for employee records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PositionsManager />
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Technical details about your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Application Version</Label>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Database Status</Label>
              <p className="text-sm text-green-600">Connected</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Employees</Label>
              <p className="text-sm text-muted-foreground">
                {totalEmployees}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Users</Label>
              <p className="text-sm text-muted-foreground">
                {totalUsers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
