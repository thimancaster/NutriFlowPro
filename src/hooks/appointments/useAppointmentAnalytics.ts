import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AppointmentStatus } from '@/types/appointment';
import { format, parseISO, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AppointmentMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
  cancelationRate: number;
  noShowRate: number;
  averagePerDay: number;
  peakDays: string[];
  popularTimes: string[];
  monthlyTrend: { month: string; count: number }[];
  statusDistribution: { status: AppointmentStatus; count: number; percentage: number }[];
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/**
 * Hook to fetch and calculate appointment analytics
 * Uses React Query for efficient caching and automatic refetching
 */
export const useAppointmentAnalytics = (dateRange: { start: Date; end: Date }) => {
  const { user } = useAuth();

  // Memoize the date range to prevent unnecessary refetches
  const memoizedDateRange = useMemo(
    () => ({
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    }),
    [dateRange.start.toISOString(), dateRange.end.toISOString()]
  );

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointment-analytics', user?.id, memoizedDateRange],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', memoizedDateRange.start)
        .lte('date', memoizedDateRange.end)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const metrics = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        completionRate: 0,
        cancelationRate: 0,
        noShowRate: 0,
        averagePerDay: 0,
        peakDays: [],
        popularTimes: [],
        monthlyTrend: [],
        statusDistribution: [],
      };
    }

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    const noShowAppointments = appointments.filter(a => a.status === 'no_show').length;

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const cancelationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    // Calculate status distribution
    const statusCounts = appointments.reduce((acc: Record<string, number>, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as AppointmentStatus,
      count: Number(count),
      percentage: totalAppointments > 0 ? (Number(count) / totalAppointments) * 100 : 0,
    }));

    // Calculate average per day
    const daysDiff = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const averagePerDay = daysDiff > 0 ? totalAppointments / daysDiff : 0;

    // Calculate peak days (most common day of week)
    const dayCount = appointments.reduce((acc: Record<number, number>, appointment) => {
      const day = getDay(parseISO(appointment.date));
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const peakDays = Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => DAYS_OF_WEEK[parseInt(day)]);

    // Calculate popular times (most common appointment hours)
    const timeCount = appointments.reduce((acc: Record<string, number>, appointment) => {
      if (appointment.start_time) {
        try {
          const hour = format(parseISO(appointment.start_time), 'HH:00');
          acc[hour] = (acc[hour] || 0) + 1;
        } catch (error) {
          // Ignore invalid dates
        }
      }
      return acc;
    }, {});

    const popularTimes = Object.entries(timeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);

    // Calculate monthly trend
    const monthCount = appointments.reduce((acc: Record<string, number>, appointment) => {
      try {
        const month = format(parseISO(appointment.date), 'MMM/yy', { locale: ptBR });
        acc[month] = (acc[month] || 0) + 1;
      } catch (error) {
        // Ignore invalid dates
      }
      return acc;
    }, {});

    const monthlyTrend = Object.entries(monthCount).map(([month, count]) => ({
      month,
      count: Number(count),
    }));

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      completionRate,
      cancelationRate,
      noShowRate,
      averagePerDay,
      peakDays,
      popularTimes,
      monthlyTrend,
      statusDistribution,
    };
  }, [appointments, dateRange]);

  return { metrics, isLoading };
};
