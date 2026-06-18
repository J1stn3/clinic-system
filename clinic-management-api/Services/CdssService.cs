using System.Text.Json;
using clinic_management_api.Data;
using clinic_management_api.DTOs;
using clinic_management_api.Helpers;
using clinic_management_api.Models;
using Microsoft.EntityFrameworkCore;

namespace clinic_management_api.Services;

public class CdssService(ApplicationDbContext db, ICurrentUserService currentUser) : ICdssService
{
    private static readonly Dictionary<string, (string Disease, decimal Confidence)[]> SymptomRules = new(StringComparer.OrdinalIgnoreCase)
    {
        ["fever"] = [("Influenza", 0.78m), ("COVID-19", 0.65m), ("Dengue", 0.45m)],
        ["cough"] = [("Influenza", 0.72m), ("Pneumonia", 0.60m), ("Bronchitis", 0.50m)],
        ["fatigue"] = [("Influenza", 0.55m), ("Anemia", 0.40m), ("Hypothyroidism", 0.35m)],
        ["headache"] = [("Migraine", 0.65m), ("Hypertension", 0.45m), ("Tension Headache", 0.55m)],
        ["nausea"] = [("Gastroenteritis", 0.60m), ("Food Poisoning", 0.50m)],
        ["chest pain"] = [("Angina", 0.70m), ("GERD", 0.40m), ("Anxiety", 0.35m)],
        ["shortness of breath"] = [("Asthma", 0.65m), ("Pneumonia", 0.60m), ("Heart Failure", 0.45m)],
        ["sore throat"] = [("Strep Throat", 0.55m), ("Pharyngitis", 0.50m)],
        ["diarrhea"] = [("Gastroenteritis", 0.70m), ("IBS", 0.35m)],
        ["rash"] = [("Allergic Reaction", 0.65m), ("Dermatitis", 0.45m)],
    };

    private static readonly Dictionary<string, string[]> DiseaseTests = new()
    {
        ["Influenza"] = ["CBC", "COVID Test"],
        ["COVID-19"] = ["COVID Test", "CBC"],
        ["Pneumonia"] = ["Chest X-Ray", "CBC"],
        ["Dengue"] = ["CBC", "Dengue NS1"],
        ["Angina"] = ["ECG", "Troponin"],
        ["Gastroenteritis"] = ["Stool Analysis", "CBC"],
    };

    private static readonly Dictionary<string, string[]> DrugInteractions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["amoxicillin"] = ["warfarin", "methotrexate"],
        ["paracetamol"] = ["warfarin"],
        ["ibuprofen"] = ["aspirin", "lisinopril"],
    };

    public async Task<CdssResponse> EvaluateAsync(Guid patientId, CdssRequest request)
    {
        currentUser.EnsureRole(RoleNames.Doctor);
        var doctorId = await currentUser.GetDoctorProfileIdAsync()
            ?? throw new UnauthorizedAccessException("Doctor profile not found.");

        var patient = await db.Patients
            .Include(p => p.MedicalRecords)
            .Include(p => p.Prescriptions)
            .FirstOrDefaultAsync(p => p.Id == patientId)
            ?? throw new KeyNotFoundException("Patient not found.");

        var symptoms = request.Symptoms.Select(s => s.ToLowerInvariant().Trim()).ToHashSet();
        var history = request.History.Select(h => h.ToLowerInvariant().Trim()).ToList();

        if (patient.MedicalRecords.Any())
            history.AddRange(patient.MedicalRecords.SelectMany(m => m.History.Split(',', ';')).Select(h => h.Trim().ToLowerInvariant()));

        var priorDiagnoses = await db.Consultations
            .Where(c => c.PatientId == patientId)
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .Select(c => c.Diagnosis)
            .ToListAsync();

        var diseaseScores = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);
        foreach (var symptom in symptoms)
        {
            if (!SymptomRules.TryGetValue(symptom, out var matches)) continue;
            foreach (var (disease, confidence) in matches)
            {
                diseaseScores[disease] = diseaseScores.TryGetValue(disease, out var existing)
                    ? Math.Min(0.98m, existing + confidence * 0.15m)
                    : confidence;
            }
        }

        foreach (var diagnosis in priorDiagnoses.Where(d => !string.IsNullOrWhiteSpace(d)))
        {
            diseaseScores[diagnosis] = diseaseScores.TryGetValue(diagnosis, out var s)
                ? Math.Min(0.98m, s + 0.10m)
                : 0.50m;
        }

        if (request.Age > 60 && symptoms.Contains("cough"))
            diseaseScores["Pneumonia"] = diseaseScores.GetValueOrDefault("Pneumonia") + 0.08m;

        var diseases = diseaseScores
            .Select(kv => new DiseaseSuggestion(kv.Key, Math.Round(kv.Value, 2)))
            .OrderByDescending(d => d.Confidence)
            .Take(5)
            .ToList();

        var tests = new HashSet<string>();
        foreach (var d in diseases.Select(x => x.Name))
            if (DiseaseTests.TryGetValue(d, out var t)) foreach (var item in t) tests.Add(item);
        if (symptoms.Contains("fever")) tests.Add("CBC");

        var warnings = new List<string>
        {
            "Clinical Decision Support provides recommendations only; final medical decision remains with the doctor."
        };

        var allergyKeywords = new[] { "penicillin", "amoxicillin", "sulfa", "aspirin", "latex", "peanut" };
        foreach (var keyword in allergyKeywords)
        {
            if (history.Any(h => h.Contains(keyword)))
                warnings.Add($"Allergy alert: patient history mentions '{keyword}'. Avoid related medications.");
        }

        foreach (var rx in patient.Prescriptions)
        {
            if (DrugInteractions.TryGetValue(rx.Medication.ToLowerInvariant(), out var conflicts))
            {
                foreach (var conflict in conflicts)
                    warnings.Add($"Potential interaction: {rx.Medication} may interact with {conflict}.");
            }
        }

        if (request.History.Any(h => h.Contains("hypertension", StringComparison.OrdinalIgnoreCase)))
            warnings.Add("Monitor blood pressure before initiating aggressive treatment.");

        if (request.Vitals?.TryGetValue("bp", out var bp) == true && bp.Contains("140"))
            warnings.Add("Elevated blood pressure detected in vitals. Consider cardiovascular assessment.");

        if (request.Vitals?.TryGetValue("temperature", out var temp) == true && decimal.TryParse(temp.Replace("c", "").Trim(), out var tVal) && tVal >= 38.5m)
            warnings.Add("High fever detected. Monitor hydration and oxygen saturation.");

        warnings.Add("Check patient allergy history before prescribing antibiotics.");

        var output = new CdssResponse(diseases, tests.ToList(), warnings.Distinct().ToList());

        db.AIDecisionSupportLogs.Add(new AIDecisionSupportLog
        {
            DoctorId = doctorId,
            PatientId = patientId,
            InputJson = JsonSerializer.Serialize(request),
            OutputJson = JsonSerializer.Serialize(output)
        });
        await db.SaveChangesAsync();
        return output;
    }
}
