# 🏥 Kerala Migrant Health System

[![Next.js](https://img.shields.io/badge/Next.js-13+-blueviolet.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.io/)
[![Vapi.ai](https://img.shields.io/badge/Vapi.ai-Voice%20AI-orange.svg)](https://vapi.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Voice-First Digital Health Record Management System for Migrant Workers in Kerala**

A futuristic, multilingual, voice-first digital health record management system designed specifically for migrant workers in Kerala. Built to support UN Sustainable Development Goals with cutting-edge voice AI technology, real-time disease surveillance, and zero-literacy friendly interfaces.

[Kerala Health System](https://shramik-care.vercel.app/)

## 🌟 Key Features

### 🎤 **Voice-First Interface**
- **Multilingual Voice AI** powered by Vapi.ai
- Supports 7 languages: English, Hindi, Bengali, Odia, Tamil, Nepali, Malayalam
- Zero-literacy friendly design for universal accessibility
- Real-time voice-to-health record conversion 

### 🆔 **Digital Health Identity**
- **Migrant Health ID (MHI)** generation with QR codes
- Instant SMS confirmations in native languages
- Secure, privacy-compliant health wallet
- Cross-district healthcare access

### 🗺️ **Real-Time Disease Surveillance**
- **3D Interactive Kerala Map** with Three.js
- Live disease hotspot visualization
- Automated outbreak detection and alerts
- Public health intelligence dashboard

### 🔒 **Privacy & Security**
- **Anonymous Health Reporting** option
- GDPR and NDHM compliant data handling
- Row-level security with Supabase
- End-to-end encryption for sensitive data

### 🏭 **Occupational Health Intelligence**
- Job-specific health risk predictions
- Preventive care recommendations
- Environmental health monitoring
- Industry-specific health protocols

## 🚀 Tech Stack

### Frontend
- **Next.js 13+** - App Router with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Advanced animations
- **Three.js** - 3D visualizations
- **React Hooks** - State management

### Backend & Database
- **Supabase** - PostgreSQL with real-time subscriptions
- **Row Level Security (RLS)** - Data privacy
- **Edge Functions** - Serverless computing
- **PostGIS** - Geospatial data handling

### AI & Voice
- **Vapi.ai** - Voice AI platform
- **Speech Recognition API** - Browser-native voice input
- **Text-to-Speech** - Multilingual voice feedback
- **NLP Processing** - Symptom and data extraction

### DevOps & Security
- **Vercel/Netlify** - Deployment platform
- **GitHub Actions** - CI/CD pipeline
- **JWT Authentication** - Secure admin access
- **Healthcare Compliance** - HIPAA/GDPR aligned

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Vapi.ai account with API access
- Modern web browser with microphone access

### 1. Clone the Repository
```bash
git clone https://github.com/kerala-gov/migrant-health-system.git
cd migrant-health-system
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Vapi.ai Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_ASSISTANT_EN=your_english_assistant_id
# ... (other language assistants)
```

### 4. Database Setup
```bash
# Run the SQL schema in your Supabase dashboard
psql -f supabase-schema.sql
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage Guide

### For Migrant Workers

#### 📞 **Voice Registration**
1. Call the designated health number: `+91-XXX-HEALTH`
2. Select your preferred language
3. Follow voice prompts to provide:
   - Personal information (name, age, gender)
   - Current location in Kerala
   - Occupation type
   - Health symptoms (if any)
   - Emergency contact details

#### 💱 **Health ID Access**
1. Receive your **Migrant Health ID (MHI)** via SMS
2. Show QR code at any healthcare facility
3. Access complete health records instantly
4. Update information through voice calls

#### 🆘 **Emergency Reporting**
1. Call **108** for medical emergencies
2. Use anonymous reporting for privacy
3. Get multilingual health guidance
4. Receive location-based care recommendations

### For Healthcare Providers :

#### 👨‍⚕️ **Doctor Dashboard**
- Access patient records via MHI scan
- View multilingual health history
- Add diagnosis and treatment notes
- Schedule follow-up appointments

#### 📊 **Health Surveillance**
- Monitor district-wise health trends
- Receive outbreak alerts automatically
- Export epidemiological data
- Coordinate public health responses

#### 🏥 **Facility Management**
- Track kiosk usage and accessibility
- Manage multilingual support staff
- Monitor system performance metrics
- Update local health protocols

## 🌍 UN SDG Alignment

This project directly supports:

### **SDG 3: Good Health and Well-being** 🏥
- Universal healthcare access for migrants
- Disease prevention and health promotion
- Mental health and well-being support

### **SDG 10: Reduced Inequalities** ⚖️
- Equal healthcare access regardless of language
- Elimination of documentation barriers
- Social inclusion through technology

### **SDG 11: Sustainable Cities and Communities** 🌱
- Public health infrastructure strengthening
- Community resilience building
- Smart city health integration

## 🔧 API Documentation

### Voice AI Integration
```typescript
// Vapi.ai webhook endpoint
POST /api/vapi/webhook
{
  "type": "call.ended",
  "call_id": "call_123",
  "transcript": "My name is John, I have fever...",
  "extracted_data": {
    "symptoms": ["fever"],
    "urgency": "medium"
  }
}
```

### Health Records API
```typescript
// Create health record
POST /api/health-records
{
  "worker_id": "KER20241234ABCD",
  "symptoms": ["fever", "cough"],
  "severity": "medium",
  "location": {
    "district": "ernakulam",
    "coordinates": {"lat": 9.9312, "lng": 76.2673}
  }
}
```

### Disease Surveillance API
```typescript
// Get disease hotspots
GET /api/surveillance/hotspots?district=ernakulam
{
  "hotspots": [
    {
      "location": {"district": "ernakulam", "lat": 9.9312, "lng": 76.2673},
      "cases_count": 12,
      "primary_symptoms": ["fever", "cough"],
      "risk_level": "high"
    }
  ]
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Voice AI Testing
```bash
npm run test:voice
```

### Accessibility Testing
```bash
npm run test:a11y
```

## 🚀 Deployment

### Production Deployment
```bash
npm run build
npm run start
```

### Vercel Deployment
```bash
vercel --prod
```

### Environment Variables for Production
- Set all required environment variables
- Enable production optimizations
- Configure CDN and caching
- Set up monitoring and alerts

## 🤝 Contributing

We welcome contributions from developers, healthcare professionals, and community members!

### Development Guidelines
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Component testing with Jest
- Accessibility compliance (WCAG 2.1)
- Healthcare data privacy standards

### Translation Contributors
We need native speakers to improve translations for:
- Hindi (हिन्दी)
- Bengali (বাংলা)  
- Odia (ଓଡ଼ିଆ)
- Tamil (தமிழ்)
- Nepali (नेपाली)
- Malayalam (മലയാളം)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Government of Kerala** - Health Service Department
- **UN Sustainable Development Goals** - Framework and inspiration
- **Vapi.ai** - Voice AI platform and support
- **Supabase** - Database and backend infrastructure
- **Open Source Community** - Tools and libraries

## 📞 Support & Contact

### Technical Support
- **Email**: tech-support@kerala-health-system.gov.in
- **Phone**: +91-XXX-XXX-XXXX (9 AM - 6 PM IST)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/kerala-gov/migrant-health-system/issues)

### Healthcare Support
- **Emergency**: 108 (24/7)
- **Health Helpline**: 104 (24/7)
- **Migrant Worker Helpline**: +91-XXX-MIGRANT (24/7)

### Government Contacts
**Health Service Department, Government of Kerala**
- Address: Thiruvananthapuram, Kerala, India - 695001
- Website: [health.kerala.gov.in](https://health.kerala.gov.in)
- Email: health@kerala.gov.in

---

**Built with ❤️ for migrant workers in Kerala, India**

**Supporting UN SDGs • Powered by Voice AI • Privacy First • Zero Literacy Barriers**
