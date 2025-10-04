import axios from 'axios';
import type { VapiConfig, VapiWebhook, Language } from '@/types';

// Vapi.ai API configuration
const VAPI_API_KEY = process.env.VAPI_API_KEY!;
const VAPI_BASE_URL = 'https://api.vapi.ai';

// Multilingual voice configurations for Kerala migrant workers
export const vapiConfigs: Record<Language, VapiConfig> = {
  en: {
    assistant_id: process.env.VAPI_ASSISTANT_EN!,
    voice: 'jennifer',
    language: 'en',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
  hi: {
    assistant_id: process.env.VAPI_ASSISTANT_HI!,
    voice: 'hindi-female-1',
    language: 'hi',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
  bn: {
    assistant_id: process.env.VAPI_ASSISTANT_BN!,
    voice: 'bengali-female-1',
    language: 'bn',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
  or: {
    assistant_id: process.env.VAPI_ASSISTANT_OR!,
    voice: 'odia-female-1',
    language: 'or',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
  ta: {
    assistant_id: process.env.VAPI_ASSISTANT_TA!,
    voice: 'tamil-female-1',
    language: 'ta',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
  ne: {
    assistant_id: process.env.VAPI_ASSISTANT_NE!,
    voice: 'nepali-female-1',
    language: 'ne',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
  ml: {
    assistant_id: process.env.VAPI_ASSISTANT_ML!,
    voice: 'malayalam-female-1',
    language: 'ml',
    webhook_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/vapi/webhook',
  },
};

// Health data collection prompts in multiple languages
export const healthPrompts = {
  en: {
    greeting: "Hello! I'm your health assistant for Kerala migrant workers. I'll help you register your health information. What is your name?",
    askAge: "How old are you?",
    askGender: "What is your gender? Please say male, female, or other.",
    askLocation: "Which district in Kerala are you currently in?",
    askOccupation: "What type of work do you do? For example: construction, fishing, factory work, agriculture, domestic work, or transport.",
    askSymptoms: "Are you experiencing any health symptoms? Please describe how you are feeling.",
    askUrgency: "On a scale of 1 to 10, how urgent is your health concern? 1 being mild, 10 being very serious.",
    askEmployer: "Who is your current employer? This is optional.",
    askPhone: "What is your phone number for health updates?",
    confirmation: "Thank you! I've recorded your health information. Your Migrant Health ID is {mhi_id}. You'll receive an SMS confirmation. Is there anything else you'd like to report?",
    emergency: "This sounds urgent. I'm connecting you to emergency services immediately. Please stay on the line."
  },
  hi: {
    greeting: "नमस्ते! मैं केरल के प्रवासी श्रमिकों के लिए आपका स्वास्थ्य सहायक हूं। मैं आपकी स्वास्थ्य जानकारी पंजीकृत करने में मदद करूंगा। आपका नाम क्या है?",
    askAge: "आपकी उम्र क्या है?",
    askGender: "आपका लिंग क्या है? कृपया पुरुष, महिला, या अन्य कहें।",
    askLocation: "आप वर्तमान में केरल के किस जिले में हैं?",
    askOccupation: "आप किस प्रकार का काम करते हैं? उदाहरण: निर्माण, मछली पकड़ना, कारखाना का काम, कृषि, घरेलू काम, या परिवहन।",
    askSymptoms: "क्या आप किसी स्वास्थ्य समस्या का अनुभव कर रहे हैं? कृपया बताएं कि आप कैसा महसूस कर रहे हैं।",
    askUrgency: "1 से 10 के पैमाने पर, आपकी स्वास्थ्य चिंता कितनी गंभीर है? 1 हल्की, 10 बहुत गंभीर।",
    askEmployer: "आपका वर्तमान नियोक्ता कौन है? यह वैकल्पिक है।",
    askPhone: "स्वास्थ्य अपडेट के लिए आपका फ़ोन नंबर क्या है?",
    confirmation: "धन्यवाद! मैंने आपकी स्वास्थ्य जानकारी दर्ज की है। आपका प्रवासी स्वास्थ्य आईडी {mhi_id} है। आपको SMS पुष्टि मिलेगी। क्या कुछ और रिपोर्ट करना चाहते हैं?",
    emergency: "यह गंभीर लगता है। मैं आपको तुरंत आपातकालीन सेवाओं से जोड़ रहा हूं। कृपया लाइन पर रहें।"
  },
  // Add other languages similarly...
  ml: {
    greeting: "നമസ്കാരം! ഞാൻ കേരളത്തിലെ കുടിയേറ്റ തൊഴിലാളികൾക്കുള്ള നിങ്ങളുടെ ആരോഗ്യ സഹായിയാണ്. നിങ്ങളുടെ ആരോഗ്യ വിവരങ്ങൾ രജിസ്റ്റർ ചെയ്യാൻ ഞാൻ സഹായിക്കും. നിങ്ങളുടെ പേര് എന്താണ്?",
    askAge: "നിങ്ങളുടെ പ്രായം എത്രയാണ്?",
    askGender: "നിങ്ങളുടെ ലിംഗം എന്താണ്? ദയവായി പുരുഷൻ, സ്ത്രീ, അല്ലെങ്കിൽ മറ്റുള്ളവ എന്ന് പറയുക.",
    askLocation: "നിങ്ങൾ ഇപ്പോൾ കേരളത്തിലെ ഏത് ജില്ലയിലാണ് ഉള്ളത്?",
    askOccupation: "നിങ്ങൾ ഏത് തരത്തിലുള്ള ജോലിയാണ് ചെയ്യുന്നത്? ഉദാഹരണം: നിർമ്മാണം, മത്സ്യബന്ധനം, ഫാക്ടറി ജോലി, കൃഷി, വീട്ടുജോലി, അല്ലെങ്കിൽ ഗതാഗതം.",
    askSymptoms: "നിങ്ങൾ ഏതെങ്കിലും ആരോഗ്യ പ്രശ്നങ്ങൾ അനുഭവിക്കുന്നുണ്ടോ? നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നു എന്ന് വിവരിക്കുക.",
    askUrgency: "1 മുതൽ 10 വരെയുള്ള സ്കെയിലിൽ, നിങ്ങളുടെ ആരോഗ്യ ആശങ്ക എത്ര അടിയന്തിരമാണ്? 1 സൗമ്യം, 10 വളരെ ഗുരുതരം.",
    askEmployer: "നിങ്ങളുടെ നിലവിലെ തൊഴിൽദാതാവ് ആരാണ്? ഇത് ഓപ്ഷണലാണ്.",
    askPhone: "ആരോഗ്യ അപ്ഡേറ്റുകൾക്കായി നിങ്ങളുടെ ഫോൺ നമ്പർ എന്താണ്?",
    confirmation: "നന്ദി! ഞാൻ നിങ്ങളുടെ ആരോഗ്യ വിവരങ്ങൾ രേഖപ്പെടുത്തിയിട്ടുണ്ട്. നിങ്ങളുടെ കുടിയേറ്റ ആരോഗ്യ ഐഡി {mhi_id} ആണ്. നിങ്ങൾക്ക് SMS സ്ഥിരീകരണം ലഭിക്കും. മറ്റെന്തെങ്കിലും റിപ്പോർട്ട് ചെയ്യാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുണ്ടോ?",
    emergency: "ഇത് അടിയന്തിരമായി തോന്നുന്നു. ഞാൻ നിങ്ങളെ ഉടനടി എമർജൻസി സേവനങ്ങളുമായി ബന്ധിപ്പിക്കുന്നു. ദയവായി ലൈനിൽ തുടരുക."
  }
};

// Vapi.ai API client
export class VapiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = VAPI_API_KEY;
    this.baseUrl = VAPI_BASE_URL;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // Create a new assistant for a specific language
  async createAssistant(language: Language) {
    const config = {
      name: `Kerala Health Assistant - ${language.toUpperCase()}`,
      voice: vapiConfigs[language].voice,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        systemMessage: this.getSystemMessage(language),
        temperature: 0.7,
        maxTokens: 500,
      },
      firstMessage: healthPrompts[language as keyof typeof healthPrompts]?.greeting || healthPrompts.en.greeting,
      serverUrl: vapiConfigs[language as keyof typeof vapiConfigs].webhook_url,
      endCallMessage: "Thank you for using Kerala Health System. Take care!",
      recordingEnabled: false, // Privacy-compliant
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 300, // 5 minutes max
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/assistant`,
        config,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Vapi assistant:', error);
      throw error;
    }
  }

  // Initiate an outbound call
  async makeCall(phoneNumber: string, language: Language = 'en', assistantId?: string) {
    const callConfig = {
      phoneNumber,
      assistantId: assistantId || vapiConfigs[language as keyof typeof vapiConfigs].assistant_id,
      metadata: {
        language,
        purpose: 'health_registration',
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/call`,
        callConfig,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error making Vapi call:', error);
      throw error;
    }
  }

  // Get call details
  async getCall(callId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/call/${callId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting Vapi call:', error);
      throw error;
    }
  }

  // Process webhook data and extract health information
  extractHealthData(transcript: string, language: Language) {
    // This would typically use NLP/AI to extract structured data
    // For now, we'll use simple keyword matching
    const symptoms = this.extractSymptoms(transcript, language);
    const urgency = this.extractUrgency(transcript);
    const location = this.extractLocation(transcript);
    
    return {
      symptoms,
      urgency,
      location,
      transcript,
    };
  }

  private extractSymptoms(transcript: string, language: Language): string[] {
    // Multilingual symptom keywords
    const symptomKeywords = {
      en: ['fever', 'cough', 'headache', 'pain', 'nausea', 'dizzy', 'tired', 'shortness of breath'],
      hi: ['बुखार', 'खांसी', 'सिरदर्द', 'दर्द', 'जी मिचलाना', 'चक्कर', 'थकान', 'सांस लेने में तकलीफ'],
      ml: ['പനി', 'ചുമ', 'തലവേദന', 'വേദന', 'ഓക്കാനം', 'തലകറക്കം', 'ക്ഷീണം', 'ശ്വാസതടസ്സം'],
      // Add more languages...
    };

    const keywords = symptomKeywords[language as keyof typeof symptomKeywords] || symptomKeywords.en;
    const foundSymptoms: string[] = [];
    
    const lowerTranscript = transcript.toLowerCase();
    keywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword.toLowerCase())) {
        foundSymptoms.push(keyword);
      }
    });
    
    return foundSymptoms;
  }

  private extractUrgency(transcript: string): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['emergency', 'urgent', 'severe', 'critical', '8', '9', '10'];
    const mediumKeywords = ['moderate', 'concerning', '5', '6', '7'];
    
    const lowerTranscript = transcript.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  private extractLocation(transcript: string): string | null {
    // Kerala district names for location extraction
    const districts = [
      'thiruvananthapuram', 'kollam', 'pathanamthitta', 'alappuzha', 'kottayam',
      'idukki', 'ernakulam', 'thrissur', 'palakkad', 'malappuram', 'kozhikode',
      'wayanad', 'kannur', 'kasaragod'
    ];
    
    const lowerTranscript = transcript.toLowerCase();
    
    for (const district of districts) {
      if (lowerTranscript.includes(district)) {
        return district;
      }
    }
    
    return null;
  }

  private getSystemMessage(language: Language): string {
    return `You are a healthcare assistant for the Kerala Migrant Health System, specifically designed to help migrant workers register their health information. 

LANGUAGE: Communicate in ${language} language.

YOUR ROLE: 
- Collect health information from migrant workers in Kerala
- Be empathetic, patient, and culturally sensitive
- Ensure data privacy and confidentiality
- Guide workers through the registration process step by step

INFORMATION TO COLLECT:
1. Name
2. Age 
3. Gender
4. Current location (district in Kerala)
5. Occupation type
6. Current health symptoms (if any)
7. Urgency level of health concerns
8. Contact phone number
9. Employer information (optional)

IMPORTANT GUIDELINES:
- If symptoms indicate emergency (chest pain, difficulty breathing, severe injury), immediately escalate
- Be patient with language barriers and accent differences
- Confirm information before proceeding to next question
- Provide reassurance and explain the next steps
- Keep conversations focused on health registration
- Respect cultural sensitivities around health discussions

EMERGENCY PROTOCOL:
If urgent symptoms are reported, immediately say: "${healthPrompts[language as keyof typeof healthPrompts]?.emergency || healthPrompts.en.emergency}"

Remember: You're helping vulnerable migrant workers access healthcare. Be compassionate and thorough.`;
  }
}

// Singleton instance
export const vapiClient = new VapiClient();