import fs from 'fs';
import path from 'path';

const TARGET_DIR = './poeft-sounds';
const OUTPUT_FILE = './src/types/sounds/generated-sounds.d.ts';

function generate() {
  const files = fs.readdirSync(TARGET_DIR);

  const typeContent = `
export type SoundFile = 
${files.map((name: string) => `  | '${name}'`).join('\n')};
  `.trim();

  if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, typeContent);
}

generate();
