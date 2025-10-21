import crypto from 'crypto';

export const generateUUID = (): string => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto
    .randomBytes(16)
    .toString('hex')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-4$3-$4-$5');
};

export const generate5DigitOTP = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};