/**
 * Ngân hàng câu hỏi Đấu Trí Siêu Tốc (Speed Code Duel)
 * Ưu tiên: Toán nhẩm nhanh, snippet Python cơ bản 1 dòng, đố vui coder giữ nhịp độ vui chơi nhanh và giải trí cao.
 */
export const QUIZ_QUESTIONS = [
  // --- NHÓM 1: TOÁN NHẨM & PHÉP TÍNH SIÊU TỐC ---
  {
    id: 'm1',
    question: '2 ** 5 có giá trị bằng bao nhiêu?',
    options: ['16', '32', '64', '10'],
    correct: 1,
    hint: '2 nhân 2 năm lần: 2, 4, 8, 16, 32!',
    category: 'math'
  },
  {
    id: 'm2',
    question: '100 // 8 (Phép chia lấy nguyên) bằng mấy?',
    options: ['12', '12.5', '13', '8'],
    correct: 0,
    hint: '100 chia 8 được 12 dư 4!',
    category: 'math'
  },
  {
    id: 'm3',
    question: '17 % 5 (Phép chia lấy phần dư) bằng bao nhiêu?',
    options: ['1', '2', '3', '5'],
    correct: 1,
    hint: '17 = 5 * 3 + 2, phần dư là 2!',
    category: 'math'
  },
  {
    id: 'm4',
    question: '7 * 8 - 16 = ?',
    options: ['40', '42', '38', '48'],
    correct: 0,
    hint: '7 * 8 = 56, 56 - 16 = 40!',
    category: 'math'
  },
  {
    id: 'm5',
    question: '25 * 4 + 15 = ?',
    options: ['100', '115', '125', '110'],
    correct: 1,
    hint: '25 * 4 = 100, cộng thêm 15 là 115!',
    category: 'math'
  },
  {
    id: 'm6',
    question: '2 ** 10 là số quen thuộc nào trong ngành IT?',
    options: ['1000', '1024', '512', '2048'],
    correct: 1,
    hint: '1 KB = 1024 Bytes!',
    category: 'math'
  },
  {
    id: 'm7',
    question: '9 * 9 - 21 = ?',
    options: ['60', '72', '81', '59'],
    correct: 0,
    hint: '81 - 21 = 60 tròn trĩnh!',
    category: 'math'
  },
  {
    id: 'm8',
    question: 'Tổng các số từ 1 đến 5 (1 + 2 + 3 + 4 + 5) là?',
    options: ['15', '14', '16', '12'],
    correct: 0,
    hint: 'Công thức Gauss: 5 * 6 / 2 = 15!',
    category: 'math'
  },
  {
    id: 'm9',
    question: '64 ** 0.5 (Căn bậc hai của 64) là?',
    options: ['6', '7', '8', '16'],
    correct: 2,
    hint: '8 * 8 = 64!',
    category: 'math'
  },
  {
    id: 'm10',
    question: '50 % 7 = ?',
    options: ['1', '2', '3', '7'],
    correct: 0,
    hint: '7 * 7 = 49, dư 1!',
    category: 'math'
  },

  // --- NHÓM 2: PYTHON SNIPPET 1 DÒNG ĐƠN GIẢN ---
  {
    id: 'p1',
    question: 'len("FUDA") trả về kết quả gì?',
    options: ['4', '3', '5', '8'],
    correct: 0,
    hint: 'Chuỗi "FUDA" có đúng 4 ký tự!',
    category: 'python'
  },
  {
    id: 'p2',
    question: '"dev" * 3 trong Python cho ra kết quả nào?',
    options: ['"devdevdev"', '"dev3"', '"dev dev dev"', 'Báo lỗi SyntaxError'],
    correct: 0,
    hint: 'Phép nhân chuỗi trong Python lặp lại chuỗi đó 3 lần!',
    category: 'python'
  },
  {
    id: 'p3',
    question: 'bool([]) trong Python trả về gì?',
    options: ['False', 'True', 'None', 'Error'],
    correct: 0,
    hint: 'List rỗng luôn mang giá trị Falsy trong Python!',
    category: 'python'
  },
  {
    id: 'p4',
    question: 'type(3.14) trả về kiểu dữ liệu gì?',
    options: ['<class "float">', '<class "int">', '<class "double">', '<class "number">'],
    correct: 0,
    hint: 'Số thập phân trong Python thuộc kiểu float!',
    category: 'python'
  },
  {
    id: 'p5',
    question: '[1, 2] + [3, 4] sẽ tạo ra list nào?',
    options: ['[1, 2, 3, 4]', '[4, 6]', '[[1, 2], [3, 4]]', 'Báo lỗi'],
    correct: 0,
    hint: 'Toán tử + ghép nối hai list thành một list lớn!',
    category: 'python'
  },
  {
    id: 'p6',
    question: '"python"[0] lấy ra ký tự nào?',
    options: ['"p"', '"y"', '"P"', '0'],
    correct: 0,
    hint: 'Chỉ mục chuỗi trong Python đếm từ 0, ký tự đầu là "p"!',
    category: 'python'
  },
  {
    id: 'p7',
    question: '"dever"[-1] lấy ra ký tự nào?',
    options: ['"r"', '"d"', '"e"', '"v"'],
    correct: 0,
    hint: 'Chỉ mục âm -1 luôn trỏ tới phần tử cuối cùng của chuỗi!',
    category: 'python'
  },
  {
    id: 'p8',
    question: '"fuda"[::-1] đảo ngược chuỗi thành gì?',
    options: ['"aduf"', '"fuda"', '"duaf"', '"adfu"'],
    correct: 0,
    hint: 'Kỹ thuật slice với step -1 đảo ngược thứ tự các ký tự!',
    category: 'python'
  },
  {
    id: 'p9',
    question: 'min(5, 2, 9, 1) trả về giá trị nhỏ nhất là?',
    options: ['1', '2', '5', '9'],
    correct: 0,
    hint: 'Hàm min tìm số bé nhất, hiển nhiên là 1!',
    category: 'python'
  },
  {
    id: 'p10',
    question: 'sum([1, 2, 3, 4]) có tổng bằng bao nhiêu?',
    options: ['10', '9', '24', '12'],
    correct: 0,
    hint: '1 + 2 + 3 + 4 = 10!',
    category: 'python'
  },
  {
    id: 'p11',
    question: '"hello".upper() chuyển chuỗi thành?',
    options: ['"HELLO"', '"Hello"', '"hELLO"', 'Báo lỗi'],
    correct: 0,
    hint: 'Hàm .upper() biến toàn bộ chữ cái thành in hoa!',
    category: 'python'
  },
  {
    id: 'p12',
    question: '"a" in "fuda" trả về giá trị gì?',
    options: ['True', 'False', '1', 'None'],
    correct: 0,
    hint: 'Ký tự "a" nằm ở cuối chuỗi "fuda", nên là True!',
    category: 'python'
  },
  {
    id: 'p13',
    question: 'list(range(3)) tạo ra danh sách nào?',
    options: ['[0, 1, 2]', '[1, 2, 3]', '[0, 1, 2, 3]', '[3]'],
    correct: 0,
    hint: 'range(3) bắt đầu từ 0 và dừng trước 3!',
    category: 'python'
  },
  {
    id: 'p14',
    question: 'abs(-42) trả về giá trị tuyệt đối là?',
    options: ['42', '-42', '0', 'Error'],
    correct: 0,
    hint: 'Giá trị tuyệt đối của số âm là số dương tương ứng!',
    category: 'python'
  },
  {
    id: 'p15',
    question: 'len({"a": 1, "b": 2}) đếm số cặp key-value là mấy?',
    options: ['2', '4', '1', 'Báo lỗi'],
    correct: 0,
    hint: 'Dictionary có 2 key ("a" và "b") nên độ dài là 2!',
    category: 'python'
  },

  // --- NHÓM 3: CODER HUMOR, PSEUDOCODE & LOGIC VUI NHỘN ---
  {
    id: 'h1',
    question: 'Trong Python, từ khóa nào dùng để "không làm gì cả"?',
    options: ['pass', 'skip', 'do_nothing', 'continue_later'],
    correct: 0,
    hint: 'Từ khóa "pass" là câu lệnh giữ chỗ hợp lệ mà không thực hiện hành động!',
    category: 'humor'
  },
  {
    id: 'h2',
    question: '0.1 + 0.2 == 0.3 trong hầu hết ngôn ngữ lập trình trả về?',
    options: ['False', 'True', 'Báo lỗi', 'None'],
    correct: 0,
    hint: 'Bẫy số thực dấu phẩy động (Floating point): 0.1 + 0.2 = 0.30000000000000004!',
    category: 'humor'
  },
  {
    id: 'h3',
    question: 'Lệnh git nào để lưu lại các thay đổi vào commit history?',
    options: ['git commit', 'git push', 'git pull', 'git save'],
    correct: 0,
    hint: 'git commit -m "<message>" đóng gói các snapshot thay đổi!',
    category: 'humor'
  },
  {
    id: 'h4',
    question: 'Mã HTTP Status Code 404 có ý nghĩa là gì?',
    options: ['Not Found (Không tìm thấy)', 'OK (Thành công)', 'Server Error', 'Forbidden'],
    correct: 0,
    hint: '404 là huyền thoại trang không tìm thấy!',
    category: 'humor'
  },
  {
    id: 'h5',
    question: 'Tôn chỉ hoạt động nổi tiếng của CLB FU-DEVER là gì?',
    options: ['WORK HARD - PLAY HARD', 'JUST DO IT', 'NO PAIN NO GAIN', 'SLEEP ALL DAY'],
    correct: 0,
    hint: 'Vừa học hết mình, vừa quẩy nhiệt tình!',
    category: 'humor'
  },
  {
    id: 'h6',
    question: 'Món nước đặc sản Đà Nẵng nào được bán tại Căn tin DEVER TOWN?',
    options: ['Cà Phê Muối Đà Nẵng', 'Trà Tắc Khổng Lồ', 'Nước Ngô Luộc', 'Nước Mía Sầu Riêng'],
    correct: 0,
    hint: 'Vị đậm đà cà phê hòa quyện lớp kem muối béo ngậy!',
    category: 'humor'
  },
  {
    id: 'h7',
    question: 'Linh vật may mắn của trường FPT University là gì?',
    options: ['Cóc Vàng', 'Chim Lạc', 'Kỳ Lân', 'Sư Tử'],
    correct: 0,
    hint: 'Linh vật Cóc Vàng mang lại may mắn qua mọi môn thi!',
    category: 'humor'
  },
  {
    id: 'h8',
    question: 'Thứ tự ưu tiên toán tử: 2 + 3 * 4 = ?',
    options: ['14', '20', '24', '18'],
    correct: 0,
    hint: 'Nhân chia trước, cộng trừ sau: 3 * 4 = 12, 12 + 2 = 14!',
    category: 'math'
  },
  {
    id: 'h9',
    question: 'Trong Python, True + True bằng bao nhiêu?',
    options: ['2', 'True', '1', 'Báo lỗi TypeError'],
    correct: 0,
    hint: 'Trong Python, bool kế thừa từ int nên True == 1, 1 + 1 = 2!',
    category: 'python'
  },
  {
    id: 'h10',
    question: 'Độ phức tạp O(1) thường được gọi là gì?',
    options: ['Thời gian hằng số (Constant time)', 'Thời gian tuyến tính', 'Thời gian bậc hai', 'Vô hạn'],
    correct: 0,
    hint: 'O(1) hoàn thành trong thời gian cố định không phụ thuộc kích thước dữ liệu!',
    category: 'humor'
  }
];
