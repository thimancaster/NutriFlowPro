
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Patient } from '@/types';

interface ReportOptions {
  type: 'complete' | 'evolution' | 'goals' | 'custom';
  period: 'last_month' | 'last_3_months' | 'last_6_months' | 'all_time' | 'custom';
  includeCharts: boolean;
  includeGoals: boolean;
  includeAlerts: boolean;
  includeRecommendations: boolean;
  includeNotes: boolean;
}

interface PatientReportData {
  patient: Patient;
  calculations: any[];
  options: ReportOptions;
}

export const generatePatientReportPDF = async (data: PatientReportData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const { patient, calculations, options } = data;
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Nutricional', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  
  yPosition += 20;

  // Patient Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Paciente', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${patient.name}`, margin, yPosition);
  yPosition += 6;
  
  if (patient.email) {
    doc.text(`E-mail: ${patient.email}`, margin, yPosition);
    yPosition += 6;
  }
  
  if (patient.phone) {
    doc.text(`Telefone: ${patient.phone}`, margin, yPosition);
    yPosition += 6;
  }
  
  if (patient.birth_date) {
    const age = Math.floor((new Date().getTime() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    doc.text(`Idade: ${age} anos`, margin, yPosition);
    yPosition += 6;
  }
  
  if (patient.gender) {
    const gender = patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro';
    doc.text(`Sexo: ${gender}`, margin, yPosition);
    yPosition += 6;
  }
  
  yPosition += 10;

  // Evolution Summary if calculations exist
  if (calculations && calculations.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo da Evolução', margin, yPosition);
    yPosition += 10;
    
    const latest = calculations[0];
    const oldest = calculations[calculations.length - 1];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${new Date(oldest.calculation_date).toLocaleDateString('pt-BR')} a ${new Date(latest.calculation_date).toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 6;
    
    doc.text(`Total de avaliações: ${calculations.length}`, margin, yPosition);
    yPosition += 6;
    
    if (calculations.length >= 2) {
      const weightChange = latest.weight - oldest.weight;
      doc.text(`Variação de peso: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`, margin, yPosition);
      yPosition += 6;
    }
    
    doc.text(`Peso atual: ${latest.weight} kg`, margin, yPosition);
    yPosition += 6;
    doc.text(`TMB atual: ${latest.tmb} kcal`, margin, yPosition);
    yPosition += 6;
    doc.text(`VET atual: ${latest.vet} kcal`, margin, yPosition);
    yPosition += 10;
  }

  // Calculations Table
  if (calculations && calculations.length > 0) {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Histórico de Avaliações', margin, yPosition);
    yPosition += 10;
    
    const tableData = calculations.map(calc => [
      new Date(calc.calculation_date).toLocaleDateString('pt-BR'),
      `${calc.weight} kg`,
      `${calc.height} cm`,
      `${calc.tmb} kcal`,
      `${calc.vet} kcal`,
      `${calc.protein_g}g`,
      `${calc.carbs_g}g`,
      `${calc.fat_g}g`
    ]);
    
    (doc as any).autoTable({
      head: [['Data', 'Peso', 'Altura', 'TMB', 'VET', 'Proteína', 'Carboidrato', 'Gordura']],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: margin, right: margin }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Goals Section
  if (options.includeGoals && patient.goals && typeof patient.goals === 'object') {
    const goals = (patient.goals as any).customGoals || [];
    
    if (goals.length > 0) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Metas do Paciente', margin, yPosition);
      yPosition += 10;
      
      goals.forEach((goal: any) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${goal.name}`, margin, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`  Valor alvo: ${goal.target_value} ${goal.unit}`, margin + 5, yPosition);
        yPosition += 5;
        
        doc.text(`  Status: ${goal.status === 'active' ? 'Ativa' : goal.status === 'achieved' ? 'Alcançada' : 'Pausada'}`, margin + 5, yPosition);
        yPosition += 5;
        
        if (goal.target_date) {
          doc.text(`  Data alvo: ${new Date(goal.target_date).toLocaleDateString('pt-BR')}`, margin + 5, yPosition);
          yPosition += 5;
        }
        
        if (goal.notes) {
          doc.text(`  Observações: ${goal.notes}`, margin + 5, yPosition);
          yPosition += 5;
        }
        
        yPosition += 5;
      });
    }
  }

  // Notes Section
  if (options.includeNotes && patient.notes) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Anotações', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Split notes into lines that fit the page width
    const lines = doc.splitTextToSize(patient.notes, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
  }

  // Recommendations Section
  if (options.includeRecommendations) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recomendações', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const recommendations = [
      '• Manter acompanhamento nutricional regular',
      '• Seguir as orientações alimentares prescritas',
      '• Praticar atividade física conforme orientação médica',
      '• Manter hidratação adequada (2-3L de água por dia)',
      '• Realizar exames de controle quando solicitados'
    ];
    
    recommendations.forEach(rec => {
      doc.text(rec, margin, yPosition);
      yPosition += 6;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, doc.internal.pageSize.height - 10);
  }

  return doc;
};
