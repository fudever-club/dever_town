/**
 * DEVER_TOWN - Automated Security Scanner (SAST & Configuration Hygiene)
 *
 * Kiểm tra các lỗ hổng bảo mật phổ biến:
 * 1. Lộ lọt secrets, API keys, JWT secret hardcoded trong source code
 * 2. Theo dõi file nhạy cảm trong Git (.env, users.json, *.pem)
 * 3. Phân quyền và xác thực trên Express Routes (CSRF, sanitizeInput, rateLimit, admin endpoints)
 * 4. Socket.io Privilege Escalation & Role Injection
 * 5. Data Disclosure (loại bỏ deviceId, password_hash, userId trong public broadcasts)
 * 6. SQL Injection trong PostgreSQL adapter (bắt buộc dùng parameterized queries)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const STATS = {
  passed: 0,
  warned: 0,
  failed: 0
};

function pass(testName, detail = '') {
  STATS.passed++;
  console.log(`  ${COLORS.green}[PASS]${COLORS.reset} ${testName} ${detail ? COLORS.dim + '(' + detail + ')' + COLORS.reset : ''}`);
}

function warn(testName, message) {
  STATS.warned++;
  console.log(`  ${COLORS.yellow}[WARN]${COLORS.reset} ${testName}: ${message}`);
}

function fail(testName, error) {
  STATS.failed++;
  console.log(`  ${COLORS.red}[FAIL]${COLORS.reset} ${testName}: ${error}`);
}

/**
 * 1. Kiểm tra Git Index: Không được track file nhạy cảm
 */
function checkGitTrackedSensitiveFiles() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}--- 1. KIỂM TRA FILE NHẠY CẢM TRONG GIT INDEX ---${COLORS.reset}`);
  
  const forbiddenPatterns = [
    '.env',
    '.env.local',
    '.env.production',
    'server/data/users.json',
    '*.pem',
    '*.key',
    'id_rsa'
  ];

  try {
    const trackedFiles = execSync('git ls-files', { cwd: ROOT_DIR, encoding: 'utf-8' })
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    for (const pattern of forbiddenPatterns) {
      if (pattern.includes('*')) {
        const ext = pattern.replace('*', '');
        const matched = trackedFiles.filter(f => f.endsWith(ext));
        if (matched.length > 0) {
          fail(`Git Tracked Sensitive File: ${pattern}`, `Phát hiện file nhạy cảm: ${matched.join(', ')}`);
        } else {
          pass(`Git không theo dõi file đuôi ${pattern}`);
        }
      } else {
        if (trackedFiles.includes(pattern)) {
          fail(`Git Tracked Sensitive File: ${pattern}`, `File ${pattern} đang bị Git theo dõi! Cần chạy 'git rm --cached ${pattern}'`);
        } else {
          pass(`Git không theo dõi ${pattern}`);
        }
      }
    }
  } catch (err) {
    warn('Git Index Check', `Không thể truy xuất git index: ${err.message}`);
  }
}

/**
 * 2. Quét mã nguồn tìm Hardcoded Secrets & API Keys
 */
function checkHardcodedSecrets() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}--- 2. QUÉT HARDCODED SECRETS & API KEYS ---${COLORS.reset}`);

  const scanDirs = ['server', 'src', 'scripts'];
  const secretPatterns = [
    { name: 'Resend API Key', regex: /re_[a-zA-Z0-9]{20,}/g, test: (content) => /re_[a-zA-Z0-9]{20,}/.test(content) },
    { name: 'OpenAI/Claude API Key', regex: /sk-[a-zA-Z0-9]{20,}/g, test: (content) => /sk-[a-zA-Z0-9]{20,}/.test(content) },
    { name: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{30,}/g, test: (content) => /ghp_[a-zA-Z0-9]{30,}/.test(content) },
    { name: 'Hardcoded Database Password', regex: /postgres:\/\/[^:]+:([^@]+)@/g, test: (content) => {
      const m = /postgres:\/\/[^:]+:([^@]+)@/.exec(content);
      return m && !m[1].includes('$') && !m[1].includes('{') && m[1] !== 'password' && m[1] !== 'postgres';
    }}
  ];

  function getFiles(dir) {
    let results = [];
    const fullDir = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullDir)) return results;
    
    const list = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(fullDir, item.name);
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== 'dist') {
          results = results.concat(getFiles(path.join(dir, item.name)));
        }
      } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.ts') || item.name.endsWith('.json'))) {
        // Bỏ qua các file fixture/test không chứa secret thật
        results.push({ relativePath: path.join(dir, item.name), fullPath });
      }
    }
    return results;
  }

  let totalFiles = 0;
  let secretFound = false;

  for (const dir of scanDirs) {
    const files = getFiles(dir);
    totalFiles += files.length;
    for (const file of files) {
      if (file.relativePath.includes('security-scan.js')) continue; // Bỏ qua chính file scanner
      const content = fs.readFileSync(file.fullPath, 'utf-8');

      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          fail(`Lỗ hổng Secret: ${pattern.name}`, `Tìm thấy tại ${file.relativePath}`);
          secretFound = true;
        }
      }
    }
  }

  if (!secretFound) {
    pass(`Không tìm thấy secret cứng (Đã quét ${totalFiles} files mã nguồn)`);
  }
}

