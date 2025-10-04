import { SYMPTOMS_DATABASE, CONDITIONS_DATABASE } from '@/data/symptoms-database';
import type { 
  Symptom, 
  Condition, 
  SelectedSymptom, 
  ConditionMatch, 
  VoiceSymptomInput,
  ExtractedSymptom,
  Language
} from '@/types/symptom-checker';

export class SymptomMatcher {
  private symptoms: Symptom[] = SYMPTOMS_DATABASE;
  private conditions: Condition[] = CONDITIONS_DATABASE;

  /**
   * Extract symptoms from voice transcript using NLP-like keyword matching
   */
  extractSymptomsFromVoice(input: VoiceSymptomInput): ExtractedSymptom[] {
    const { transcript, language, confidence } = input;
    const extractedSymptoms: ExtractedSymptom[] = [];
    
    // Convert transcript to lowercase for matching
    const lowerTranscript = transcript.toLowerCase();
    
    // Search for symptoms using voice keywords
    this.symptoms.forEach(symptom => {
      const keywords = symptom.voiceKeywords[language] || symptom.voiceKeywords.en;
      
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (lowerTranscript.includes(keywordLower)) {
          // Find the context around the keyword
          const keywordIndex = lowerTranscript.indexOf(keywordLower);
          const contextStart = Math.max(0, keywordIndex - 20);
          const contextEnd = Math.min(transcript.length, keywordIndex + keyword.length + 20);
          const context = transcript.slice(contextStart, contextEnd);
          
          // Estimate severity from context words
          const severity = this.estimateSeverityFromContext(context, language);
          
          extractedSymptoms.push({
            symptom: symptom.id,
            confidence: confidence * 0.8, // Slightly reduce confidence for voice extraction
            context,
            severity,
            bodyPart: symptom.bodyPart
          });
        }
      });
    });
    
    // Remove duplicates and sort by confidence
    const uniqueSymptoms = this.removeDuplicateSymptoms(extractedSymptoms);
    return uniqueSymptoms.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Find matching conditions based on selected symptoms
   */
  findMatchingConditions(selectedSymptoms: SelectedSymptom[]): ConditionMatch[] {
    const matches: ConditionMatch[] = [];
    
    this.conditions.forEach(condition => {
      const match = this.calculateConditionMatch(condition, selectedSymptoms);
      if (match.confidence > 0.1) { // Only include matches with some confidence
        matches.push(match);
      }
    });
    
    // Sort by confidence and return top matches
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Return top 5 matches
  }

  /**
   * Get symptom by ID
   */
  getSymptomById(id: string): Symptom | undefined {
    return this.symptoms.find(symptom => symptom.id === id);
  }

  /**
   * Get condition by ID
   */
  getConditionById(id: string): Condition | undefined {
    return this.conditions.find(condition => condition.id === id);
  }

  /**
   * Search symptoms by text query
   */
  searchSymptoms(query: string, language: Language): Symptom[] {
    const queryLower = query.toLowerCase();
    
    return this.symptoms.filter(symptom => {
      // Search in name and description
      const name = symptom.name[language]?.toLowerCase() || symptom.name.en.toLowerCase();
      const description = symptom.description[language]?.toLowerCase() || symptom.description.en.toLowerCase();
      
      // Search in voice keywords
      const keywords = symptom.voiceKeywords[language] || symptom.voiceKeywords.en;
      const keywordMatch = keywords.some(keyword => 
        keyword.toLowerCase().includes(queryLower) || queryLower.includes(keyword.toLowerCase())
      );
      
      return name.includes(queryLower) || description.includes(queryLower) || keywordMatch;
    }).slice(0, 10); // Return top 10 results
  }

  /**
   * Get symptoms by category
   */
  getSymptomsByCategory(category: string): Symptom[] {
    return this.symptoms.filter(symptom => symptom.category === category);
  }

  /**
   * Get related symptoms
   */
  getRelatedSymptoms(symptomId: string): Symptom[] {
    const symptom = this.getSymptomById(symptomId);
    if (!symptom || !symptom.relatedSymptoms) return [];
    
    return symptom.relatedSymptoms
      .map(id => this.getSymptomById(id))
      .filter(Boolean) as Symptom[];
  }

  // Private helper methods
  
  private estimateSeverityFromContext(context: string, language: Language): 'mild' | 'moderate' | 'severe' | 'critical' {
    const contextLower = context.toLowerCase();
    
    // Define severity keywords for each language
    const severityKeywords = {
      en: {
        critical: ['extreme', 'unbearable', 'worst', 'emergency', 'can\'t breathe', 'chest pain'],
        severe: ['very', 'really', 'terrible', 'awful', 'intense', 'sharp'],
        moderate: ['bad', 'uncomfortable', 'noticeable', 'bothering'],
        mild: ['little', 'slight', 'minor', 'light']
      },
      hi: {
        critical: ['बहुत ज्यादा', 'असह्य', 'तेज़', 'गंभीर'],
        severe: ['बहुत', 'तेज़', 'भयंकर'],
        moderate: ['बुरा', 'परेशान'],
        mild: ['हल्का', 'थोड़ा']
      },
      // Add other languages as needed
    };
    
    const keywords = severityKeywords[language as keyof typeof severityKeywords] || severityKeywords.en;
    
    if (keywords.critical.some(word => contextLower.includes(word))) return 'critical';
    if (keywords.severe.some(word => contextLower.includes(word))) return 'severe';
    if (keywords.moderate.some(word => contextLower.includes(word))) return 'moderate';
    return 'mild';
  }

  private removeDuplicateSymptoms(symptoms: ExtractedSymptom[]): ExtractedSymptom[] {
    const unique = new Map();
    
    symptoms.forEach(symptom => {
      const existing = unique.get(symptom.symptom);
      if (!existing || existing.confidence < symptom.confidence) {
        unique.set(symptom.symptom, symptom);
      }
    });
    
    return Array.from(unique.values());
  }

  private calculateConditionMatch(condition: Condition, selectedSymptoms: SelectedSymptom[]): ConditionMatch {
    const symptomIds = selectedSymptoms.map(s => s.symptomId);
    
    // Calculate how many common symptoms match
    const matchingSymptoms = condition.commonSymptoms.filter(symptomId => 
      symptomIds.includes(symptomId)
    );
    
    // Check rare symptoms (higher weight)
    const matchingRareSymptoms = condition.rareSymptoms?.filter(symptomId => 
      symptomIds.includes(symptomId)
    ) || [];
    
    // Calculate base confidence from matching symptoms
    const commonSymptomScore = matchingSymptoms.length / condition.commonSymptoms.length;
    const rareSymptomScore = matchingRareSymptoms.length * 0.3; // Bonus for rare symptoms
    
    // Consider severity matching
    const severityScore = this.calculateSeverityMatch(condition, selectedSymptoms);
    
    // Consider prevalence in migrant population
    const prevalenceMultiplier = {
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8
    }[condition.prevalenceInMigrants];
    
    // Final confidence calculation
    const baseConfidence = (commonSymptomScore * 0.7 + rareSymptomScore + severityScore * 0.1);
    const finalConfidence = Math.min(1.0, baseConfidence * prevalenceMultiplier);
    
    // Missing symptoms for differential diagnosis
    const missingSymptoms = condition.commonSymptoms.filter(symptomId => 
      !symptomIds.includes(symptomId)
    );
    
    const reasoning = this.generateReasoning(condition, matchingSymptoms, matchingRareSymptoms, finalConfidence);
    
    return {
      conditionId: condition.id,
      confidence: finalConfidence,
      matchingSymptoms: [...matchingSymptoms, ...matchingRareSymptoms],
      missingSymptoms,
      reasoning
    };
  }

  private calculateSeverityMatch(condition: Condition, selectedSymptoms: SelectedSymptom[]): number {
    // Simple severity matching - can be enhanced
    const avgSeverity = selectedSymptoms.reduce((sum, symptom) => {
      const severityScore = { 'mild': 1, 'moderate': 2, 'severe': 3, 'critical': 4 }[symptom.severity];
      return sum + severityScore;
    }, 0) / selectedSymptoms.length;
    
    const conditionSeverityScore = { 'minor': 1, 'moderate': 2, 'serious': 3, 'critical': 4 }[condition.severity];
    
    // Return similarity score (1.0 = perfect match)
    return 1.0 - Math.abs(avgSeverity - conditionSeverityScore) / 4;
  }

  private generateReasoning(
    condition: Condition, 
    matchingSymptoms: string[], 
    matchingRareSymptoms: string[], 
    confidence: number
  ): string {
    if (confidence > 0.8) {
      return `High probability match. ${matchingSymptoms.length} out of ${condition.commonSymptoms.length} common symptoms present.`;
    } else if (confidence > 0.5) {
      return `Possible match. Consider additional symptoms and risk factors.`;
    } else if (confidence > 0.3) {
      return `Low probability match. Some symptoms align but further evaluation needed.`;
    } else {
      return `Unlikely match based on current symptoms.`;
    }
  }
}

// Export singleton instance
export const symptomMatcher = new SymptomMatcher();