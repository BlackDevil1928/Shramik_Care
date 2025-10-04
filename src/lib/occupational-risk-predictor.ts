import type {
  OccupationalProfile,
  RiskPrediction,
  OccupationalCondition,
  RiskLevel,
  Industry,
  WorkEnvironment,
  RiskFactor,
  HealthAlert,
  AlertSeverity,
  AlertType
} from '@/types/occupational-health';
import type { Language } from '@/types';

// Sample occupational conditions database
const OCCUPATIONAL_CONDITIONS: OccupationalCondition[] = [
  {
    id: 'back_strain',
    name: {
      en: 'Occupational Back Strain',
      hi: 'व्यावसायिक पीठ तनाव',
      ml: 'തൊഴിൽപരമായ നട് വലിവ്',
      bn: 'পেশাগত পিঠের চাপ',
      or: 'ବୃତ୍ତିଗତ ପିଠି ଟାଣ',
      ta: 'தொழில்சார் முதுகு திரிபு',
      ne: 'व्यावसायिक ढाड तनाव'
    },
    description: {
      en: 'Musculoskeletal injury caused by heavy lifting, poor posture, or repetitive movements at work',
      hi: 'कार्यस्थल पर भारी उठाने, गलत मुद्रा या दोहराव की गतिविधियों से होने वाली मांसपेशियों की चोट',
      ml: 'ജോലിസ്ഥലത്ത് ഭാരമുള്ളത് ഉയർത്തൽ, മോശം സ്ഥാനം അല്ലെങ്കിൽ ആവർത്തിക്കുന്ന ചലനങ്ങൾ മൂലമുള്ള പേശി-അസ്ഥി പരിക്ക്',
      bn: 'কর্মক্ষেত্রে ভারী উত্তোলন, খারাপ অঙ্গবিন্যাস বা পুনরাবৃত্তিমূলক নড়াচড়ার কারণে পেশী-কঙ্কালের আঘাত',
      or: 'କର୍ମକ୍ଷେତ୍ରରେ ଭାରୀ ଉଠାଇବା, ଖରାପ ମୁଦ୍ରା କିମ୍ବା ପୁନରାବୃତ୍ତି ଗତିବିଧି ଦ୍ୱାରା ହୋଇଥିବା ମାଂସପେଶୀ-ଅସ୍ଥି ଆଘାତ',
      ta: 'வேலையில் கனமான பொருட்களை தூக்குதல், தவறான நிலை அல்லது மீண்டும் மீண்டும் அசைவுகளால் ஏற்படும் தசை-எலும்பு காயம்',
      ne: 'कामको ठाउँमा भारी उठाउने, खराब मुद्रा वा दोहोरिने हलचलका कारण हुने मांसपेशी-हड्डीको चोट'
    },
    category: 'musculoskeletal',
    commonIndustries: ['construction', 'manufacturing', 'agriculture', 'transportation'],
    riskFactors: ['physical', 'ergonomic'],
    symptoms: ['back_pain', 'muscle_stiffness', 'limited_mobility'],
    prevention: {
      en: ['Use proper lifting techniques', 'Take regular breaks', 'Use mechanical aids', 'Maintain good posture'],
      hi: ['उचित उठाने की तकनीक का उपयोग करें', 'नियमित ब्रेक लें', 'यांत्रिक सहायता का उपयोग करें', 'अच्छी मुद्रा बनाए रखें'],
      ml: ['ശരിയായ ഉയർത്തൽ സാങ്കേതികതകൾ ഉപയോഗിക്കുക', 'പതിവായി വിശ്രമിക്കുക', 'യാന്ത്രിക സഹായങ്ങൾ ഉപയോഗിക്കുക', 'നല്ല സ്ഥിതി നിലനിർത്തുക'],
      bn: ['সঠিক উত্তোলন কৌশল ব্যবহার করুন', 'নিয়মিত বিরতি নিন', 'যান্ত্রিক সহায়তা ব্যবহার করুন', 'ভাল অঙ্গবিন্যাস বজায় রাখুন'],
      or: ['ଉଚିତ ଉଠାଇବା କୌଶଳ ବ୍ୟବହାର କର', 'ନିୟମିତ ବିରତି ନିଅ', 'ଯାନ୍ତ୍ରିକ ସହାୟତା ବ୍ୟବହାର କର', 'ଭଲ ମୁଦ୍ରା ବଜାୟ ରଖ'],
      ta: ['சரியான தூக்கும் நுட்பங்களைப் பயன்படுத்துங்கள்', 'வழக்கமான இடைவேளை எடுங்கள்', 'இயந்திர உதவிகளைப் பயன்படுத்துங்கள்', 'நல்ல நிலையைப் பராமரிக்கவும்'],
      ne: ['सही उठाउने प्रविधि प्रयोग गर्नुहोस्', 'नियमित बिश्राम लिनुहोस्', 'यान्त्रिक सहायता प्रयोग गर्नुहोस्', 'राम्रो मुद्रा कायम राख्नुहोस्']
    },
    treatment: {
      en: ['Rest and ice application', 'Physical therapy', 'Pain management', 'Ergonomic workplace modifications'],
      hi: ['आराम और बर्फ लगाना', 'भौतिक चिकित्सा', 'दर्द प्रबंधन', 'कार्यक्षेत्र में एर्गोनॉमिक संशोधन'],
      ml: ['വിശ്രമവും ഐസ് പ്രയോഗവും', 'ഫിസിക്കൽ തെറാപ്പി', 'വേദന മാനേജ്മെന്റ്', 'എർഗണോമിക് വർക്ക്പ്ലേസ് പരിഷ്കാരങ്ങൾ'],
      bn: ['বিশ্রাম এবং বরফ প্রয়োগ', 'শারীরিক থেরাপি', 'ব্যথা ব্যবস্থাপনা', 'এরগোনমিক কর্মক্ষেত্র সংশোধন'],
      or: ['ବିଶ୍ରାମ ଏବଂ ବରଫ ପ୍ରୟୋଗ', 'ଶାରୀରିକ ଚିକିତ୍ସା', 'ଯନ୍ତ୍ରଣା ପରିଚାଳନା', 'ଏର୍ଗୋନମିକ କର୍ମକ୍ଷେତ୍ର ସଂଶୋଧନ'],
      ta: ['ஓய்வு மற்றும் பனி பயன்படுத்துதல்', 'உடல் சிகிச்சை', 'வலி மேலாண்மை', 'எர்கோனாமிக் பணியிட மாற்றங்கள்'],
      ne: ['आराम र बरफ लगाउने', 'शारीरिक चिकित्सा', 'दुखाइ व्यवस्थापन', 'एर्गोनोमिक कार्यस्थल परिमार्जन']
    },
    prognosis: 'good',
    prevalenceRate: 0.25
  },
  {
    id: 'respiratory_disease',
    name: {
      en: 'Occupational Respiratory Disease',
      hi: 'व्यावसायिक श्वसन रोग',
      ml: 'തൊഴിൽപരമായ ശ്വാസകോശ രോഗം',
      bn: 'পেশাগত শ্বাসযন্ত্রের রোগ',
      or: 'ବୃତ୍ତିଗତ ଶ୍ୱାସକ୍ରିୟା ରୋଗ',
      ta: 'தொழில்சார் சுவாச நோய்',
      ne: 'व्यावसायिक श्वासप्रश्वास रोग'
    },
    description: {
      en: 'Lung diseases caused by inhaling harmful particles, chemicals, or biological agents at work',
      hi: 'कार्यस्थल पर हानिकारक कणों, रसायनों या जैविक एजेंटों को सांस में लेने से होने वाले फेफड़ों के रोग',
      ml: 'ജോലിസ്ഥലത്ത് ഹാനികരമായ കണികകൾ, രാസവസ്തുക്കൾ അല്ലെങ്കിൽ ജൈവിക ഏജന്റുമാർ ശ്വസിക്കുന്നത് മൂലമുള്ള ശ്വാസകോശ രോഗങ്ങൾ',
      bn: 'কর্মক্ষেত্রে ক্ষতিকর কণা, রাসায়নিক বা জৈবিক এজেন্ট শ্বাস নেওয়ার ফলে হওয়া ফুসফুসের রোগ',
      or: 'କର୍ମକ୍ଷେତ୍ରରେ କ୍ଷତିକାରକ କଣିକା, ରାସାୟନିକ କିମ୍ବା ଜୈବିକ ଏଜେଣ୍ଟ ନିଶ୍ୱାସ ନେବା ଦ୍ୱାରା ହୋଇଥିବା ଫୁସଫୁସ ରୋଗ',
      ta: 'வேலையில் தீங்கு விளைவிக்கும் துகள்கள், இரசாயனங்கள் அல்லது உயிரியல் காரணிகளை சுவாசிப்பதால் ஏற்படும் நுரையீரல் நோய்கள்',
      ne: 'काममा हानिकारक कण, रसायन वा जैविक एजेन्टहरू सास फेर्नुका कारण हुने फोक्सोको रोग'
    },
    category: 'respiratory',
    commonIndustries: ['construction', 'mining', 'manufacturing', 'agriculture'],
    riskFactors: ['chemical', 'physical', 'biological'],
    symptoms: ['cough', 'shortness_of_breath', 'chest_tightness', 'wheezing'],
    prevention: {
      en: ['Use proper respiratory protection', 'Ensure adequate ventilation', 'Regular health screenings', 'Avoid dust and fume exposure'],
      hi: ['उचित श्वसन सुरक्षा का उपयोग करें', 'पर्याप्त वेंटिलेशन सुनिश्चित करें', 'नियमित स्वास्थ्य जांच', 'धूल और धुएं के संपर्क से बचें'],
      ml: ['ശരിയായ ശ്വാസകോശ സംരക്ഷണം ഉപയോഗിക്കുക', 'മതിയായ വായു സഞ്ചാരം ഉറപ്പാക്കുക', 'പതിവ് ആരോഗ്യ പരിശോധനകൾ', 'പൊടിയും പുകയും ഒഴിവാക്കുക'],
      bn: ['সঠিক শ্বাসযন্ত্রের সুরক্ষা ব্যবহার করুন', 'পর্যাপ্ত বায়ু চলাচল নিশ্চিত করুন', 'নিয়মিত স্বাস্থ্য পরীক্ষা', 'ধুলা এবং ধোঁয়া এক্সপোজার এড়িয়ে চলুন'],
      or: ['ଉଚିତ ଶ୍ୱାସକ୍ରିୟା ସୁରକ୍ଷା ବ୍ୟବହାର କର', 'ପର୍ଯ୍ୟାପ୍ତ ବାୟୁ ଚଳାଚଳ ନିଶ୍ଚିତ କର', 'ନିୟମିତ ସ୍ୱାସ୍ଥ୍ୟ ଜାଂଚ', 'ଧୂଳି ଏବଂ ଧୂଆଁ ସଂସ୍ପର୍ଶରୁ ଦୂରେଇ ଯାଅ'],
      ta: ['சரியான சுவாச பாதுகாப்பைப் பயன்படுத்துங்கள்', 'போதுமான காற்றோட்டத்தை உறுதிப்படுத்துங்கள்', 'வழக்கமான சுகாதார பரிசோதனைகள்', 'தூசி மற்றும் புகை வெளிப்பாட்டை தவிர்க்கவும்'],
      ne: ['उचित श्वासप्रश्वास सुरक्षा प्रयोग गर्नुहोस्', 'पर्याप्त हावा चलाचल सुनिश्चित गर्नुहोस्', 'नियमित स्वास्थ्य जाँच', 'धुलो र धुवाँको सम्पर्कबाट बच्नुहोस्']
    },
    treatment: {
      en: ['Remove from exposure', 'Bronchodilators', 'Anti-inflammatory medication', 'Pulmonary rehabilitation'],
      hi: ['संपर्क से हटाएं', 'ब्रोंकोडाइलेटर्स', 'विरोधी भड़काऊ दवा', 'फुफ्फुसीय पुनर्वास'],
      ml: ['എക്സ്പോഷറിൽ നിന്ന് നീക്കം ചെയ്യുക', 'ബ്രോങ്കോഡൈലേറ്ററുകൾ', 'വിരുദ്ധ-കോശക്കേട് മരുന്ന്', 'പൾമണറി പുനരധിവാസം'],
      bn: ['এক্সপোজার থেকে সরান', 'ব্রঙ্কোডাইলেটর', 'প্রদাহ বিরোধী ওষুধ', 'পালমোনারি পুনর্বাসন'],
      or: ['ସଂସ୍ପର୍ଶରୁ ହଟାନ୍ତୁ', 'ବ୍ରୋଙ୍କୋଡାଇଲେଟର', 'ପ୍ରଦାହ ବିରୋଧୀ ଔଷଧ', 'ଫୁଫ୍ଫୁସୀୟ ପୁନର୍ବାସ'],
      ta: ['வெளிப்பாட்டிலிருந்து அகற்றுங்கள்', 'ப்ரோங்கோடைலேட்டர்கள்', 'அழற்சி எதிர்ப்பு மருந்து', 'நுரையீரல் மறுவாழ்வு'],
      ne: ['एक्सपोजरबाट हटाउनुहोस्', 'ब्रोन्कोडाइलेटरहरू', 'विरोधी भडकाऊ औषधि', 'फोक्सो पुनर्वास']
    },
    prognosis: 'fair',
    prevalenceRate: 0.15
  },
  {
    id: 'heat_exhaustion',
    name: {
      en: 'Heat-Related Illness',
      hi: 'गर्मी संबंधी बीमारी',
      ml: 'ചൂട് ബന്ധപ്പെട്ട രോഗം',
      bn: 'তাপ সম্পর্কিত অসুস্থতা',
      or: 'ଗରମ ସମ୍ବନ୍ଧୀୟ ଅସୁସ୍ଥତା',
      ta: 'வெப்ப தொடர்புடைய நோய்',
      ne: 'तातो सम्बन्धी बिरामी'
    },
    description: {
      en: 'Health problems caused by prolonged exposure to high temperatures and humidity in work environments',
      hi: 'कार्य वातावरण में उच्च तापमान और आर्द्रता के लंबे संपर्क से होने वाली स्वास्थ्य समस्याएं',
      ml: 'പ്രവർത്തന പരിതസ്ഥിതിയിൽ ഉയർന്ന താപനിലയും ഈർപ്പവും നീണ്ട എക്സ്പോഷർ മൂലമുള്ള ആരോഗ്യ പ്രശ്നങ്ങൾ',
      bn: 'কর্ম পরিবেশে উচ্চ তাপমাত্রা এবং আর্দ্রতার দীর্ঘ এক্সপোজারের ফলে হওয়া স্বাস্থ্য সমস্যা',
      or: 'କାର୍ଯ୍ୟ ପରିବେଶରେ ଉଚ୍ଚ ତାପମାତ୍ରା ଏବଂ ଆର୍ଦ୍ରତାର ଦୀର୍ଘ ସଂସ୍ପର୍ଶ ଦ୍ୱାରା ହୋଇଥିବା ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା',
      ta: 'வேலை சூழலில் அதிக வெப்பநிலை மற்றும் ஈரப்பதத்தின் நீண்ட வெளிப்பாட்டால் ஏற்படும் உடல்நல பிரச்சினைகள்',
      ne: 'काम गर्ने वातावरणमा उच्च तापक्रम र आर्द्रताको लामो सम्पर्कका कारण हुने स्वास्थ्य समस्याहरू'
    },
    category: 'cardiovascular',
    commonIndustries: ['construction', 'agriculture', 'manufacturing', 'transportation'],
    riskFactors: ['environmental', 'physical'],
    symptoms: ['excessive_sweating', 'fatigue', 'nausea', 'headache', 'dizziness'],
    prevention: {
      en: ['Drink plenty of water', 'Take frequent breaks', 'Wear light clothing', 'Avoid peak heat hours'],
      hi: ['भरपूर पानी पिएं', 'बार-बार आराम करें', 'हल्के कपड़े पहनें', 'अधिकतम गर्मी के घंटों से बचें'],
      ml: ['ധാരാളം വെള്ളം കുടിക്കുക', 'പതിവായി വിശ്രമിക്കുക', 'ലഘു വസ്ത്രങ്ങൾ ധരിക്കുക', 'ഏറ്റവും ചൂടുള്ള സമയം ഒഴിവാക്കുക'],
      bn: ['প্রচুর পানি পান করুন', 'ঘন ঘন বিরতি নিন', 'হালকা পোশাক পরুন', 'চরম গরমের সময় এড়িয়ে চলুন'],
      or: ['ବହୁତ ପାଣି ପିଅ', 'ବାରମ୍ବାର ବିରତି ନିଅ', 'ହାଲୁକା ପୋଷାକ ପିନ୍ଧ', 'ଅଧିକ ଗରମ ସମୟକୁ ଏଡ଼ାଇ ଚାଲ'],
      ta: ['நிறைய தண்ணீர் குடியுங்கள்', 'அடிக்கடி இடைவேளை எடுங்கள்', 'இலேசான ஆடைகளை அணியுங்கள்', 'அதிக வெப்ப நேரங்களை தவிர்க்கவும்'],
      ne: ['धेरै पानी पिउनुहोस्', 'बारम्बार बिश्राम लिनुहोस्', 'हल्का लुगा लगाउनुहोस्', 'चरम तातो समयलाई बेवास्ता गर्नुहोस्']
    },
    treatment: {
      en: ['Move to cool place', 'Remove excess clothing', 'Apply cool water', 'Seek immediate medical attention'],
      hi: ['ठंडी जगह पर ले जाएं', 'अतिरिक्त कपड़े हटाएं', 'ठंडा पानी लगाएं', 'तुरंत चिकित्सा सहायता लें'],
      ml: ['തണുത്ത സ്ഥലത്തേക്ക് നീക്കുക', 'അധിക വസ്ത്രങ്ങൾ നീക്കം ചെയ്യുക', 'തണുത്ത വെള്ളം പ്രയോഗിക്കുക', 'ഉടനടി വൈദ്യസഹായം തേടുക'],
      bn: ['ঠান্ডা জায়গায় নিয়ে যান', 'অতিরিক্ত কাপড় সরান', 'ঠান্ডা পানি প্রয়োগ করুন', 'অবিলম্বে চিকিৎসা সহায়তা নিন'],
      or: ['ଥଣ୍ଡା ସ୍ଥାନକୁ ନେଇଯାଅ', 'ଅଧିକ ବସ୍ତ୍ର କାଢ଼ିଦିଅ', 'ଥଣ୍ଡା ପାଣି ପ୍ରୟୋଗ କର', 'ତୁରନ୍ତ ଚିକିତ୍ସା ସହାୟତା ନିଅ'],
      ta: ['குளிர்ந்த இடத்திற்கு நகர்த்துங்கள்', 'அதிகப்படியான ஆடைகளை அகற்றுங்கள்', 'குளிர்ந்த தண்ணீரைப் பயன்படுத்துங்கள்', 'உடனடியாக மருத்துவ உதவி பெறுங்கள்'],
      ne: ['चिसो ठाउँमा सार्नुहोस्', 'अतिरिक्त लुगा हटाउनुहोस्', 'चिसो पानी लगाउनुहोस्', 'तुरुन्तै चिकित्सा सहायता लिनुहोस्']
    },
    prognosis: 'excellent',
    prevalenceRate: 0.20
  }
];

