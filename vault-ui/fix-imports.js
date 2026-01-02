import { writeFileSync, mkdirSync, existsSync } from 'fs';

console.log('🔧 Creating missing files...\n');

// 1. Create App.css
console.log('1️⃣  Creating App.css...');
writeFileSync('src/App.css', `/* App styles */
@tailwind base;
@tailwind components;
@tailwind utilities;
`);

// 2. Create config file
console.log('2️⃣  Creating config.ts...');
writeFileSync('src/config.ts', `// Environment configuration
export const VAULT_API_URL = import.meta.env.VITE_VAULT_API_URL || 'http://localhost:3000';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
`);

// 3. Create assets directory if it doesn't exist
if (!existsSync('src/assets')) {
  mkdirSync('src/assets', { recursive: true });
}

// 4. Create placeholder SVG logo
console.log('3️⃣  Creating placeholder logo...');
writeFileSync('src/assets/VAULT_LOGO_ORANGE_NEW.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#FF6B35"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="48" font-family="Arial, sans-serif" font-weight="bold">VAULT</text>
</svg>
`);

// 5. Create placeholder PNG
console.log('4️⃣  Creating placeholder assistant icon...');
writeFileSync('src/assets/assistant_icon.png.txt', 'Replace this with actual assistant_icon.png');

// 6. Fix RootLayout import
console.log('5️⃣  Fixing RootLayout.tsx...');
import { readFileSync } from 'fs';
let rootLayout = readFileSync('src/pages/RootLayout.tsx', 'utf8');
rootLayout = rootLayout.replace(
  /import.*from ['"]\.\/ExternalMenuItems['"]/g,
  '// Removed ExternalMenuItems import'
);
writeFileSync('src/pages/RootLayout.tsx', rootLayout);

// 7. Create .env file if it doesn't exist
if (!existsSync('.env')) {
  console.log('6️⃣  Creating .env file...');
  writeFileSync('.env', `# Vault API
VITE_VAULT_API_URL=http://localhost:3000

# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here
`);
}

console.log('\n✅ All missing files created!\n');
console.log('📝 Next steps:');
console.log('1. Update .env with your actual values');
console.log('2. Replace placeholder images in src/assets/');
console.log('3. Run: bun run start\n');
