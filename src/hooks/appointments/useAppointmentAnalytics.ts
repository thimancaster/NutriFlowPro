
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentStatus } from '@/types/appointment';

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

export const useAppointmentAnalytics = (dateRange: { start: Date; end: Date }) => {
  const [metrics, setMetrics] = useState<AppointmentMetrics>({
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
    statusDistribution: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      
      try {
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('*')
          .gte('date', dateRange.start.toISOString())
          .lte('date', dateRange.end.toISOString());

        if (error) {
          console.error('Error fetching appointments:', error);
          return;
        }

        const totalAppointments = appointments?.length || 0;
        const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
        const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
        const noShowAppointments = appointments?.filter(a => a.status === 'no_show').length || 0;

        const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
        const cancelationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;
        const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

        const statusCounts = appointments?.reduce((acc: Record<string, number>, appointment) => {
          acc[appointment.status] = (acc[appointment.status] || 0) + 1;
          return acc;
        }, {}) || {};

        const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
          status: status as AppointmentStatus,
          count: Number(count),
          percentage: totalAppointments > 0 ? (Number(count) / totalAppointments) * 100 : 0
        }));

        const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        const averagePerDay = daysDiff > 0 ? totalAppointments / daysDiff : 0;

        setMetrics({
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          completionRate,
          cancelationRate,
          noShowRate,
          averagePerDay,
          peakDays: ['Segunda', 'Terça'], // Mock data
          popularTimes: ['09:00', '14:00'], // Mock data
          monthlyTrend: [], // Mock data
          statusDistribution
        });
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange]);

  return { metrics, isLoading };
};
