namespace clinic_management_api.DTOs;

public record CdssRequest(int Age, string Gender, List<string> Symptoms, List<string> History, Dictionary<string, string>? Vitals);
public record DiseaseSuggestion(string Name, decimal Confidence);
public record CdssResponse(List<DiseaseSuggestion> PossibleDiseases, List<string> RecommendedTests, List<string> Warnings);
public record CdssEvaluationResponse(string Disclaimer, CdssResponse Result);
