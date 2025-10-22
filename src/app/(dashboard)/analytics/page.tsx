import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { BarChart3, Users, UserCheck, UserX, TrendingUp, Calendar } from 'lucide-react';

export default async function AnalyticsPage() {
  const user = await requireAuth();

  // Get analytics data
  const [
    totalEmployees,
    activeEmployees,
    resignedEmployees,
    employeesByDepartment,
    employeesByMonth,
    recentHires,
  ] = await Promise.all([
    // Total employees
    prisma.employee.count(),
    
    // Active employees
    prisma.employee.count({
      where: { status: 'ACTIVE' },
    }),
    
    // Resigned employees
    prisma.employee.count({
      where: { status: 'RESIGNED' },
    }),
    
    // Employees by department
    prisma.employee.groupBy({
      by: ['department'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    }),
    
    // Employees hired in the last 12 months
    prisma.employee.groupBy({
      by: ['dateOfJoining'],
      _count: {
        id: true,
      },
      where: {
        dateOfJoining: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
      orderBy: {
        dateOfJoining: 'desc',
      },
    }),
    
    // Recent hires (last 30 days)
    prisma.employee.findMany({
      where: {
        dateOfJoining: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      orderBy: {
        dateOfJoining: 'desc',
      },
      take: 5,
    }),
  ]);

  const resignationRate = totalEmployees > 0 ? (resignedEmployees / totalEmployees) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your employee data and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              All employees in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Currently employed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resigned</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{resignedEmployees}</div>
            <p className="text-xs text-muted-foreground">
              No longer with company
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resignation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resignationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Historical turnover rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
            <CardDescription>
              Distribution of employees across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeesByDepartment.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    <span className="text-sm font-medium">
                      {dept.department || 'No Department'}
                    </span>
                  </div>
                  <div className="text-sm font-bold">{dept._count.id}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Hires</CardTitle>
            <CardDescription>
              Employees hired in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentHires.length > 0 ? (
                recentHires.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.department} • {employee.position}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(employee.dateOfJoining).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent hires</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Hiring Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Trends</CardTitle>
          <CardDescription>
            New employees hired over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeesByMonth.length > 0 ? (
              <div className="grid gap-2">
                {employeesByMonth.slice(0, 6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(month.dateOfJoining).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{
                            width: `${(month._count.id / Math.max(...employeesByMonth.map(m => m._count.id))) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {month._count.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hiring data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
