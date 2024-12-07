import * as crypto from 'crypto';

export class EncryptionService {
  encrypt(data: string, key: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');

    return iv.toString('hex') + encryptedData;
  }

  decrypt(data: string, key: string) {
    const iv = Buffer.from(data.slice(0, 32), 'hex');
    const dataWithoutIv = data.slice(32);
    const cipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decryptedData = cipher.update(dataWithoutIv, 'hex', 'utf8') + cipher.final('utf8');

    return decryptedData;
  }
}
