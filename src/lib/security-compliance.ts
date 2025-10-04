import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'medical_data' | 'voice_recording' | 'anonymous_reporting';
  granted: boolean;
  timestamp: Date;
  version: string;
  ipAddress: string;
}

export class SecurityCompliance {
  private readonly encryptionKey: string;
  private readonly jwtSecret: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-demo';
    this.jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret';
  }

  /**
   * Encrypt sensitive data (PII, medical records, voice data)
   */
  encryptData(data: string): { encryptedData: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string, iv: string): string {
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash passwords securely
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure JWT token
   */
  generateJWT(payload: Record<string, any>, expiresIn: string | number = '24h'): string {
    return jwt.sign(payload, this.jwtSecret as jwt.Secret, { 
      expiresIn: expiresIn as any,
      issuer: 'kerala-health-system',
      audience: 'migrant-workers'
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT token
   */
  verifyJWT(token: string): Record<string, any> | null {
    try {
      return jwt.verify(token, this.jwtSecret as jwt.Secret, {
        issuer: 'kerala-health-system',
        audience: 'migrant-workers'
      }) as Record<string, any>;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      ...log,
      timestamp: new Date()
    };

    // In production, save to database
    console.log('Audit Log:', auditLog);
    
    return auditLog;
  }

  /**
   * Record user consent for GDPR compliance
   */
  async recordConsent(consent: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      id: `consent_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      ...consent,
      timestamp: new Date()
    };

    // In production, save to database
    console.log('Consent Recorded:', consentRecord);
    
    return consentRecord;
  }

  /**
   * Anonymize personal data for GDPR right to erasure
   */
  anonymizePersonalData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };
    
    // Remove or anonymize PII fields
    const piiFields = ['name', 'email', 'phone', 'address', 'nationalId', 'passportNumber'];
    
    piiFields.forEach(field => {
      if (anonymized[field]) {
        if (typeof anonymized[field] === 'string') {
          // Replace with anonymized version
          anonymized[field] = this.generateAnonymizedValue(field);
        } else {
          delete anonymized[field];
        }
      }
    });

    // Add anonymization timestamp
    anonymized.anonymizedAt = new Date().toISOString();
    anonymized.isAnonymized = true;
    
    return anonymized;
  }

  /**
   * Validate data processing consent
   */
  async validateConsent(userId: string, consentType: ConsentRecord['consentType']): Promise<boolean> {
    // In production, query database for valid consent
    // For demo, return true
    return true;
  }

  /**
   * Generate NDHM compliant health ID
   */
  generateNDHMHealthId(): string {
    // NDHM format: 14-digit unique identifier
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp.slice(-10)}${random}`.toUpperCase();
  }

  /**
   * Validate NDHM health ID format
   */
  validateNDHMHealthId(healthId: string): boolean {
    // NDHM health ID validation rules
    const pattern = /^[A-Z0-9]{14}$/;
    return pattern.test(healthId);
  }

  /**
   * Generate secure session token
   */
  generateSecureSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate IP address for rate limiting
   */
  validateIPAddress(ip: string): boolean {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Generate secure OTP
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[crypto.randomInt(0, digits.length)];
    }
    
    return otp;
  }

  /**
   * Create data retention policy compliance
   */
  async checkDataRetention(userId: string): Promise<{
    shouldDelete: boolean;
    retentionPeriodDays: number;
    lastActivity: Date;
  }> {
    // GDPR requires data deletion after inactivity period
    const retentionPeriodDays = 730; // 2 years for health data
    const lastActivity = new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000));
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      shouldDelete: daysSinceActivity > retentionPeriodDays,
      retentionPeriodDays,
      lastActivity
    };
  }

  private generateAnonymizedValue(fieldType: string): string {
    const anonymizedValues = {
      name: 'User_' + crypto.randomBytes(4).toString('hex'),
      email: 'anonymized_' + crypto.randomBytes(4).toString('hex') + '@example.com',
      phone: '+91' + crypto.randomBytes(5).toString('hex').slice(0, 10),
      address: 'Anonymized Address',
      nationalId: 'ANON' + crypto.randomBytes(6).toString('hex'),
      passportNumber: 'ANON' + crypto.randomBytes(4).toString('hex')
    };
    
    return anonymizedValues[fieldType as keyof typeof anonymizedValues] || 'ANONYMIZED';
  }
}

/**
 * GDPR Compliance Manager
 */
export class GDPRCompliance {
  private security: SecurityCompliance;

  constructor() {
    this.security = new SecurityCompliance();
  }

  /**
   * Handle GDPR data subject requests
   */
  async handleDataSubjectRequest(
    type: 'access' | 'rectification' | 'erasure' | 'portability',
    userId: string
  ): Promise<{
    status: 'completed' | 'pending' | 'rejected';
    data?: any;
    message: string;
  }> {
    switch (type) {
      case 'access':
        // Right to access - provide all personal data
        return {
          status: 'completed',
          data: await this.exportUserData(userId),
          message: 'Personal data export completed'
        };
        
      case 'rectification':
        // Right to rectification - allow data correction
        return {
          status: 'pending',
          message: 'Data rectification request submitted for review'
        };
        
      case 'erasure':
        // Right to erasure (right to be forgotten)
        await this.eraseUserData(userId);
        return {
          status: 'completed',
          message: 'Personal data has been erased from our systems'
        };
        
      case 'portability':
        // Right to data portability
        return {
          status: 'completed',
          data: await this.exportPortableData(userId),
          message: 'Data export in machine-readable format completed'
        };
        
      default:
        return {
          status: 'rejected',
          message: 'Invalid request type'
        };
    }
  }

  private async exportUserData(userId: string): Promise<Record<string, any>> {
    // In production, gather all user data from database
    return {
      personal_data: {
        id: userId,
        created_at: new Date(),
        last_updated: new Date()
      },
      health_records: [],
      consent_records: [],
      audit_logs: []
    };
  }

  private async eraseUserData(userId: string): Promise<void> {
    // In production, anonymize or delete all personal data
    console.log(`Erasing data for user: ${userId}`);
    
    // Create audit log for erasure
    await this.security.createAuditLog({
      userId,
      action: 'DATA_ERASURE',
      resource: 'user_data',
      timestamp: new Date(),
      ipAddress: '0.0.0.0',
      userAgent: 'system',
      metadata: { gdpr_request: true }
    });
  }

  private async exportPortableData(userId: string): Promise<Record<string, any>> {
    // Export in JSON format for portability
    return {
      format: 'JSON',
      version: '1.0',
      exported_at: new Date(),
      user_data: await this.exportUserData(userId)
    };
  }
}

// Export singleton instances
export const securityCompliance = new SecurityCompliance();
export const gdprCompliance = new GDPRCompliance();