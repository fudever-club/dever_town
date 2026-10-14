export const NPC_CONFIG = {
  main_hall: [
    {
      id: 'npc_chunhiem_nhat',
      name: 'Đặng Quang Nhật',
      role: 'Chủ Nhiệm CLB • K20',
      tileX: 19, tileY: 17,
      x: 620, y: 560,
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
      tileX: 27, tileY: 17,
      x: 860, y: 560,
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
      tileX: 23, tileY: 16,
      x: 746, y: 520,
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
    },
    {
      // Phase C — Trạm Y Tế FPTU tại Tòa Alpha: hồi sinh khi KO, phát Vitamin C.
      id: 'npc_yta_clinic',
      name: 'Cô Y Tá',
      role: 'Trạm Y Tế FPTU • Tòa Alpha',
      tileX: 30, tileY: 18,
      x: 960, y: 580,
      direction: 'down',
      spriteConfig: {
        gender: 'female',
        hairstyle: 'bun',
        hairColor: '#0f172a',
        skinTone: 'skin_natural',
        outfitType: 'polo',
        hoodieColor: '#f8fafc',
        collarColor: '#0ea5e9',
        pantsColor: '#1e293b',
        accessory: 'none',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Chào em, cô là Y tá của Trạm Y Tế FPTU tại Tòa Alpha.',
            'Em vừa được hồi sinh ở đây với đầy 50/50 HP. Đây, cô cho em viên Vitamin C nè.',
            'Nhớ giữ gìn sức khỏe, đừng để deadline dí đến kiệt sức nữa nhé.'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Trong Vùng An Toàn, em sẽ tự hồi phục đầy HP, cứ yên tâm nghỉ ngơi.',
            'Cần sơ cứu hay tư vấn sức khỏe thì ghé qua cô nhé.'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  alpha_interior: [
    {
      id: 'npc_thuky_anh',
      name: 'Nguyễn Thị Ngọc Ánh',
      role: 'Thư Ký CLB • K20',
      x: 684, y: 350, // Đứng sau Quầy Lễ Tân tròn trung tâm
      tileX: 21, tileY: 11,
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
            'Chào bạn đến với Sảnh Tòa Alpha! Mình là Ngọc Ánh, Thư ký FU-DEVER.',
            'Tại quầy lễ tân này, bạn có thể xem danh sách thành viên và các sự kiện sắp diễn ra.',
            'Nếu cần hỗ trợ bất cứ thủ tục gì, cứ nhắn mình nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    },
    {
      id: 'npc_chunhiem_nhat',
      name: 'Đặng Quang Nhật',
      role: 'Chủ Nhiệm CLB • K20',
      x: 520, y: 320, // Cạnh Bảng Tin Hoạt Động CLB
      tileX: 16, tileY: 10,
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
            'Đây là sảnh chính của Tòa Alpha — cửa ngõ kết nối toàn bộ hệ thống phòng lab và thư viện.',
            'CLB có 4 sub-team: Web, AI, Mobile và Game Dev. Bạn hứng thú với mảng nào nhất?'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Bên cánh trái là phòng Tech & AI Lab, cánh phải là phòng họp và thư viện.',
            'Bạn cứ tự do tham quan và trải nghiệm các tính năng nhé!'
          ],
          nextDialogue: 'line_1'
        }
      }
    },
    {
      id: 'npc_pho_hung',
      name: 'Nguyễn Thái Hưng',
      role: 'Phó Chủ Nhiệm CLB • K20',
      x: 430, y: 440, // Vách kính quan sát Lab Công Nghệ
      tileX: 13, tileY: 14,
      direction: 'right',
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
            'Hello! Nhìn qua vách kính này bạn sẽ thấy toàn bộ dàn máy của Tech Lab.',
            'Tụi mình đang chuẩn bị cho sự kiện Hackathon và đấu trường Code Arena đó.',
            'Có ý tưởng minigame hay dự án gì thú vị, cứ rủ mình cùng build nha!'
          ],
          nextDialogue: 'line_1'
        }
      }
    },
    {
      id: 'npc_yta_clinic',
      name: 'Cô Y Tá',
      role: 'Trạm Y Tế FPTU • Tòa Alpha',
      x: 1040, y: 440, // Góc Trạm Y Tế & Lounge Lofi
      tileX: 32, tileY: 14,
      direction: 'down',
      spriteConfig: {
        gender: 'female',
        hairstyle: 'bun',
        hairColor: '#0f172a',
        skinTone: 'skin_natural',
        outfitType: 'polo',
        hoodieColor: '#f8fafc',
        collarColor: '#0ea5e9',
        pantsColor: '#1e293b',
        accessory: 'none',
        expression: 'expr_smile'
      },
      startDialogue: 'line_1',
      dialogues: {
        line_1: {
          lines: [
            'Chào em, đây là góc sơ cứu y tế của Tòa Alpha.',
            'Nếu em vừa tham gia thi đấu hoặc chạy deadline mệt mỏi, cứ ngồi nghỉ tại sofa nhé.',
            'Cô luôn có sẵn Vitamin C và nước ấm cho các bạn sinh viên.'
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
      x: 880, y: 220,
      tileX: 19, tileY: 3,
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
      x: 1045, y: 380,
      tileX: 16, tileY: 6,
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
      id: 'npc_algo_truyen',
      name: 'Phạm Đức Truyền',
      role: 'Algorithm Lead • Đội Tuyển ICPC',
      tileX: 7, tileY: 18,
      x: 220, y: 600,
      direction: 'right',
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
    },
    {
      id: 'npc_media_hai',
      name: 'Đoàn Phước Trường Hải',
      role: 'Trưởng Ban Truyền Thông',
      tileX: 10, tileY: 8,
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
  game_arcade: [
    {
      id: 'npc_game_lead_thanh',
      name: 'Nguyễn Lê Đăng Thành',
      role: 'Trưởng Ban Game Development',
      tileX: 22, tileY: 8,
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
  ]
};
