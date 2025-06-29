
import { useState, useEffect, useMemo } from 'react';
import { useAppointmentQuery } from './useAppointmentQuery';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

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

export const useAppointmentAnalytics = (dateRange?: { start: Date; end: Date }) => {
  const { data: appointments = [], isLoading } = useAppointmentQuery();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const filteredAppointments = useMemo(() => {
    if (!dateRange) return appointments;
    
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date);
      return isWithinInterval(appointmentDate, dateRange);
    });
  }, [appointments, dateRange]);

  const metrics: AppointmentMetrics = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(a => a.status === 'completed').length;
    const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
    const noShow = filteredAppointments.filter(a => a.status === 'no_show').length;

    // Status distribution
    const statusCounts = filteredAppointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<AppointmentStatus, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as AppointmentStatus,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));

    // Peak days analysis
    const dayCount = filteredAppointments.reduce((acc, appointment) => {
      const day = format(parseISO(appointment.date), 'EEEE');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const peakDays = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([day]) => day);

    // Popular times analysis
    const timeCount = filteredAppointments
      .filter(a => a.start_time)
      .reduce((acc, appointment) => {
        const hour = format(parseISO(appointment.start_time!), 'HH:00');
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const popularTimes = Object.entries(timeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthAppointments = appointments.filter(appointment => {
        const appointmentDate = parseISO(appointment.date);
        return isWithinInterval(appointmentDate, { start: monthStart, end: monthEnd });
      });

      monthlyTrend.push({
        month: format(date, 'MMM yyyy'),
        count: monthAppointments.length
      });
    }

    return {
      totalAppointments: total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      noShowAppointments: noShow,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancelationRate: total > 0 ? (cancelled / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
      averagePerDay: total > 0 ? total / 30 : 0, // Assuming 30-day period
      peakDays,
      popularTimes,
      monthlyTrend,
      statusDistribution
    };
  }, [filteredAppointments, appointments]);

  return {
    metrics,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    appointments: filteredAppointments
  };
};
