import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const logFilePath = path.join(__dirname, '..', 'data', 'telemetry_log.jsonl');

// Đảm bảo thư mục tồn tại
const dataDir = path.dirname(logFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Rate limit: 60 events/request is not about request count, it's about max payload, but we can limit requests
const telemetryLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Too many telemetry requests'
});

const WHITELIST = ['event_name', 'timestamp', 'room_id', 'quest_id', 'minigame_type', 'score', 'is_guest', 'action_type'];

router.post('/batch', telemetryLimiter, (req, res) => {
  const events = req.body.events;
  
  if (!Array.isArray(events)) {
    return res.status(400).json({ ok: false, message: 'Invalid payload' });
  }

  // Rate limit event count per request
  if (events.length > 200) {
    return res.status(400).json({ ok: false, message: 'Too many events in batch' });
  }

  let saved = 0;
  let logLines = '';

  for (const rawEvent of events) {
    if (!rawEvent || typeof rawEvent !== 'object') continue;
    
    const safeEvent = {};
    for (const key of WHITELIST) {
      if (rawEvent[key] !== undefined) {
        safeEvent[key] = rawEvent[key];
      }
    }
    
    // Yêu cầu tối thiểu
    if (!safeEvent.event_name || !safeEvent.timestamp) continue;
    
    logLines += JSON.stringify(safeEvent) + '\n';
    saved++;
  }

  if (saved > 0) {
    fs.appendFile(logFilePath, logLines, (err) => {
      if (err) {
        console.error('Failed to write telemetry', err);
      }
    });
  }

  res.json({ ok: true, saved });
});

export default router;