export class OccupationalRiskPredictor {
  private conditions: OccupationalCondition[] = OCCUPATIONAL_CONDITIONS;

  /**
   * Predict occupational health risks for a worker profile
   */
  async predictRisks(profile: OccupationalProfile): Promise<RiskPrediction[]> {
    const predictions: RiskPrediction[] = [];

    for (const condition of this.conditions) {
      const prediction = await this.calculateRiskForCondition(profile, condition);
      if (prediction.riskScore > 0.1) { // Only include meaningful risks
        predictions.push(prediction);
      }
    }

    return predictions.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Generate health alerts based on risk predictions
   */
  generateAlerts(predictions: RiskPrediction[], language: Language): HealthAlert[] {
    const alerts: HealthAlert[] = [];

    predictions.forEach(prediction => {
      if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
        const alert = this.createHealthAlert(prediction, language);
        alerts.push(alert);
      }
    });

    return alerts;
  }

  /**
   * Get risk factors for specific industry
   */
  getIndustryRiskFactors(industry: Industry): RiskFactor[] {
    const industryRiskMap: Record<Industry, Partial<RiskFactor>[]> = {
      construction: [
        {
          type: 'physical',
          name: 'Heavy lifting and manual handling',
          severity: 'high',
          exposureLevel: 'high'
        },
        {
          type: 'environmental',
          name: 'Extreme weather exposure',
          severity: 'moderate',
          exposureLevel: 'high'
        },
        {
          type: 'chemical',
          name: 'Dust and silica exposure',
          severity: 'high',
          exposureLevel: 'moderate'
        }
      ],
      fishing: [
        {
          type: 'physical',
          name: 'Repetitive motions and strain',
          severity: 'moderate',
          exposureLevel: 'high'
        },
        {
          type: 'environmental',
          name: 'Cold and wet conditions',
          severity: 'moderate',
          exposureLevel: 'extreme'
        }
      ],
      manufacturing: [
        {
          type: 'chemical',
          name: 'Industrial chemical exposure',
          severity: 'high',
          exposureLevel: 'moderate'
        },
        {
          type: 'physical',
          name: 'Noise and vibration',
          severity: 'moderate',
          exposureLevel: 'high'
        }
      ],
      agriculture: [
        {
          type: 'chemical',
          name: 'Pesticide and herbicide exposure',
          severity: 'high',
          exposureLevel: 'moderate'
        },
        {
          type: 'biological',
          name: 'Zoonotic disease exposure',
          severity: 'moderate',
          exposureLevel: 'moderate'
        }
      ],
      // Add more industries as needed
      textiles: [],
      hospitality: [],
      domestic_work: [],
      transportation: [],
      food_processing: [],
      mining: [],
      oil_gas: []
    };

    return industryRiskMap[industry].map((partial, index) => ({
      id: `${industry}_${index}`,
      type: partial.type!,
      name: partial.name!,
      severity: partial.severity!,
      exposureLevel: partial.exposureLevel!,
      frequency: 'frequent' as const,
      protectiveEquipment: [],
      environmentalFactors: []
    }));
  }