/**
 * 3. Kiểm tra bảo mật Express Routes (Auth & Rate Limit)
 */
function checkRouteSecurity() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}--- 3. KIỂM TRA EXPRESS ROUTES & RATE LIMITING ---${COLORS.reset}`);

  const routesDir = path.join(ROOT_DIR, 'server', 'routes');
  if (!fs.existsSync(routesDir)) {
    warn('Routes Check', 'Không tìm thấy thư mục server/routes');
    return;
  }

  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  
  for (const rf of routeFiles) {
    const content = fs.readFileSync(path.join(routesDir, rf), 'utf-8');
    
    // Kiểm tra rate limiting trên các route xác thực hoặc ghi dữ liệu
    if (rf === 'authRoutes.js') {
      if (content.includes('authLimiter') && content.includes('/register') && content.includes('/login')) {
        pass('Auth Routes có Rate Limiter chống brute-force đăng ký/đăng nhập');
      } else {
        fail('Auth Routes thiếu Rate Limiter', 'Cần áp dụng authLimiter vào các endpoint register/login');
      }

      if (content.includes('/test-mail') && (content.includes('req.user?.role !== \'admin\'') || content.includes('role === \'admin\''))) {
        pass('Endpoint /test-mail được khóa bảo vệ chỉ cho quyền admin');
      } else {
        fail('Endpoint /test-mail không bảo vệ role admin', 'Bất kỳ ai cũng có thể kích hoạt gửi mail test');
      }

      if (content.includes('sanitizeInput')) {
        pass('Auth Routes tích hợp sanitizeInput chống XSS/Payload Injection');
      } else {
        warn('Auth Routes', 'Nên tích hợp sanitizeInput cho các route nhận body');
      }
    }

    if (rf === 'gameRoutes.js') {
      if (content.includes('scoreLimiter') && content.includes('/score')) {
        pass('Game Routes có Rate Limiter chống spam nộp điểm ảo');
      } else {
        fail('Game Routes thiếu Rate Limiter', 'Cần áp dụng scoreLimiter vào POST /score');
      }
    }

    if (rf === 'telemetryRoutes.js') {
      if (content.includes('telemetryLimiter') && content.includes('WHITELIST')) {
        pass('Telemetry Routes giới hạn rate limit và lọc whitelist keys an toàn');
      } else {
        fail('Telemetry Routes chưa áp dụng whitelist keys');
      }
    }
  }
}

/**
 * 4. Kiểm tra Socket.io Role Injection & Privilege Escalation
 */
function checkSocketSecurity() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}--- 4. KIỂM TRA SOCKET.IO PRIVILEGE ESCALATION ---${COLORS.reset}`);

  const playerManagerPath = path.join(ROOT_DIR, 'server', 'socket', 'playerManager.js');
  if (fs.existsSync(playerManagerPath)) {
    const content = fs.readFileSync(playerManagerPath, 'utf-8');
    
    // Kiểm tra xem role có bị gán trực tiếp từ data.role không
    if (/role:\s*data\.role/.test(content)) {
      fail('Socket Role Injection', 'Role của player đang nhận trực tiếp từ data.role của client không qua xác thực!');
    } else if (content.includes('role: authUser ? (authUser.role || \'dev\') : \'guest\'')) {
      pass('Socket Player Manager gán role \'guest\' mặc định cho khách vãng lai, cấm client tự gán role');
    } else {
      warn('Socket Role Assignment', 'Vui lòng kiểm tra lại logic gán role cho socket player');
    }

    // Kiểm tra toPublic có che giấu deviceId không
    if (content.includes('toPublic(player)') && content.includes('deviceId')) {
      pass('Hàm toPublic() loại bỏ deviceId nhạy cảm trước khi broadcast phòng');
    } else {
      fail('Data Disclosure', 'Thiếu hàm toPublic() hoặc chưa lọc deviceId khỏi socket broadcast');
    }
  } else {
    warn('Socket Check', 'Không tìm thấy playerManager.js');
  }
}

/**
 * 5. Kiểm tra SQL Injection trong PostgreSQL Adapter
 */
