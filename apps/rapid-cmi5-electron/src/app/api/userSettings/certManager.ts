import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import tls from 'tls';

export interface CertInfo {
  id: string;
  filename: string;
  addedAt: string;
  subject?: string;
}

const CERTS_DIR = path.join(app.getPath('userData'), 'custom-certs');

function ensureCertsDir() {
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }
}

/**
 * Load all custom certs and add them to the TLS trust chain.
 * Call this once at app startup and after adding/removing certs.
 */
export function applyCustomCerts(): void {
  ensureCertsDir();

  const certFiles = fs
    .readdirSync(CERTS_DIR)
    .filter(
      (f) => f.endsWith('.pem') || f.endsWith('.crt') || f.endsWith('.cer'),
    );

  if (certFiles.length === 0) return;

  const extraCerts = certFiles.map((f) =>
    fs.readFileSync(path.join(CERTS_DIR, f), 'utf-8'),
  );

  const originalCreateSecureContext = tls.createSecureContext;
  tls.createSecureContext = function (options = {}) {
    const context = originalCreateSecureContext.call(tls, options);
    for (const cert of extraCerts) {
      try {
        context.context.addCACert(cert);
      } catch (err) {
        console.warn('Failed to add custom cert:', err);
      }
    }
    return context;
  };

  console.log(`Applied ${extraCerts.length} custom certificate(s)`);
}

/**
 * List all installed custom certificates.
 */
export function listCerts(): CertInfo[] {
  ensureCertsDir();

  const certFiles = fs
    .readdirSync(CERTS_DIR)
    .filter(
      (f) => f.endsWith('.pem') || f.endsWith('.crt') || f.endsWith('.cer'),
    );

  return certFiles.map((filename) => {
    const fullPath = path.join(CERTS_DIR, filename);
    const stat = fs.statSync(fullPath);
    const content = fs.readFileSync(fullPath, 'utf-8');

    let subject: string | undefined;
    try {
      const subjectMatch = content.match(/subject=(.+)/);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
      }
    } catch {
      // Ignore parse errors
    }

    return {
      id: Buffer.from(filename).toString('base64url'),
      filename,
      addedAt: stat.mtime.toISOString(),
      subject,
    };
  });
}

/**
 * Add a certificate file. Returns the new cert info.
 */
export function addCert(filename: string, contents: string): CertInfo {
  ensureCertsDir();

  if (!contents.includes('-----BEGIN CERTIFICATE-----')) {
    throw new Error('Invalid certificate format. Expected PEM format.');
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destPath = path.join(CERTS_DIR, safeName);

  if (fs.existsSync(destPath)) {
    throw new Error(`Certificate "${safeName}" already exists.`);
  }

  fs.writeFileSync(destPath, contents, 'utf-8');
  applyCustomCerts();

  return {
    id: Buffer.from(safeName).toString('base64url'),
    filename: safeName,
    addedAt: new Date().toISOString(),
  };
}

/**
 * Remove a certificate by its ID.
 */
export function removeCert(id: string): void {
  ensureCertsDir();

  const filename = Buffer.from(id, 'base64url').toString('utf-8');
  const fullPath = path.join(CERTS_DIR, filename);

  if (path.dirname(fullPath) !== CERTS_DIR) {
    throw new Error('Invalid certificate ID');
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error('Certificate not found');
  }

  fs.unlinkSync(fullPath);
  applyCustomCerts();
}