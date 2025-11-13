import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const expr = process.argv[2] || '';
const max = parseInt(process.argv[3] || '10', 10);

(async () => {
  try {
    const res = await cloudinary.search.expression(expr).max_results(max).execute();
    console.log('expression:', expr);
    console.log('total:', res.total_count);
    console.log((res.resources || []).slice(0, max).map(r => r.public_id));
  } catch (e) {
    console.error('Search error:', e);
    process.exit(1);
  }
})();


