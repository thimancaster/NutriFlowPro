import { useMemo } from 'react';
import { AppointmentStatus } from '@/types/appointment';

interface AppointmentMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
  cancelationRate: number;
  noShowRate: number;
  averageAppointmentsPerDay: number;
  peakDays: string[];
  peakHours: string[];
  statusDistribution: Array<{
    status: AppointmentStatus;
    count: number;
    percentage: number;
  }>;
}

export const useAppointmentAnalytics = (appointments: any[]) => {
  const metrics = useMemo((): AppointmentMetrics => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShow = appointments.filter(a => a.status === 'no_show').length;

    const completionRate = total > 0 ? completed / total * 100 : 0;
    const cancelationRate = total > 0 ? cancelled / total * 100 : 0;
    const noShowRate = total > 0 ? noShow / total * 100 : 0;

    // Status distribution with proper type casting
    const statusDistribution = [
      { status: 'scheduled' as AppointmentStatus, count: Number(appointments.filter(a => a.status === 'scheduled').length), percentage: Number(appointments.filter(a => a.status === 'scheduled').length) / total * 100 },
      { status: 'completed' as AppointmentStatus, count: completed, percentage: completed / total * 100 },
      { status: 'cancelled' as AppointmentStatus, count: cancelled, percentage: cancelled / total * 100 },
      { status: 'no_show' as AppointmentStatus, count: noShow, percentage: noShow / total * 100 }
    ];

    return {
      totalAppointments: total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      noShowAppointments: noShow,
      completionRate: completionRate,
      cancelationRate: cancelationRate,
      noShowRate: noShowRate,
      averageAppointmentsPerDay: 0,
      peakDays: [],
      peakHours: [],
      statusDistribution
    };
  }, [appointments]);

  return metrics;
};
