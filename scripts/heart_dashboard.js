import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, '..', 'server', 'data', 'telemetry_log.jsonl');

if (!fs.existsSync(logFilePath)) {
  console.log('No telemetry data found.');
  process.exit(0);
}

const data = fs.readFileSync(logFilePath, 'utf-8');
const lines = data.split('\n').filter(l => l.trim().length > 0);

let totalEvents = 0;
let uniqueUsers = 0; // Requires user_id or guest tracking, but we only have is_guest. Can't accurately count users without IDs.
const eventsCount = {};
const meaningfulActions = {};
const roomVisits = {};

lines.forEach(line => {
  try {
    const event = JSON.parse(line);
    totalEvents++;
    
    eventsCount[event.event_name] = (eventsCount[event.event_name] || 0) + 1;
    
    if (event.event_name === 'meaningful_action' && event.action_type) {
      meaningfulActions[event.action_type] = (meaningfulActions[event.action_type] || 0) + 1;
    }
    
    if (event.event_name === 'room_visit' && event.room_id) {
      roomVisits[event.room_id] = (roomVisits[event.room_id] || 0) + 1;
    }
  } catch (e) {}
});

console.log('=== HEART DASHBOARD BASELINE ===');
console.log(`Total Events: ${totalEvents}`);
console.log('\n--- Events Summary ---');
for (const [k, v] of Object.entries(eventsCount)) {
  console.log(`- ${k}: ${v}`);
}
console.log('\n--- Meaningful Actions ---');
for (const [k, v] of Object.entries(meaningfulActions)) {
  console.log(`- ${k}: ${v}`);
}
console.log('\n--- Top Rooms Visited ---');
Object.entries(roomVisits)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => {
    console.log(`- ${k}: ${v}`);
  });
console.log('================================');
