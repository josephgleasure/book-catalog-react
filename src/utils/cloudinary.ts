// Minimal Cloudinary URL builder for client-side usage.
// Reads the cloud name from Vite env (VITE_CLOUDINARY_CLOUD_NAME) or falls back to a placeholder.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dz3wtbik1';

const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

type UrlOptions = {
  width?: number;
  quality?: number | 'auto';
  format?: 'auto';
  crop?: 'fill' | 'fit' | 'scale';
};

function buildTransformString(opts: UrlOptions): string {
  const parts: string[] = [];
  // Always prefer automatic format/quality unless explicitly overridden
  parts.push('f_auto');
  parts.push(`q_${opts.quality ?? 'auto'}`);
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  return parts.join(',');
}

// Encode each path segment but keep slashes
function encodePublicId(publicId: string): string {
  return publicId
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');
}

export function getCloudinaryUrl(publicId: string, opts: UrlOptions = {}): string {
  const t = buildTransformString(opts);
  const encoded = encodePublicId(publicId.replace(/\.(jpg|jpeg|png|webp)$/i, ''));
  return `${BASE_URL}/${t}/${encoded}`;
}

export const cloudinaryConfig = {
  CLOUD_NAME,
  BASE_URL,
};

export default getCloudinaryUrl;

