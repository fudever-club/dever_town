export const NPC_CONFIG = {
  main_hall: [
    {
      id: 'npc_chunhiem_nhat',
      name: 'Đặng Quang Nhật',
      role: 'Chủ Nhiệm CLB • K20',
      tileX: 6, tileY: 4,
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
            'Chào bạn! Mình là Nhật, Chủ nhiệm của CLB Lập Trình FU-DEVER.',
            'Bạn đang tìm hiểu về câu lạc bộ phải không?',
            'Hiện tại FU-DEVER có 4 sub-team chuyên môn: Web, AI, Mobile và Game Dev.'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Mỗi sub-team đều có mentor 1:1, workshop chuyên sâu và dự án thực chiến.',
            'Nếu bạn muốn nâng trình code và kết nối cộng đồng, cứ đăng ký tham gia nhé!',
            'Cần hỗ trợ bất cứ điều gì, bạn cứ hỏi tụi mình, đừng ngại nha.'
          ],
          nextDialogue: 'line_1'
        }
      }
    },
    {
      id: 'npc_pho_hung',
      name: 'Nguyễn Thái Hưng',
      role: 'Phó Chủ Nhiệm CLB • K20',
      tileX: 14, tileY: 4,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'wolf_cut',
        hairColor: '#334155',
        skinTone: 'skin_fair',
        outfitType: 'hoodie',
        hoodieColor: '#4f46e5',
        collarColor: '#4338ca',
        pantsColor: '#1e293b',
        accessory: 'none',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Hello! Bạn thấy khuôn viên Metaverse của CLB thế nào?',
            'Đây là thế giới DEVER TOWN do chính các thành viên FU-DEVER phát triển.',
            'Ngoài ra tụi mình còn có đấu trường lập trình dever-arena và web fudever.com nữa đó!'
          ],
          nextDialogue: 'line_1'
        }
      }
    },
    {
      id: 'npc_thuky_anh',
      name: 'Nguyễn Thị Ngọc Ánh',
      role: 'Thư Ký CLB • K20',
      tileX: 10, tileY: 6,
      direction: 'down',
      spriteConfig: {
        gender: 'female',
        hairstyle: 'ponytail',
        hairColor: '#0f172a',
        skinTone: 'skin_fair',
        outfitType: 'aodai',
        hoodieColor: '#ea580c',
        collarColor: '#002147',
        pantsColor: '#ffffff',
        accessory: 'glasses_smart',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Chào bạn! Mình là Ngọc Ánh, Thư ký của CLB Lập Trình FU-DEVER.',
            'Mình phụ trách quản lý hồ sơ thành viên, tài chính và điều phối hoạt động chung.',
            'Nếu bạn cần hỗ trợ thủ tục gia nhập CLB hay đóng quỹ hoạt động, cứ nhắn mình nhé!'
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
      role: 'Chuyên Gia Pha Chế Cà Phê Muối',
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
            'Xin chào! Hôm nay bạn muốn dùng gì nào?',
            'Cà phê muối Đà Nẵng là món đặc trưng tiếp năng lượng cày code của quán mình!',
            'Một ly cà phê bọt muối thơm béo + fix sạch bug — combo chuẩn bài luôn!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  library_lounge: [
    {
      id: 'npc_hocthu_kiet',
      name: 'Lương Văn Tuấn Kiệt',
      role: 'Trưởng Ban Học Thuật',
      tileX: 12, tileY: 5,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'buzz_cut',
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
            'Ban Học Thuật phụ trách các buổi training, workshop chuyên sâu và bootcamp cho thành viên.',
            'Từ thuật toán cơ bản đến kiến trúc phần mềm, tụi mình đều có lộ trình chi tiết.',
            'Sắp tới kỳ thi PE và FE, tụi mình sẽ mở các lớp ôn tập đồ án, bạn nhớ tham gia nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  dever_lab: [
    {
      id: 'npc_game_lead_thanh',
      name: 'Nguyễn Lê Đăng Thành',
      role: 'Trưởng Ban Game Development',
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
            'Hello bro! Mình là Thành, lead của Game Dev Sub-team.',
            'Thế giới DEVER TOWN mà bạn đang trải nghiệm được xây dựng bằng Phaser 3 và Socket.io đó!',
            'Nếu bạn đam mê thiết kế gameplay, pixel art hay game mechanics, vào team mình cùng chiến nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  sports_complex: [
    {
      id: 'npc_sukien_thang',
      name: 'Hồ Quốc Thắng',
      role: 'Trưởng Ban Sự Kiện • K20',
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
            'Chào bạn! Ban Sự Kiện chuyên lo khâu tổ chức các ngày hội lớn cho CLB nè.',
            'Sắp tới có Club Day và giải thể thao teambuilding siêu cháy, bạn nhớ ghé chơi nha.',
            'Code hết mình và thể thao cũng phải hết sức — chuẩn tinh thần builder FPTU!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  media_hub: [
    {
      id: 'npc_media_hai',
      name: 'Đoàn Phước Trường Hải',
      role: 'Trưởng Ban Truyền Thông',
      tileX: 10, tileY: 7,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'undercut',
        hairColor: '#92400e',
        skinTone: 'skin_natural',
        outfitType: 'polo',
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
            'Chào bạn! Ban Truyền Thông là nơi phụ trách hình ảnh, video highlight và Fanpage FU-DEVER.',
            'Mọi bài viết công nghệ, recap sự kiện và poster ấn phẩm đều do tụi mình thực hiện.',
            'Nhớ theo dõi Fanpage CLB để cập nhật những hoạt động mới nhất nhé!'
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
      role: 'Ban Cố Vấn & Lịch Sử CLB',
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
            'Căn phòng này lưu giữ những ký ức và cột mốc đáng tự hào của FU-DEVER qua nhiều năm.',
            'CLB được thành lập từ những ngày đầu trường ĐH FPT Đà Nẵng đi vào hoạt động.',
            'Mỗi cúp vô địch, mỗi tấm bằng khen là một trang sử của đại gia đình chúng ta.'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Hackathon, CTF, Game Jam hay ICPC... đây đều là những dấu ấn rực rỡ của các thế hệ coder.',
            'Bạn chính là thế hệ tiếp theo để viết tiếp những trang sử vẻ vang ấy.',
            'Chúc bạn có những trải nghiệm thật ý nghĩa tại FU-DEVER!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  web_room: [
    {
      id: 'npc_backend_khoa',
      name: 'Lê Đình Đăng Khoa',
      role: 'Backend Lead • Core Dev',
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
            'Mình đang tối ưu lại kiến trúc backend và cấu trúc database cho toàn hệ thống.',
            'Tụi mình dùng Node.js, API RESTful, WebSocket và PostgreSQL để xử lý đồng thời lượng lớn người chơi.',
            'Hệ thống luôn cần tối ưu hiệu năng và độ trễ, bạn có hứng thú với Backend thì trao đổi cùng mình nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  game_arcade: [
    {
      id: 'npc_algo_truyen',
      name: 'Phạm Đức Truyền',
      role: 'Algorithm Lead • Đội Tuyển ICPC',
      tileX: 12, tileY: 8,
      direction: 'down',
      spriteConfig: {
        gender: 'male',
        hairstyle: 'undercut',
        hairColor: '#0284c7',
        skinTone: 'skin_fair',
        outfitType: 'hoodie',
        hoodieColor: '#0369a1',
        collarColor: '#075985',
        pantsColor: '#1e293b',
        accessory: 'glasses_smart',
        expression: 'expr_focus'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Chào bạn! Bạn có niềm đam mê với Competitive Programming hay thuật toán không?',
            'Đội tuyển ICPC FU-DEVER thường xuyên tổ chức luyện tập và thi đấu trên đấu trường dever-arena.',
            'Giải thuật không hề khô khan, quan trọng là tư duy tối ưu để thuật toán chạy trong O(n log n)!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ]
};
