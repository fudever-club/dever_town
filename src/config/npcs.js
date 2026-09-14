export const NPC_CONFIG = {
  main_hall: [
    {
      id: 'npc_mentor_thinh',
      name: 'Mentor Thinh',
      role: 'Senior Dev • Web Team',
      tileX: 8, tileY: 4,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'undercut',
        hairColor: '#1e293b',
        skinTone: 'skin_natural',
        outfitType: 'polo',
        hoodieColor: '#2563eb',
        collarColor: '#1d4ed8',
        pantsColor: '#1e293b',
        accessory: 'glasses_smart',
        expression: 'expr_focus'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Chào bạn! Mình là Thinh, mentor Web Team của FU-DEVER.',
            'Bạn có muốn tìm hiểu về CLB không?',
            'FU-DEVER có 4 sub-team: Web, AI, Mobile và Game.'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Nếu bạn giỏi code, chúng mình luôn chào đón!',
            'Tìm form đăng ký tại fanpage FPTUDever nhé.',
            'Gặp bạn ở hackathon lần sau!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  canteen_cafe: [
    {
      id: 'npc_barista_an',
      name: 'Barista An',
      role: 'Quán Cà Phê FUDA',
      tileX: 8, tileY: 8,
      direction: 'down',
      spriteConfig: {
        gender: 'female',
        hairstyle: 'ponytail',
        hairColor: '#78350f',
        skinTone: 'skin_natural',
        outfitType: 'barista',
        hoodieColor: '#d97706',
        collarColor: '#92400e',
        pantsColor: '#1e293b',
        accessory: 'none',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Xin chào! Hôm nay bạn muốn dùng gì?',
            'Cà phê muối Đà Nẵng là món đặc trưng của quán mình!',
            'Vừa code vừa nhâm nhi — perfect combo!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  library_lounge: [
    {
      id: 'npc_librarian_linh',
      name: 'Thủ Thư Linh',
      role: 'Library Keeper',
      tileX: 12, tileY: 5,
      direction: 'down',
      spriteConfig: {
        gender: 'female',
        hairstyle: 'hime_cut',
        hairColor: '#0f172a',
        skinTone: 'skin_fair',
        outfitType: 'suit',
        hoodieColor: '#7c3aed',
        collarColor: '#6d28d9',
        pantsColor: '#312e81',
        accessory: 'glasses_smart',
        expression: 'expr_focus'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Yêu cầu giữ yên lặng trong khu vực thư viện.',
            'Chúng tôi có bộ sưu tập tài liệu kỹ thuật phong phú.',
            'Bạn cần tìm tài liệu về chủ đề nào?'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  dever_lab: [
    {
      id: 'npc_gamer_bao',
      name: 'Gamer Bảo',
      role: 'Game Team Lead',
      tileX: 15, tileY: 8,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'wolf_cut',
        hairColor: '#7f1d1d',
        skinTone: 'skin_natural',
        outfitType: 'hoodie',
        hoodieColor: '#dc2626',
        collarColor: '#991b1b',
        pantsColor: '#18181b',
        accessory: 'headphones_rgb',
        expression: 'expr_cool'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Bro! Mày đang chơi DEVER TOWN mà mày không biết à?',
            'Game này là dự án của Game Team FU-DEVER đó.',
            'Join Game Team để build game cùng tụi tao nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  sports_complex: [
    {
      id: 'npc_coach_minh',
      name: 'HLV Minh',
      role: 'Sports Coach',
      tileX: 12, tileY: 9,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'buzz_cut',
        hairColor: '#1e293b',
        skinTone: 'skin_tan',
        outfitType: 'jersey',
        hoodieColor: '#16a34a',
        collarColor: '#166534',
        pantsColor: '#1e293b',
        accessory: 'none',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Chào tân binh! Sân thể thao FUDA luôn mở cửa.',
            'Bóng đá, bóng rổ, bơi lội — chọn môn nào?',
            'Coder khỏe thì code bền hơn đấy nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  media_hub: [
    {
      id: 'npc_reporter_ha',
      name: 'Phóng Viên Hà',
      role: 'Media Hub Reporter',
      tileX: 10, tileY: 7,
      direction: 'down',
      spriteConfig: {
        gender: 'female',
        hairstyle: 'bob',
        hairColor: '#92400e',
        skinTone: 'skin_natural',
        outfitType: 'suit',
        hoodieColor: '#1e293b',
        collarColor: '#0f172a',
        pantsColor: '#1e293b',
        accessory: 'none',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Breaking news: DEVER TOWN vừa ra mắt hệ thống NPC!',
            'Tôi là Hà, phóng viên mảng tech của FU-DEVER Media.',
            'Theo dõi fanpage để cập nhật tin tức CLB mới nhất!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  memory_room: [
    {
      id: 'npc_historian_duc',
      name: 'Sử Quan Đức',
      role: 'Lịch Sử CLB',
      tileX: 11, tileY: 8,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'bald_professor',
        hairColor: '#94a3b8',
        skinTone: 'skin_fair',
        outfitType: 'suit',
        hoodieColor: '#475569',
        collarColor: '#334155',
        pantsColor: '#1e293b',
        facialHair: 'grey_beard',
        accessory: 'glasses_smart',
        expression: 'expr_focus'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Phòng này lưu giữ ký ức của FU-DEVER qua nhiều năm.',
            'CLB được thành lập từ những ngày đầu FPT University Đà Nẵng.',
            'Mỗi giải thưởng là một trang lịch sử của CLB chúng ta.'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Hackathon, CTF, Game Jam... đây đều là dấu ấn của FU-DEVER.',
            'Bạn là thế hệ tiếp theo để viết thêm những trang mới.',
            'Cố lên nhé, thế hệ trẻ!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  web_room: [
    {
      id: 'npc_dev_khoa',
      name: 'Senior Dev Khoa',
      role: 'Full-Stack • AI Team',
      tileX: 14, tileY: 7,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'wolf_cut',
        hairColor: '#334155',
        skinTone: 'skin_natural',
        outfitType: 'hoodie',
        hoodieColor: '#0f172a',
        collarColor: '#1e293b',
        pantsColor: '#0f172a',
        facialHair: 'stubble',
        accessory: 'none',
        expression: 'expr_focus'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Không gian Web & AI — nơi các dự án lớn được sinh ra.',
            'Mình đang build LLM agent cho wiki của CLB.',
            'Nếu bạn biết Python hoặc React, ghé AI Team nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ]
};
