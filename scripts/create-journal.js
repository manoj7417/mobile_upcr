import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const journalContent = {
  version: 1,
  dialect: "postgresql",
  entries: []
};

const journalPath = path.join(__dirname, '../drizzle/meta/_journal.json');

// Create the meta directory if it doesn't exist
if (!fs.existsSync(path.dirname(journalPath))) {
  fs.mkdirSync(path.dirname(journalPath), { recursive: true });
}

// Write the file with proper JSON formatting
fs.writeFileSync(journalPath, JSON.stringify(journalContent, null, 2), 'utf8');
