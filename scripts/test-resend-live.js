import 'dotenv/config';
import { mailService } from '../server/services/mailService.js';

async function testResend() {
  console.log('--- BẮT ĐẦU KIỂM THỬ GỬI EMAIL RESEND (DEFAULT DOMAIN: onboarding@resend.dev) ---');

  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
  if (!apiKey) {
    console.log('⚠️ [CẢNH BÁO]: Chưa tìm thấy RESEND_API_KEY trong biến môi trường local (.env).');
    console.log('👉 Nếu bạn đã nhập trên Render, hãy kiểm tra biến môi trường trên Render Dashboard.');
    console.log('👉 Để test trên máy local này, bạn có thể tạo file .env chứa: RESEND_API_KEY=re_xxxxxx\n');
  } else {
    console.log(`🔑 Đã tìm thấy RESEND_API_KEY: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
  }

  const testEmail = process.argv[2] || 'hungnguyen.190206@gmail.com';
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log(`📨 Đang gửi thử nghiệm OTP [${testOtp}] tới: ${testEmail}...`);

  try {
    const result = await mailService.sendPasswordResetOtp(testEmail, {
      otpCode: testOtp,
      displayName: 'RaH11 Tester',
      expiresInMinutes: 10
    });

    console.log('\n📊 KẾT QUẢ TRẢ VỀ:');
    console.log(JSON.stringify(result, null, 2));

    if (result.realEmailSent) {
      console.log(`\n🎉 THÀNH CÔNG 100%! Email thật đã được bắn thành công qua Resend tới: ${testEmail}`);
      console.log(`Mã OTP đã gửi: ${testOtp}`);
    } else if (result.resendError) {
      console.log(`\n❌ RESEND PHẢN HỒI LỖI: ${result.resendError}`);
    } else {
      console.log('\nℹ️ Đang chạy ở chế độ Dev Console Logger (chưa có API Key thật).');
    }
  } catch (err) {
    console.error('\n❌ Lỗi ngoại lệ trong quá trình gửi:', err);
  }
}

testResend();
