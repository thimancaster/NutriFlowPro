/**
 * PDF EXPORT UTILITIES
 * Handles PDF generation for reports using jsPDF and jspdf-autotable
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CalculationHistoryRecord, PatientEvolutionData } from '@/services/reportsService';

// Re-export meal plan PDF generation from existing implementation
export { generateMealPlanPDF } from './pdf/pdfExport';

/**
 * Generate PDF report for a single patient's evolution
 */
export function generatePatientEvolutionPDF(
  patientData: PatientEvolutionData,
  nutritionistName?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Evolução Nutricional', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
  
  if (nutritionistName) {
    yPosition += 5;
    doc.text(`Nutricionista: ${nutritionistName}`, pageWidth / 2, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Patient Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Paciente', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${patientData.patient.name}`, 14, yPosition);
  
  yPosition += 5;
  const firstCalc = patientData.calculations[0];
  const lastCalc = patientData.calculations[patientData.calculations.length - 1];
  doc.text(`Total de Consultas: ${patientData.calculations.length}`, 14, yPosition);
  
  yPosition += 5;
  doc.text(
    `Período: ${format(new Date(firstCalc.calculation_date), 'dd/MM/yyyy')} - ${format(new Date(lastCalc.calculation_date), 'dd/MM/yyyy')}`,
    14,
    yPosition
  );

  yPosition += 12;

  // Evolution Summary
  if (patientData.calculations.length >= 2) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo da Evolução', 14, yPosition);
    
    yPosition += 7;

    const calculateChange = (initial: number, final: number) => {
      if (initial === 0) return 0;
      return ((final - initial) / initial) * 100;
    };

    const weightChange = calculateChange(firstCalc.weight, lastCalc.weight);
    const tmbChange = calculateChange(firstCalc.tmb, lastCalc.tmb);
    const getChange = calculateChange(firstCalc.get, lastCalc.get);
    const vetChange = calculateChange(firstCalc.vet, lastCalc.vet);

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Inicial', 'Atual', 'Variação']],
      body: [
        ['Peso (kg)', firstCalc.weight.toFixed(1), lastCalc.weight.toFixed(1), `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}%`],
        ['TMB (kcal)', firstCalc.tmb.toFixed(0), lastCalc.tmb.toFixed(0), `${tmbChange > 0 ? '+' : ''}${tmbChange.toFixed(1)}%`],
        ['GET (kcal)', firstCalc.get.toFixed(0), lastCalc.get.toFixed(0), `${getChange > 0 ? '+' : ''}${getChange.toFixed(1)}%`],
        ['VET (kcal)', firstCalc.vet.toFixed(0), lastCalc.vet.toFixed(0), `${vetChange > 0 ? '+' : ''}${vetChange.toFixed(1)}%`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Detailed History Table
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico Detalhado', 14, yPosition);
  
  yPosition += 7;

  autoTable(doc, {
    startY: yPosition,
    head: [['Consulta', 'Data', 'Peso', 'TMB', 'GET', 'VET', 'PTN (g)', 'CHO (g)', 'LIP (g)']],
    body: patientData.calculations.map(calc => [
      `#${calc.consultation_number}`,
      format(new Date(calc.calculation_date), 'dd/MM/yy'),
      `${calc.weight.toFixed(1)} kg`,
      `${calc.tmb.toFixed(0)}`,
      `${calc.get.toFixed(0)}`,
      `${calc.vet.toFixed(0)}`,
      calc.protein_g.toFixed(0),
      calc.carbs_g.toFixed(0),
      calc.fat_g.toFixed(0)
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const filename = `Evolucao_${patientData.patient.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
}

/**
 * Generate comparative PDF report for multiple patients
 */
export function generateComparativePDF(
  patientsData: PatientEvolutionData[],
  nutritionistName?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Comparativo de Pacientes', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
  
  if (nutritionistName) {
    yPosition += 5;
    doc.text(`Nutricionista: ${nutritionistName}`, pageWidth / 2, yPosition, { align: 'center' });
  }

  yPosition += 15;

  // Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Geral', 14, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Pacientes: ${patientsData.length}`, 14, yPosition);
  
  yPosition += 5;
  const totalConsultations = patientsData.reduce((sum, p) => sum + p.calculations.length, 0);
  doc.text(`Total de Consultas: ${totalConsultations}`, 14, yPosition);

  yPosition += 12;

  // Patients Table
  autoTable(doc, {
    startY: yPosition,
    head: [['Paciente', 'Consultas', 'Última Consulta', 'Peso Atual', 'TMB', 'VET']],
    body: patientsData.map(pd => {
      const lastCalc = pd.calculations[pd.calculations.length - 1];
      return [
        pd.patient.name,
        pd.calculations.length.toString(),
        format(new Date(lastCalc.calculation_date), 'dd/MM/yyyy'),
        `${lastCalc.weight.toFixed(1)} kg`,
        `${lastCalc.tmb.toFixed(0)} kcal`,
        `${lastCalc.vet.toFixed(0)} kcal`
      ];
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const filename = `Relatorio_Comparativo_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
}
