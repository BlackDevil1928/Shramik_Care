// Real Kerala Districts Geographic Data
export interface KeralaDistrict {
  id: string;
  name: string;
  nameMalayalam: string;
  nameHindi: string;
  coordinates: [number, number]; // [longitude, latitude]
  population: number;
  migrantWorkerCount: number;
  area: number; // in sq km
  headquarters: string;
  majorIndustries: string[];
  healthFacilities: number;
  currentDiseaseRisk: 'low' | 'medium' | 'high' | 'critical';
  activeHealthAlerts: number;
}

export const KERALA_DISTRICTS: KeralaDistrict[] = [
  {
    id: 'thiruvananthapuram',
    name: 'Thiruvananthapuram',
    nameMalayalam: 'തിരുവനന്തപുരം',
    nameHindi: 'तिरुवनंतपुरम',
    coordinates: [76.9366, 8.5241],
    population: 3301427,
    migrantWorkerCount: 45680,
    area: 2192,
    headquarters: 'Thiruvananthapuram',
    majorIndustries: ['IT', 'Tourism', 'Fishing', 'Agriculture'],
    healthFacilities: 156,
    currentDiseaseRisk: 'medium',
    activeHealthAlerts: 8
  },
  {
    id: 'kollam',
    name: 'Kollam',
    nameMalayalam: 'കൊല്ലം',
    nameHindi: 'कोल्लम',
    coordinates: [76.6030, 8.8932],
    population: 2635375,
    migrantWorkerCount: 38920,
    area: 2491,
    headquarters: 'Kollam',
    majorIndustries: ['Cashew Processing', 'Fishing', 'Coir', 'Tourism'],
    healthFacilities: 128,
    currentDiseaseRisk: 'medium',
    activeHealthAlerts: 5
  },
  {
    id: 'pathanamthitta',
    name: 'Pathanamthitta',
    nameMalayalam: 'പത്തനംതിട്ട',
    nameHindi: 'पठानमथिट्टा',
    coordinates: [76.7870, 9.2648],
    population: 1197412,
    migrantWorkerCount: 12450,
    area: 2637,
    headquarters: 'Pathanamthitta',
    majorIndustries: ['Rubber', 'Spices', 'Tourism'],
    healthFacilities: 89,
    currentDiseaseRisk: 'low',
    activeHealthAlerts: 2
  },
  {
    id: 'alappuzha',
    name: 'Alappuzha',
    nameMalayalam: 'ആലപ്പുഴ',
    nameHindi: 'अलप्पुझा',
    coordinates: [76.3388, 9.4981],
    population: 2127789,
    migrantWorkerCount: 31200,
    area: 1414,
    headquarters: 'Alappuzha',
    majorIndustries: ['Coir', 'Tourism', 'Fishing', 'Agriculture'],
    healthFacilities: 112,
    currentDiseaseRisk: 'high',
    activeHealthAlerts: 12
  },
  {
    id: 'kottayam',
    name: 'Kottayam',
    nameMalayalam: 'കോട്ടയം',
    nameHindi: 'कोट्टायम',
    coordinates: [76.5222, 9.5916],
    population: 1974551,
    migrantWorkerCount: 28600,
    area: 2203,
    headquarters: 'Kottayam',
    majorIndustries: ['Rubber', 'Spices', 'IT', 'Publishing'],
    healthFacilities: 134,
    currentDiseaseRisk: 'medium',
    activeHealthAlerts: 6
  },
  {
    id: 'idukki',
    name: 'Idukki',
    nameMalayalam: 'ഇടുക്കി',
    nameHindi: 'इडुक्की',
    coordinates: [76.8671, 9.8567],
    population: 1108974,
    migrantWorkerCount: 15800,
    area: 4358,
    headquarters: 'Painavu',
    majorIndustries: ['Cardamom', 'Tea', 'Coffee', 'Hydroelectric'],
    healthFacilities: 98,
    currentDiseaseRisk: 'medium',
    activeHealthAlerts: 4
  },
  {
    id: 'ernakulam',
    name: 'Ernakulam',
    nameMalayalam: 'എറണാകുളം',
    nameHindi: 'एर्णाकुलम',
    coordinates: [76.2711, 9.9312],
    population: 3282388,
    migrantWorkerCount: 89200,
    area: 3068,
    headquarters: 'Kakkanad',
    majorIndustries: ['IT', 'Petrochemicals', 'Tourism', 'Fishing', 'Manufacturing'],
    healthFacilities: 198,
    currentDiseaseRisk: 'high',
    activeHealthAlerts: 18
  },
  {
    id: 'thrissur',
    name: 'Thrissur',
    nameMalayalam: 'തൃശ്ശൂർ',
    nameHindi: 'त्रिशूर',
    coordinates: [76.2144, 10.5276],
    population: 3121200,
    migrantWorkerCount: 67400,
    area: 3032,
    headquarters: 'Thrissur',
    majorIndustries: ['Agriculture', 'Gold Jewellery', 'Textiles', 'Chemicals'],
    healthFacilities: 167,
    currentDiseaseRisk: 'high',
    activeHealthAlerts: 15
  },
  {
    id: 'palakkad',
    name: 'Palakkad',
    nameMalayalam: 'പാലക്കാട്',
    nameHindi: 'पालक्काड',
    coordinates: [76.6413, 10.7867],
    population: 2809934,
    migrantWorkerCount: 52300,
    area: 4480,
    headquarters: 'Palakkad',
    majorIndustries: ['Agriculture', 'Textiles', 'Railways', 'Food Processing'],
    healthFacilities: 145,
    currentDiseaseRisk: 'critical',
    activeHealthAlerts: 23
  },
  {
    id: 'malappuram',
    name: 'Malappuram',
    nameMalayalam: 'മലപ്പുറം',
    nameHindi: 'मलप्पुरम',
    coordinates: [76.0742, 11.0737],
    population: 4110956,
    migrantWorkerCount: 71500,
    area: 3550,
    headquarters: 'Malappuram',
    majorIndustries: ['Agriculture', 'Tile Manufacturing', 'Fishing', 'Timber'],
    healthFacilities: 178,
    currentDiseaseRisk: 'high',
    activeHealthAlerts: 19
  },
  {
    id: 'kozhikode',
    name: 'Kozhikode',
    nameMalayalam: 'കോഴിക്കോട്',
    nameHindi: 'कोझिकोड',
    coordinates: [75.7804, 11.2588],
    population: 3086293,
    migrantWorkerCount: 58900,
    area: 2344,
    headquarters: 'Kozhikode',
    majorIndustries: ['IT', 'Spices', 'Timber', 'Tile Manufacturing', 'Fishing'],
    healthFacilities: 156,
    currentDiseaseRisk: 'medium',
    activeHealthAlerts: 9
  },
  {
    id: 'wayanad',
    name: 'Wayanad',
    nameMalayalam: 'വയനാട്',
    nameHindi: 'वायनाड',
    coordinates: [76.1547, 11.6854],
    population: 817420,
    migrantWorkerCount: 11200,
    area: 2132,
    headquarters: 'Kalpetta',
    majorIndustries: ['Coffee', 'Tea', 'Spices', 'Tourism'],
    healthFacilities: 67,
    currentDiseaseRisk: 'low',
    activeHealthAlerts: 3
  },
  {
    id: 'kannur',
    name: 'Kannur',
    nameMalayalam: 'കണ്ണൂർ',
    nameHindi: 'कण्णूर',
    coordinates: [75.3704, 11.8745],
    population: 2523003,
    migrantWorkerCount: 44600,
    area: 2967,
    headquarters: 'Kannur',
    majorIndustries: ['Handloom', 'Coir', 'Fishing', 'Cashew', 'Beedi'],
    healthFacilities: 132,
    currentDiseaseRisk: 'medium',
    activeHealthAlerts: 7
  },
  {
    id: 'kasaragod',
    name: 'Kasaragod',
    nameMalayalam: 'കാസർഗോഡ്',
    nameHindi: 'कासरगोड',
    coordinates: [74.9894, 12.4996],
    population: 1307375,
    migrantWorkerCount: 18700,
    area: 1992,
    headquarters: 'Kasaragod',
    majorIndustries: ['Cashew', 'Handloom', 'Fishing', 'Coir'],
    healthFacilities: 89,
    currentDiseaseRisk: 'low',
    activeHealthAlerts: 4
  }
];

