import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { vapiClient } from '@/lib/vapi';
import { supabase, dbHelpers, generateMHI } from '@/lib/supabase';
import type { VapiWebhook, Language } from '@/types';

// Webhook endpoint for Vapi.ai voice calls
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const headersList = await headers();
    const signature = headersList.get('x-vapi-signature');
    
    if (!signature) {
      console.error('Missing Vapi signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const webhook: VapiWebhook = body;

    console.log('Vapi webhook received:', webhook.type, webhook.call_id);

    // Process different webhook events
    switch (webhook.type) {
      case 'call.started':
        await handleCallStarted(webhook);
        break;
        
      case 'call.ended':
        await handleCallEnded(webhook);
        break;
        
      case 'transcript.updated':
        await handleTranscriptUpdated(webhook);
        break;
        
      default:
        console.log('Unhandled webhook type:', webhook.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCallStarted(webhook: VapiWebhook) {
  try {
    // Log the call start in voice_sessions table
    await dbHelpers.createVoiceSession({
      call_id: webhook.call_id,
      worker_id: undefined, // Will be updated when we identify the worker
      language: extractLanguageFromMetadata(webhook.data),
      transcript: '',
      extracted_data: {},
      session_duration: 0,
      call_status: 'started',
      webhook_data: webhook.data
    });

    console.log(`Call started: ${webhook.call_id}`);
  } catch (error) {
    console.error('Error handling call started:', error);
  }
}

async function handleCallEnded(webhook: VapiWebhook) {
  try {
    const callData = webhook.data;
    const transcript = callData?.transcript || '';
    const duration = callData?.duration || 0;
    const language = extractLanguageFromMetadata(callData) as Language;

    // Update voice session with final data
    const { data: existingSession } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('call_id', webhook.call_id)
      .single();

    if (existingSession) {
      // Extract health data from transcript
      const extractedData = vapiClient.extractHealthData(transcript, language);
      
      // Update the voice session
      await dbHelpers.updateVoiceSession(webhook.call_id, {
        transcript,
        extracted_data: extractedData,
        session_duration: duration,
        call_status: 'completed',
        webhook_data: callData
      });

      // Create health records if we have enough information
      if (extractedData.symptoms && extractedData.symptoms.length > 0) {
        await createHealthRecordFromVoice(extractedData, language, webhook.call_id);
      }
    }

    console.log(`Call ended: ${webhook.call_id}, Duration: ${duration}s`);
  } catch (error) {
    console.error('Error handling call ended:', error);
  }
}

async function handleTranscriptUpdated(webhook: VapiWebhook) {
  try {
    const transcript = webhook.data?.transcript || '';
    
    // Update the voice session with the latest transcript
    await dbHelpers.updateVoiceSession(webhook.call_id, {
      transcript,
      webhook_data: webhook.data
    });

    console.log(`Transcript updated for call: ${webhook.call_id}`);
  } catch (error) {
    console.error('Error handling transcript update:', error);
  }
}

async function createHealthRecordFromVoice(
  extractedData: any,
  language: Language,
  callId: string
) {
  try {
    // Generate MHI for the worker
    const mhiId = generateMHI();

    // Create migrant worker record
    const workerData = {
      mhi_id: mhiId,
      name: extractedData.name || 'Voice Registration',
      age: extractedData.age || 0,
      gender: extractedData.gender || 'other',
      phone: extractedData.phone,
      languages: [language],
      occupation: extractedData.occupation || 'other',
      current_location: {
        district: extractedData.location || 'unknown',
        panchayat: 'unknown',
        coordinates: { lat: 0, lng: 0 }
      },
      is_active: true
    };

    const worker = await dbHelpers.createWorker(workerData);

    // Create health record
    const healthRecordData = {
      worker_id: worker.id,
      symptoms: extractedData.symptoms,
      severity: extractedData.urgency || 'low',
      reported_at: new Date().toISOString(),
      reported_via: 'voice' as const,
      is_anonymous: false,
      location: workerData.current_location,
      follow_up_required: extractedData.urgency === 'high' || extractedData.urgency === 'critical',
      notes: `Created from voice call: ${callId}`
    };

    const healthRecord = await dbHelpers.createHealthRecord(healthRecordData);

    // Update voice session with worker ID
    await dbHelpers.updateVoiceSession(callId, { worker_id: worker.id });

    // Send SMS confirmation with MHI
    await sendMHIConfirmation(worker.phone, mhiId, language);

    // Check if this creates a disease hotspot
    await checkDiseaseHotspot(extractedData, workerData.current_location);

    console.log(`Health record created for call ${callId}, MHI: ${mhiId}`);
    
    return { worker, healthRecord };
  } catch (error) {
    console.error('Error creating health record from voice:', error);
    throw error;
  }
}

async function sendMHIConfirmation(phone: string, mhiId: string, language: Language) {
  try {
    if (!phone) return;

    const messages: Record<Language, string> = {
      en: `Kerala Health System: Your Migrant Health ID is ${mhiId}. Save this ID for healthcare access. Emergency: 108`,
      hi: `केरल स्वास्थ्य सिस्टम: आपका प्रवासी स्वास्थ्य आईडी ${mhiId} है। स्वास्थ्य सेवा के लिए इस आईडी को सेव करें। आपातकाल: 108`,
      ml: `കേരള ഹെൽത്ത് സിസ്റ്റം: നിങ്ങളുടെ മൈഗ്രന്റ് ഹെൽത്ത് ഐഡി ${mhiId} ആണ്. ആരോഗ്യ സേവനങ്ങൾക്കായി ഈ ഐഡി സേവ് ചെയ്യുക. അത്യാഹിതം: 108`,
      bn: `Kerala Health System: Your Migrant Health ID is ${mhiId}. Save this ID for healthcare access. Emergency: 108`,
      or: `Kerala Health System: Your Migrant Health ID is ${mhiId}. Save this ID for healthcare access. Emergency: 108`,
      ta: `Kerala Health System: Your Migrant Health ID is ${mhiId}. Save this ID for healthcare access. Emergency: 108`,
      ne: `Kerala Health System: Your Migrant Health ID is ${mhiId}. Save this ID for healthcare access. Emergency: 108`
    };

    const message = messages[language];

    // Log SMS for sending (actual SMS integration would go here)
    await (supabase as any)
      .from('sms_notifications')
      .insert({
        recipient_phone: phone,
        message,
        language,
        purpose: 'mhi_confirmation',
        status: 'pending'
      });

    console.log(`MHI confirmation queued for ${phone}: ${mhiId}`);
  } catch (error) {
    console.error('Error sending MHI confirmation:', error);
  }
}

async function checkDiseaseHotspot(extractedData: any, location: any) {
  try {
    if (!extractedData.symptoms || !location.district) return;

    // Get recent cases in the same district
    const { data: recentCases } = await supabase
      .from('health_records')
      .select('symptoms, reported_at')
      .eq('location->>district', location.district)
      .gte('reported_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (recentCases && recentCases.length >= 5) {
      // Check if symptoms overlap significantly
      const commonSymptoms = findCommonSymptoms(recentCases, extractedData.symptoms);
      
      if (commonSymptoms.length > 0) {
        // Create disease surveillance record
        await (supabase as any)
          .from('disease_surveillance')
          .insert({
            district: location.district,
            disease_type: commonSymptoms.join(', '),
            cases_count: recentCases.length,
            location_coordinates: location.coordinates,
            severity_level: 'medium',
            status: 'active',
            alert_triggered: true,
            notes: `Potential outbreak detected via voice registration system`
          });

        console.log(`Disease hotspot detected in ${location.district}: ${commonSymptoms.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('Error checking disease hotspot:', error);
  }
}

function findCommonSymptoms(cases: any[], newSymptoms: string[]): string[] {
  const symptomCounts: Record<string, number> = {};
  const totalCases = cases.length + 1; // Include the new case

  // Count existing symptoms
  cases.forEach(healthCase => {
    if (healthCase.symptoms && Array.isArray(healthCase.symptoms)) {
      healthCase.symptoms.forEach((symptom: string) => {
        symptomCounts[symptom.toLowerCase()] = (symptomCounts[symptom.toLowerCase()] || 0) + 1;
      });
    }
  });

  // Add new symptoms
  newSymptoms.forEach(symptom => {
    symptomCounts[symptom.toLowerCase()] = (symptomCounts[symptom.toLowerCase()] || 0) + 1;
  });

  // Find symptoms that appear in at least 60% of cases
  const threshold = Math.ceil(totalCases * 0.6);
  return Object.entries(symptomCounts)
    .filter(([_, count]) => count >= threshold)
    .map(([symptom, _]) => symptom);
}

function extractLanguageFromMetadata(data: any): Language {
  // Extract language from call metadata
  const language = data?.metadata?.language || data?.assistant?.language || 'en';
  
  // Validate language
  const validLanguages: Language[] = ['en', 'hi', 'bn', 'or', 'ta', 'ne', 'ml'];
  return validLanguages.includes(language) ? language : 'en';
}

// GET endpoint for testing webhook
export async function GET() {
  return NextResponse.json({ 
    message: 'Vapi webhook endpoint active',
    timestamp: new Date().toISOString() 
  });
}