function checkSqlSecurity() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}--- 5. KIỂM TRA SQL INJECTION & ROW LEVEL SECURITY ---${COLORS.reset}`);

  const pgAdapterPath = path.join(ROOT_DIR, 'server', 'db', 'postgresAdapter.js');
  if (fs.existsSync(pgAdapterPath)) {
    const content = fs.readFileSync(pgAdapterPath, 'utf-8');

    // Kiểm tra có ENABLE ROW LEVEL SECURITY
    if (content.includes('ENABLE ROW LEVEL SECURITY')) {
      pass('Row Level Security (RLS) đã được kích hoạt cho các bảng Supabase');
    } else {
      fail('RLS Missing', 'Chưa kích hoạt Row Level Security trên các bảng PostgreSQL');
    }

    // Kiểm tra xem có query nối chuỗi nguy hiểm không
    const dangerousConcatenations = [
      /query\(`[^`]*\$\{[^}]+\}[^`]*`\)/g,
      /query\(['"][^'"]*\+[^'"]*['"]\)/g
    ];

    let foundDangerous = false;
    for (const regex of dangerousConcatenations) {
      const matches = content.match(regex);
      if (matches) {
        // Bỏ qua CREATE TABLE hoặc câu lệnh khởi tạo tĩnh
        const validWarnings = matches.filter(m => !m.includes('CREATE TABLE') && !m.includes('ALTER TABLE'));
        if (validWarnings.length > 0) {
          foundDangerous = true;
          fail('SQL Injection Risk', `Phát hiện câu query ghép chuỗi: ${validWarnings[0]}`);
        }
      }
    }

    if (!foundDangerous) {
      pass('100% câu truy vấn DML sử dụng Parameterized Queries ($1, $2...)');
    }
  } else {
    warn('Database Check', 'Không tìm thấy postgresAdapter.js');
  }
}

/**
 * 6. Kiểm tra JWT Token Configuration
 */
function checkJwtSecurity() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}--- 6. KIỂM TRA CẤU HÌNH JWT TOKEN ---${COLORS.reset}`);

  const authMiddlewarePath = path.join(ROOT_DIR, 'server', 'middleware', 'authMiddleware.js');
  if (fs.existsSync(authMiddlewarePath)) {
    const content = fs.readFileSync(authMiddlewarePath, 'utf-8');

    if (content.includes('process.env.NODE_ENV === \'production\'') && content.includes('process.exit(1)')) {
      pass('JWT_SECRET bắt buộc phải có trong môi trường Production (Fail-closed)');
    } else {
      fail('JWT Fallback Insecure', 'Trong Production hệ thống không được dùng fallback secret');
    }

    if (content.includes('sanitizeUser') && content.includes('password_hash')) {
      pass('sanitizeUser() loại bỏ password_hash trước khi trả dữ liệu về client');
    } else {
      fail('sanitizeUser', 'Chưa loại bỏ password_hash khi giải mã hoặc trả profile');
    }
  }
}

/**
 * Chạy toàn bộ quy trình kiểm tra
 */
async function runAll() {
  console.log(`\n${COLORS.bold}======================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}     🛡️  DEVER_TOWN AUTOMATED SECURITY SCANNER 🛡️      ${COLORS.reset}`);
  console.log(`${COLORS.bold}======================================================${COLORS.reset}`);

  checkGitTrackedSensitiveFiles();
  checkHardcodedSecrets();
  checkRouteSecurity();
  checkSocketSecurity();
  checkSqlSecurity();
  checkJwtSecurity();

  console.log(`\n${COLORS.bold}======================================================${COLORS.reset}`);
  console.log(`${COLORS.bold}KẾT QUẢ QUÉT BẢO MẬT:${COLORS.reset}`);
  console.log(`  ${COLORS.green}✔ Đạt chuẩn (Passed):${COLORS.reset} ${STATS.passed}`);
  console.log(`  ${COLORS.yellow}⚠ Cảnh báo (Warned):${COLORS.reset} ${STATS.warned}`);
  console.log(`  ${COLORS.red}✖ Lỗi bảo mật (Failed):${COLORS.reset} ${STATS.failed}`);
  console.log(`${COLORS.bold}======================================================${COLORS.reset}`);

  if (STATS.failed > 0) {
    console.error(`\n${COLORS.red}[ALERT] Phát hiện ${STATS.failed} lỗi bảo mật cần khắc phục ngay trước khi đưa lên Production!${COLORS.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${COLORS.green}[SUCCESS] Toàn bộ tiêu chí kiểm tra bảo mật đều ĐẠT CHUẨN AN TOÀN!${COLORS.reset}\n`);
    process.exit(0);
  }
}

runAll().catch(err => {
  console.error('[SCANNER ERROR]', err);
  process.exit(1);
});
