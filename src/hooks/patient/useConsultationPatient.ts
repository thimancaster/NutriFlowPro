
// Update to handle the correct patient response type
const fetchPatientById = async (patientId: string) => {
  try {
    const result = await PatientService.getPatient(patientId);
    
    if ('success' in result && result.success) {
      setPatient(result.data);
    } else if ('error' in result) {
      console.error("Failed to load patient:", result.error);
      toast.error({
        title: "Erro ao carregar paciente",
        description: "Não foi possível carregar os dados do paciente."
      });
    }
  } catch (error: any) {
    console.error("Error loading patient:", error);
  }
};
