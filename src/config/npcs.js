export const NPC_CONFIG = {
  main_hall: [
    {
      id: 'npc_chunhiem_nhat',
      name: 'Dang Quang Nhat',
      role: 'Chu Nhiem CLB • K20',
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
            'Chao cau! Minh la Nhat, Chu nhiem cua FU-DEVER.',
            'Cau dang tim hieu ve cau lac bo phai khong?',
            'Ben minh hien tai co 4 sub-team la Web, AI, Mobile va Game.'
          ],
          nextDialogue: 'line_2'
        },
        line_2: {
          lines: [
            'Moi team deu co rat nhieu hoat dong va du an thuc te.',
            'Neu thay hung thu thi dung ngai join voi tui minh nhe!',
            'Can gi cu hoi minh, dung ngai nha.'
          ],
          nextDialogue: 'line_1'
        }
      }
    },
    {
      id: 'npc_pho_hung',
      name: 'Nguyen Thai Hung',
      role: 'Pho Chu Nhiem CLB',
      tileX: 10, tileY: 6,
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
            'Hello! Cau thay khuon vien cau lac bo the nao?',
            'Day la mot phan cua du an DEVER TOWN tui minh dang phat trien.',
            'Ngoai ra con co he thong dever-arena va web fudever.com nua do.'
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
      id: 'npc_hocthu_kiet',
      name: 'Luong Van Tuan Kiet',
      role: 'Truong Ban Hoc Thuat',
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
            'Ban Hoc Thuat ben minh chuyen lo may vu training cho member do.',
            'Tu may cai bootcamp co ban den workshop chuyen sau luon.',
            'Sap toi co mua thi PE voi FE, chac tui minh lai mo lop on tap tiep.'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  dever_lab: [
    {
      id: 'npc_game_lead_thanh',
      name: 'Nguyen Le Dang Thanh',
      role: 'Game Development Lead',
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
            'Hello bro, minh la Thanh, lead cua Game Team.',
            'Cai DEVER TOWN ban dang choi la tui minh lam bang Phaser 3 do.',
            'Ngay xua tap tanh ve pixel art chua quen tay nhung gio muot roi!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  sports_complex: [
    {
      id: 'npc_sukien_thang',
      name: 'Ho Quoc Thang',
      role: 'Truong Ban Su Kien • K20',
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
            'Chao ban! Ban Su Kien chuyen to chuc may cai event cho CLB ne.',
            'Sua soan cho Club Day sap toi ban ghe luon, ban den choi nha.',
            'Tham gia teambuilding de gan ket tinh cam anh em nua!'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  media_hub: [
    {
      id: 'npc_media_hai',
      name: 'Doan Phuoc Truong Hai',
      role: 'Truong Ban Truyen Thong',
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
            'Helo, ban Truyen Thong la noi quan ly fanpage voi dang bai do.',
            'May cai content ban doc hay video highlight la do ben minh lam ne.',
            'Can xin chu ky vao ban hay lien he dang tin thi cu keu minh nha!'
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
      id: 'npc_backend_khoa',
      name: 'Le Dinh Dang Khoa',
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
            'Minh dang chinh lai cai architecture cho backend he thong.',
            'Chu yeu ben minh code Node.js, lam API voi quan ly may cai database.',
            'He thong sap toi keo view cao nen phai toi uu ky lam.'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ],
  game_arcade: [
    {
      id: 'npc_algo_truyen',
      name: 'Pham Duc Truyen',
      role: 'Algorithm / ICPC Lead',
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
            'Ban co hung thu voi competitive programming khong?',
            'Doi tuyen ICPC thuong xuyen to chuc thi tran dever-arena do.',
            'Giai thuat khong kho, quan trong la code dung ma khong bi Time Limit.'
          ],
          nextDialogue: 'line_1'
        }
      }
    }
  ]
};
