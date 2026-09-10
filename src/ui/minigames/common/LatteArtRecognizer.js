/**
 * DEVER TOWN - LATTE ART POURING RECOGNIZER
 * Thuật toán chấm điểm nghệ thuật rót bọt sữa Latte Art tự do
 * Dựa trên ma trận điểm vẽ, độ đối xứng trục và tỷ lệ phủ bọt sữa.
 */

export class LatteArtRecognizer {
  constructor() {
    this.points = [];
    this.cupRadius = 65;
    this.cupCenterX = 320;
    this.cupCenterY = 220;
  }

  reset() {
    this.points = [];
  }

  addPourPoint(x, y, radius = 6) {
    // Chỉ ghi nhận khi điểm nằm trong miệng cốc tròn
    const dx = x - this.cupCenterX;
    const dy = y - this.cupCenterY;
    if (Math.hypot(dx, dy) <= this.cupRadius - 4) {
      this.points.push({ x, y, radius, time: Date.now() });
      return true;
    }
    return false;
  }

  evaluate() {
    if (this.points.length < 8) {
      return {
        stars: 1,
        title: 'Chưa Đủ Bọt Sữa',
        score: 30,
        tipMultiplier: 0.8,
        comment: 'Hãy rót thêm bọt sữa trắng để tạo hình rõ ràng hơn!'
      };
    }

    // 1. Phân tích đối xứng dọc trục tâm cốc
    let leftCount = 0;
    let rightCount = 0;
    let topCount = 0;
    let bottomCount = 0;

    for (const pt of this.points) {
      if (pt.x < this.cupCenterX) leftCount++;
      else rightCount++;

      if (pt.y < this.cupCenterY) topCount++;
      else bottomCount++;
    }

    const total = this.points.length;
    const lrBalance = 1 - Math.abs(leftCount - rightCount) / total; // Càng gần 1 càng cân xứng trái phải
    const tbBalance = Math.min(topCount, bottomCount) / Math.max(topCount, bottomCount);

    // 2. Điểm số tổng hợp (0 - 100)
    let score = Math.round(lrBalance * 50 + tbBalance * 30 + Math.min(total / 30, 1) * 20);
    score = Math.max(40, Math.min(100, score));

    // 3. Phân loại hình mẫu và danh hiệu
    let stars = 3;
    let title = 'Tự Do Sáng Tạo';
    let comment = 'Tách cà phê đậm chất builder FPTU!';

    if (score >= 88) {
      stars = 5;
      title = lrBalance > 0.85 ? 'Trái Tim Hoàn Hảo' : 'Nghệ Nhân Latte Art';
      comment = 'Đường nét cực kỳ cân đối và tinh tế! Khách hàng vô cùng thán phục!';
    } else if (score >= 72) {
      stars = 4;
      title = 'Chiếc Lá Rosetta Đẹp Mắt';
      comment = 'Bọt sữa sánh mịn, bố cục hài hòa và giàu tính thẩm mỹ!';
    } else if (score >= 55) {
      stars = 3;
      title = 'Họa Tiết Mây Bồng Bềnh';
      comment = 'Hương vị tuyệt vời, hình vẽ có nét độc đáo rất riêng!';
    } else {
      stars = 2;
      title = 'Trừu Tượng Tự Nhiên';
      comment = 'Cần điều chỉnh tay rót đều đặn hơn để hình dáng cân xứng!';
    }

    return {
      stars,
      title,
      score,
      tipMultiplier: stars >= 4 ? 1.5 : stars === 3 ? 1.1 : 0.9,
      comment
    };
  }
}
