'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { positionSchema, type PositionData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export function PositionsManager() {
  const [positions, setPositions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PositionData>({
    resolver: zodResolver(positionSchema),
  });

  // Load positions on mount
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const response = await fetch('/api/settings/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const onSubmit = async (data: PositionData) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/settings/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Position added successfully!');
        reset();
        loadPositions(); // Reload the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add position');
      }
    } catch (error) {
      toast.error('Failed to add position');
    } finally {
      setIsAdding(false);
    }
  };

  const removePosition = async (positionName: string) => {
    if (!confirm(`Are you sure you want to remove "${positionName}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/settings/positions?name=${encodeURIComponent(positionName)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Position removed successfully!');
        loadPositions(); // Reload the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove position');
      }
    } catch (error) {
      toast.error('Failed to remove position');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          placeholder="Add new position"
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
        {positions.map((position) => (
          <div
            key={position}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <span className="font-medium">{position}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {positions.filter(p => p === position).length} employees
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removePosition(position)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {positions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No positions found. Add some positions to categorize your employees.
          </p>
        )}
      </div>
    </div>
  );
}
