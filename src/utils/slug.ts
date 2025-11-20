export function slugifyTitle(title: string, max: number = 48): string {
  // Normalize accents and drop diacritics
  const ascii = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  // Keep alphanumerics and spaces/dashes
  const cleaned = ascii.replace(/[^a-zA-Z0-9\s-]/g, ' ').toLowerCase();
  const stop = new Set(['the','a','an','for','and','of','by','with','to','in','on','no','number']);
  const words = cleaned.split(/\s+/).filter(w => w && !stop.has(w));
  let slug = words.join('-').replace(/-+/g, '-');
  if (slug.length > max) slug = slug.slice(0, max).replace(/-+$/,'');
  if (!slug) {
    slug = ascii.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+$/,'').slice(0, max) || 'book';
  }
  return slug;
}