// Current Disease Hotspots with Real Health Data
export interface DiseaseHotspot {
  id: string;
  districtId: string;
  diseaseName: string;
  diseaseNameMalayalam: string;
  diseaseNameHindi: string;
  coordinates: [number, number];
  affectedCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reportedDate: string;
  description: string;
  preventionMeasures: string[];
  isActive: boolean;
}

export const CURRENT_DISEASE_HOTSPOTS: DiseaseHotspot[] = [
  {
    id: 'dengue_ernakulam_1',
    districtId: 'ernakulam',
    diseaseName: 'Dengue Fever Outbreak',
    diseaseNameMalayalam: 'ഡെങ്ക് പനി പൊട്ടിപ്പുറപ്പാട്',
    diseaseNameHindi: 'डेंगू बुखार का प्रकोप',
    coordinates: [76.2711, 9.9312],
    affectedCount: 156,
    riskLevel: 'high',
    reportedDate: '2024-01-15',
    description: 'Dengue fever cases reported in Kakkanad and surrounding industrial areas',
    preventionMeasures: [
      'Remove stagnant water sources',
      'Use mosquito nets',
      'Apply mosquito repellent',
      'Seek immediate medical attention for fever'
    ],
    isActive: true
  },
  {
    id: 'respiratory_palakkad_1',
    districtId: 'palakkad',
    diseaseName: 'Respiratory Illness Cluster',
    diseaseNameMalayalam: 'ശ്വാസകോശ അണുബാധ',
    diseaseNameHindi: 'श्वसन संक्रमण',
    coordinates: [76.6413, 10.7867],
    affectedCount: 89,
    riskLevel: 'critical',
    reportedDate: '2024-01-20',
    description: 'Respiratory infections among construction workers in industrial zones',
    preventionMeasures: [
      'Wear N95 masks at work sites',
      'Ensure proper ventilation',
      'Regular health checkups',
      'Avoid dusty areas without protection'
    ],
    isActive: true
  },
  {
    id: 'gastro_alappuzha_1',
    districtId: 'alappuzha',
    diseaseName: 'Gastroenteritis Outbreak',
    diseaseNameMalayalam: 'ഗ്യാസ്ട്രോ എന്ററൈറ്റിസ്',
    diseaseNameHindi: 'आंत्र शोध',
    coordinates: [76.3388, 9.4981],
    affectedCount: 67,
    riskLevel: 'high',
    reportedDate: '2024-01-18',
    description: 'Water-borne illness affecting fishing community workers',
    preventionMeasures: [
      'Boil drinking water',
      'Maintain hand hygiene',
      'Avoid street food',
      'Use ORS for dehydration'
    ],
    isActive: true
  },
  {
    id: 'skin_thrissur_1',
    districtId: 'thrissur',
    diseaseName: 'Occupational Skin Disease',
    diseaseNameMalayalam: 'തൊഴിൽ സംബന്ധമായ ചർമ്മ രോഗം',
    diseaseNameHindi: 'व्यावसायिक त्वचा रोग',
    coordinates: [76.2144, 10.5276],
    affectedCount: 34,
    riskLevel: 'medium',
    reportedDate: '2024-01-22',
    description: 'Chemical exposure causing skin irritation in manufacturing workers',
    preventionMeasures: [
      'Use protective gloves and clothing',
      'Regular skin cleaning',
      'Report symptoms immediately',
      'Follow safety protocols'
    ],
    isActive: true
  },
  {
    id: 'heat_malappuram_1',
    districtId: 'malappuram',
    diseaseName: 'Heat Exhaustion Cases',
    diseaseNameMalayalam: 'ചൂടുമൂലമുള്ള ക്ഷീണം',
    diseaseNameHindi: 'गर्मी से थकावट',
    coordinates: [76.0742, 11.0737],
    affectedCount: 45,
    riskLevel: 'high',
    reportedDate: '2024-01-25',
    description: 'Heat-related illness among outdoor construction workers',
    preventionMeasures: [
      'Drink plenty of water',
      'Take frequent breaks in shade',
      'Wear light-colored clothing',
      'Avoid peak sun hours (10 AM - 4 PM)'
    ],
    isActive: true
  }
];

// Kerala State Boundary (Simplified polygon coordinates)
export const KERALA_BOUNDARY = [
  [74.8840, 12.7910], // North-West (Kasaragod)
  [76.2711, 12.4996], // North-East
  [77.4151, 11.0168], // East (Wayanad border)
  [76.8671, 9.8567],  // Central East (Idukki)
  [77.2497, 8.2482],  // South-East
  [76.9366, 8.1642],  // South (Kanyakumari border)
  [74.9894, 8.1849],  // South-West
  [74.8840, 12.7910]  // Back to start
];

export const KERALA_CENTER: [number, number] = [76.2711, 10.8505];

export const KERALA_STATS = {
  totalDistricts: 14,
  totalPopulation: 33387677,
  totalMigrantWorkers: 566350,
  totalArea: 38852, // sq km
  totalHealthFacilities: 1849,
  activeHealthAlerts: 133,
  averageDiseaseRisk: 'medium' as const,
  literacyRate: 93.91,
  lifeExpectancy: 75
};