  /**
   * Calculate environmental risk multipliers for Kerala
   */
  getKeralaEnvironmentalFactors(): Record<string, number> {
    return {
      monsoon_season: 1.3, // Higher risk during monsoons
      coastal_areas: 1.2, // Coastal humidity and salt exposure
      industrial_zones: 1.4, // Higher pollution in industrial areas
      rural_areas: 1.1, // Agricultural chemical exposure
      urban_heat_islands: 1.25 // Higher heat stress in cities
    };
  }

  // Private helper methods

  private async calculateRiskForCondition(
    profile: OccupationalProfile, 
    condition: OccupationalCondition
  ): Promise<RiskPrediction> {
    // Base risk score from condition prevalence
    let riskScore = condition.prevalenceRate;

    // Industry factor
    if (condition.commonIndustries.includes(profile.industry)) {
      riskScore *= 2.0; // Double risk if working in common industry
    }

    // Work environment factors
    riskScore *= this.calculateEnvironmentalRisk(profile.workEnvironment, condition);

    // Risk factor alignment
    riskScore *= this.calculateRiskFactorAlignment(profile.riskFactors, condition.riskFactors);

    // Work history impact
    riskScore *= this.calculateWorkHistoryImpact(profile.workHistory, condition);

    // Previous health assessments
    riskScore *= this.calculateHealthHistoryImpact(profile.healthAssessments, condition);

    // Kerala-specific environmental factors
    riskScore *= this.getKeralaEnvironmentalMultiplier(profile.industry);

    // Cap at 1.0
    riskScore = Math.min(riskScore, 1.0);

    const riskLevel = this.determineRiskLevel(riskScore);
    const timeframe = this.predictTimeframe(riskScore, condition);
    const contributingFactors = this.identifyContributingFactors(profile, condition);
    const preventionRecommendations = this.generatePreventionRecommendations(profile, condition);
    const monitoringAdvice = this.generateMonitoringAdvice(condition);

    return {
      id: `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      condition,
      riskScore,
      riskLevel,
      timeframe,
      contributingFactors,
      preventionRecommendations,
      monitoringAdvice,
      confidence: this.calculateConfidence(profile, riskScore),
      createdAt: new Date()
    };
  }

  private calculateEnvironmentalRisk(environment: WorkEnvironment, condition: OccupationalCondition): number {
    let multiplier = 1.0;

    // Temperature-related conditions
    if (condition.category === 'cardiovascular' && environment.temperature === 'extreme_heat') {
      multiplier *= 2.5;
    }

    // Respiratory conditions and poor ventilation
    if (condition.category === 'respiratory' && environment.ventilation === 'poor') {
      multiplier *= 2.0;
    }

    // Physical demands for musculoskeletal conditions
    if (condition.category === 'musculoskeletal') {
      if (environment.physicalDemands.heavyLifting) multiplier *= 1.5;
      if (environment.physicalDemands.repetitiveMotions) multiplier *= 1.3;
      if (environment.physicalDemands.prolongedStanding) multiplier *= 1.2;
    }

    return multiplier;
  }

  private calculateRiskFactorAlignment(profileRiskFactors: RiskFactor[], conditionRiskFactors: string[]): number {
    const alignedFactors = profileRiskFactors.filter(rf => 
      conditionRiskFactors.includes(rf.type)
    );

    if (alignedFactors.length === 0) return 0.5; // Low risk if no alignment

    // Calculate weighted risk based on severity and exposure
    const totalWeight = alignedFactors.reduce((sum, factor) => {
      const severityWeight = { low: 0.5, moderate: 1.0, high: 1.5, critical: 2.0 }[factor.severity];
      const exposureWeight = { minimal: 0.3, moderate: 0.7, high: 1.0, extreme: 1.3 }[factor.exposureLevel];
      return sum + (severityWeight * exposureWeight);
    }, 0);

    return Math.min(totalWeight / alignedFactors.length, 2.0);
  }

  private calculateWorkHistoryImpact(workHistory: any[], condition: OccupationalCondition): number {
    let multiplier = 1.0;

    // Cumulative exposure time in relevant industries
    const relevantHistory = workHistory.filter(wh => 
      condition.commonIndustries.includes(wh.industry)
    );

    const totalMonthsExposed = relevantHistory.reduce((sum, wh) => sum + wh.duration, 0);

    if (totalMonthsExposed > 60) multiplier *= 1.8; // 5+ years
    else if (totalMonthsExposed > 36) multiplier *= 1.5; // 3+ years
    else if (totalMonthsExposed > 12) multiplier *= 1.2; // 1+ years

    return multiplier;
  }

  private calculateHealthHistoryImpact(assessments: any[], condition: OccupationalCondition): number {
    if (assessments.length === 0) return 1.0;

    // Look for early indicators in recent assessments
    const recentAssessment = assessments.sort((a, b) => 
      b.assessmentDate.getTime() - a.assessmentDate.getTime()
    )[0];

    // Check for related symptoms
    const relatedSymptoms = recentAssessment.symptoms.filter((symptom: any) => 
      condition.symptoms.includes(symptom.symptomId) && symptom.workRelated
    );

    if (relatedSymptoms.length > 0) {
      const avgSeverity = relatedSymptoms.reduce((sum: number, s: any) => sum + s.severity, 0) / relatedSymptoms.length;
      return 1.0 + (avgSeverity / 10); // Severity is 1-10 scale
    }

    return 1.0;
  }

  private getKeralaEnvironmentalMultiplier(industry: Industry): number {
    const keralaFactors = this.getKeralaEnvironmentalFactors();
    
    // Apply relevant environmental factors based on industry
    let multiplier = 1.0;

    if (['construction', 'agriculture'].includes(industry)) {
      multiplier *= keralaFactors.monsoon_season;
    }
    
    if (['fishing', 'construction'].includes(industry)) {
      multiplier *= keralaFactors.coastal_areas;
    }

    if (['manufacturing', 'textiles'].includes(industry)) {
      multiplier *= keralaFactors.industrial_zones;
    }

    return multiplier;
  }

  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 0.8) return 'critical';
    if (riskScore >= 0.6) return 'high';
    if (riskScore >= 0.3) return 'moderate';
    return 'low';
  }

  private predictTimeframe(riskScore: number, condition: OccupationalCondition): any {
    // Acute conditions manifest faster
    const acuteConditions = ['heat_exhaustion'];
    if (acuteConditions.includes(condition.id)) {
      return riskScore > 0.7 ? '1_month' : '3_months';
    }

    // Chronic conditions develop over time
    if (riskScore >= 0.8) return '6_months';
    if (riskScore >= 0.6) return '1_year';
    if (riskScore >= 0.4) return '2_years';
    return '5_years';
  }

  private identifyContributingFactors(profile: OccupationalProfile, condition: OccupationalCondition): string[] {
    const factors: string[] = [];

    if (condition.commonIndustries.includes(profile.industry)) {
      factors.push(`Working in ${profile.industry} industry`);
    }

    profile.riskFactors.forEach(rf => {
      if (condition.riskFactors.includes(rf.type) && rf.severity !== 'low') {
        factors.push(`${rf.type} exposure: ${rf.name}`);
      }
    });

    // Environmental factors
    if (profile.workEnvironment.temperature === 'extreme_heat') {
      factors.push('Extreme heat exposure');
    }

    if (profile.workEnvironment.workSchedule.hoursPerDay > 10) {
      factors.push('Long working hours');
    }

    return factors;
  }

  private generatePreventionRecommendations(profile: OccupationalProfile, condition: OccupationalCondition): string[] {
    const recommendations: string[] = [];

    // Add general prevention from condition database
    recommendations.push(...condition.prevention.en);

    // Add specific recommendations based on profile
    if (condition.category === 'musculoskeletal' && profile.workEnvironment.physicalDemands.heavyLifting) {
      recommendations.push('Use mechanical lifting aids');
      recommendations.push('Implement job rotation schedules');
    }

    if (condition.category === 'respiratory') {
      recommendations.push('Ensure proper respiratory protection');
      recommendations.push('Regular lung function testing');
    }

    if (condition.category === 'cardiovascular' && profile.workEnvironment.temperature === 'extreme_heat') {
      recommendations.push('Implement heat stress prevention program');
      recommendations.push('Provide cooling stations and adequate hydration');
    }

    return Array.from(new Set(recommendations)); // Remove duplicates
  }

  private generateMonitoringAdvice(condition: OccupationalCondition): string[] {
    const advice: string[] = [];

    switch (condition.category) {
      case 'respiratory':
        advice.push('Annual spirometry testing');
        advice.push('Monitor for persistent cough or shortness of breath');
        break;
      case 'musculoskeletal':
        advice.push('Regular ergonomic assessments');
        advice.push('Monitor for pain, stiffness, or limited range of motion');
        break;
      case 'cardiovascular':
        advice.push('Regular blood pressure and heart rate monitoring');
        advice.push('Monitor for heat-related symptoms');
        break;
      default:
        advice.push('Regular health checkups');
        advice.push('Report any work-related symptoms immediately');
    }

    return advice;
  }

  private calculateConfidence(profile: OccupationalProfile, riskScore: number): number {
    let confidence = 0.7; // Base confidence

    // More data = higher confidence
    if (profile.workHistory.length > 0) confidence += 0.1;
    if (profile.healthAssessments.length > 0) confidence += 0.1;
    if (profile.riskFactors.length > 0) confidence += 0.1;

    // Extreme risk scores are less confident due to complexity
    if (riskScore > 0.9 || riskScore < 0.1) confidence -= 0.1;

    return Math.min(confidence, 1.0);
  }

  private createHealthAlert(prediction: RiskPrediction, language: Language): HealthAlert {
    const alertType: AlertType = prediction.riskLevel === 'critical' ? 'immediate_action' : 'early_warning';
    const severity: AlertSeverity = prediction.riskLevel === 'critical' ? 'critical' : 'warning';

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertType,
      severity,
      condition: prediction.condition,
      message: {
        en: `High risk detected for ${prediction.condition.name.en}. Risk score: ${Math.round(prediction.riskScore * 100)}%`,
        hi: `${prediction.condition.name.hi} के लिए उच्च जोखिम का पता चला। जोखिम स्कोर: ${Math.round(prediction.riskScore * 100)}%`,
        ml: `${prediction.condition.name.ml} നായുള്ള ഉയർന്ന റിസ്ക് കണ്ടെത്തി. റിസ്ക് സ്കോർ: ${Math.round(prediction.riskScore * 100)}%`,
        bn: `${prediction.condition.name.bn} এর জন্য উচ্চ ঝুঁকি সনাক্ত করা হয়েছে। ঝুঁকি স্কোর: ${Math.round(prediction.riskScore * 100)}%`,
        or: `${prediction.condition.name.or} ପାଇଁ ଉଚ୍ଚ ବିପଦ ଚିହ୍ନଟ ହୋଇଛି। ବିପଦ ସ୍କୋର: ${Math.round(prediction.riskScore * 100)}%`,
        ta: `${prediction.condition.name.ta} க்கான உயர் ஆபத்து கண்டறியப்பட்டது. ஆபத்து மதிப்பெண்: ${Math.round(prediction.riskScore * 100)}%`,
        ne: `${prediction.condition.name.ne} को लागि उच्च जोखिम पत्ता लाग्यो। जोखिम स्कोर: ${Math.round(prediction.riskScore * 100)}%`
      },
      recommendations: {
        en: prediction.preventionRecommendations,
        hi: prediction.preventionRecommendations, // In real app, translate these
        ml: prediction.preventionRecommendations,
        bn: prediction.preventionRecommendations,
        or: prediction.preventionRecommendations,
        ta: prediction.preventionRecommendations,
        ne: prediction.preventionRecommendations
      },
      isActive: true,
      triggerDate: new Date()
    };
  }
}

// Export singleton instance
export const occupationalRiskPredictor = new OccupationalRiskPredictor();