import crypto from 'crypto';

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString('base64').replace(/[/+=]/g, '').slice(0, length);
};

export const generateRandomIntInRange = (min: number, max: number): number => {
  if (min > max) throw new Error("generateRandomIntInRange: 'min' değeri 'max'tan büyük olamaz");
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSecurePassword = (length = 32): string => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-{}[]|:;"<>,.?/';
  const randomBytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeEachWord = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(capitalizeFirstLetter).join(' ');
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const createSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const formatPhoneNumberUS = (phone: string): string | null => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (!match) return null;
  return `(${match[1]}) ${match[2]}-${match[3]}`;
};

export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()!.toLowerCase();
};

export const formatLargeNumber = (num: number): string => {
  const absNum = Math.abs(num);
  if (absNum >= 1_000_000_000_000_000) return (num / 1_000_000_000_000_000).toFixed(2) + 'Qa';
  if (absNum >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
  if (absNum >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (absNum >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (absNum >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toString();
};

export const formatBytesToReadable = (bytes: number, decimals = 2): string => {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return 'Invalid';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${value} ${sizes[i]}`;
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${days > 0 ? `${days}g ` : ''}${hours}s ${minutes}dk`;
};

export function mustParse<T>(value: string | undefined, name: string, parser: (v: string) => T): T {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  try {
    return parser(value);
  } catch {
    throw new Error(`Invalid value for env var: ${name}`);
  }
}