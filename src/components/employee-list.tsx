'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
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

interface EmployeesResponse {
  employees: Employee[];
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

export function EmployeeList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'all');
  const [position, setPosition] = useState(searchParams.get('position') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (department && department !== 'all') params.set('department', department);
    if (position && position !== 'all') params.set('position', position);
    if (status && status !== 'all') params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (page > 1) params.set('page', page.toString());

    const newUrl = `/employees${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl);
  }, [search, department, position, status, from, to, page, router]);

  // Fetch employees
  const { data, isLoading, error } = useQuery<EmployeesResponse>({
    queryKey: ['employees', { search, department, position, status, from, to, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (department && department !== 'all') params.set('department', department);
      if (position && position !== 'all') params.set('position', position);
      if (status && status !== 'all') params.set('status', status);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('page', page.toString());
      params.set('size', '20');

      const response = await fetch(`/api/employees?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return response.json();
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'RESIGNED' }) => {
      const response = await fetch(`/api/employees/${id}/status`, {
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
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/employees/${id}`, {
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
    },
    onError: () => {
      toast.error('Failed to delete employee');
    },
  });

  const handleStatusToggle = (employee: Employee) => {
    const newStatus = employee.status === 'ACTIVE' ? 'RESIGNED' : 'ACTIVE';
    toggleStatusMutation.mutate({ id: employee.id, status: newStatus });
  };

  const handleDelete = (employee: Employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      deleteMutation.mutate(employee.id);
    }
  };

  const departments = ['Engineering', 'HR', 'Finance', 'Sales'];
  const positions = ['Software Engineer', 'Senior Software Engineer', 'DevOps Engineer', 'Frontend Developer', 'Backend Developer', 'HR Manager', 'Recruiter', 'Finance Manager', 'Accountant', 'Sales Director', 'Sales Representative'];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load employees. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Employee Directory</span>
            <Button onClick={() => router.push('/employees/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="RESIGNED">Resigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                          <div className="space-y-1">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-slate-500 dark:text-slate-400">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No employees found</p>
                        <p className="text-sm">
                          {search || department || position || status
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first employee'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {employee.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {employee.department}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {employee.position}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {format(new Date(employee.dateOfJoining), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/employees/${employee.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/employees/${employee.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusToggle(employee)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              {employee.status === 'ACTIVE' ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Mark as Resigned
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Mark as Active
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(employee)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total} employees
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === data.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
