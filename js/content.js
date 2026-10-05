/**
 * content.js — Toàn bộ nội dung text của portfolio
 * ═══════════════════════════════════════════════════
 * Sửa file này để thay đổi nội dung mà KHÔNG cần đụng vào code hiệu ứng.
 * Mỗi section tương ứng với một key trong object CONTENT.
 */

/* exported CONTENT */
const CONTENT = {

  // ─── META ──────────────────────────────────
  meta: {
    title: 'Trần Đăng Trung Kiên — Portfolio',
    description:
      'Portfolio của Trần Đăng Trung Kiên — Sinh viên Kinh tế quốc tế, Đại học Ngoại thương',
  },

  // ─── HERO ──────────────────────────────────
  hero: {
    name: 'Trần Đăng Trung Kiên',
    subtitle: 'Sinh viên Kinh tế quốc tế – Đại học Ngoại thương',
    scrollCta: 'Khám phá',
  },

  // ─── ABOUT ─────────────────────────────────
  about: {
    label: 'GIỚI THIỆU',
    coordinates: '21.0285°N · 105.8542°E — HÀ NỘI',
    bio:
      'Sinh viên năm 4 ngành Kinh tế quốc tế tại Đại học Ngoại thương, với nền tảng ' +
      'vững chắc trong quản lý dự án, phân tích tài chính và truyền thông. Đam mê khám ' +
      'phá những lĩnh vực mới và không ngừng phát triển bản thân qua từng trải nghiệm thực tế.',
    stats: [
      { label: 'CHƯƠNG TRÌNH', value: 'Kinh tế quốc tế' },
      { label: 'KHÓA',         value: '2023 – 2027' },
      { label: 'IELTS',        value: '8.0' },
      { label: 'TRẠNG THÁI',   value: 'Năm 4' },
    ],
  },

  // ─── EXPERIENCE ────────────────────────────
  experience: {
    label: 'KINH NGHIỆM',
    timeline: [
      {
        period: '08/2025 – nay',
        months: 2,
        title: 'Thực tập sinh mua hàng dự án',
        org: 'Công ty TNHH Vina Foam Việt Nam',
        desc:
          'Lên kế hoạch và thực hiện mua hàng theo sản xuất của công ty, ' +
          'đồng thời xử lý mua các danh mục của dự án thầu.',
      },
      {
        period: '06/2025 – nay',
        months: 4,
        title: 'Giáo viên tiếng Anh',
        org: 'Công ty TNHH Clevai',
        desc: 'Dạy lớp 6–8 học viên.',
      },
      {
        period: '03/2025 – 04/2025',
        months: 2,
        title: 'Thực tập sinh nhân sự',
        org: 'Công ty TNHH HiUP',
        desc: 'Hỗ trợ tuyển dụng nhân sự.',
      },
      {
        period: '11/2024 – 02/2025',
        months: 4,
        title: 'Thực tập sinh nghiệp vụ chứng khoán',
        org: 'Công ty CP Chứng khoán VNDirect',
        desc:
          'Thu thập và tổng hợp thông tin về các mã cổ phiếu; phân tích báo cáo ' +
          'tài chính và lập kế hoạch đầu tư cơ bản; liên hệ và hỗ trợ khách hàng ' +
          'đăng ký tài khoản.',
      },
      {
        period: '06/2024 – 02/2025',
        months: 9,
        title: 'Giáo viên tiếng Anh',
        org: 'Công ty TNHH Giáo dục Educa',
        desc: 'Giảng dạy lớp 3–4 học viên.',
      },
      {
        period: '06/2023 – 04/2024',
        months: 11,
        title: 'Trợ giảng tiếng Anh',
        org: 'Công ty TNHH IMAP Việt Nam',
        desc: 'Hỗ trợ giáo viên chuẩn bị và giảng dạy trên lớp.',
      },
    ],
  },

  // ─── ACTIVITIES ────────────────────────────
  activities: {
    label: 'HOẠT ĐỘNG',
    items: [
      {
        period: '08/2024 – 07/2025',
        title: 'Phó chủ tịch',
        org: 'Câu lạc bộ tiếng Anh Đại học Ngoại thương',
        tasks: [
          'Quản lý hệ thống dữ liệu câu lạc bộ',
          'Lên kế hoạch chuỗi sự kiện trong năm',
          'Nghiên cứu và phát triển quy trình làm việc của câu lạc bộ',
        ],
      },
    ],
  },

  // ─── SKILLS — BẢN ĐỒ CHÒM SAO KỸ NĂNG (STELLAR CONSTELLATION MATRIX) ─
  skills: {
    label: 'BẢN ĐỒ CHÒM SAO KỸ NĂNG',
    coords: 'STELLAR CAPABILITIES // NAVIGATIONAL MATRIX',
    summary: '4 Chòm sao năng lực liên kết đa chiều trên bầu trời kinh tế quốc tế và công nghệ số.',
    groups: [
      {
        id: 'professional',
        title: 'Professional Knowledge',
        code: 'CONSTELLATION: COMMERCE',
        subtitle: 'Kinh tế Quốc tế & Chuỗi Cung ứng Toàn cầu',
        accent: '#e8a04c', // Warm Amber (Hổ phách ấm)
        stars: [
          { id: 'economics', label: 'Business Economics', x: 0.23, y: 0.28, textAnchor: 'middle', links: ['trade', 'imex'], crossRef: 'data_analysis' },
          { id: 'trade', label: 'International Trade', x: 0.50, y: 0.18, textAnchor: 'middle', links: ['economics', 'imex', 'supply'] },
          { id: 'supply', label: 'Supply Chain', x: 0.77, y: 0.28, textAnchor: 'middle', links: ['trade', 'logistics'] },
          { id: 'imex', label: 'Import–Export', x: 0.36, y: 0.55, textAnchor: 'middle', links: ['trade', 'customs', 'logistics', 'economics'] },
          { id: 'logistics', label: 'Logistics Operations', x: 0.72, y: 0.65, textAnchor: 'middle', links: ['supply', 'imex'] },
          { id: 'customs', label: 'Customs Clearance', x: 0.25, y: 0.82, textAnchor: 'middle', links: ['imex'], crossRef: 'ecus' },
        ],
      },
      {
        id: 'technical',
        title: 'Tools & Technical Skills',
        code: 'CONSTELLATION: SYSTEMS',
        subtitle: 'Công cụ Phân tích, Khai báo & Tin học Văn phòng',
        accent: '#f0ede6', // Ivory Silver (Trắng bạc / Băng giá)
        stars: [
          { id: 'data_analysis', label: 'Data Analysis', x: 0.23, y: 0.24, textAnchor: 'middle', links: ['excel', 'ecus'], crossRef: 'economics' },
          { id: 'excel', label: 'Microsoft Excel', x: 0.50, y: 0.28, textAnchor: 'middle', links: ['data_analysis', 'powerpoint', 'word', 'ecus'] },
          { id: 'powerpoint', label: 'Microsoft PowerPoint', x: 0.77, y: 0.24, textAnchor: 'middle', links: ['excel', 'outlook'], crossRef: 'presentation' },
          { id: 'word', label: 'Microsoft Word', x: 0.38, y: 0.60, textAnchor: 'middle', links: ['excel', 'outlook'] },
          { id: 'outlook', label: 'Microsoft Outlook', x: 0.77, y: 0.65, textAnchor: 'middle', links: ['powerpoint', 'word'] },
          { id: 'ecus', label: 'ECUS', x: 0.25, y: 0.82, textAnchor: 'middle', links: ['data_analysis', 'excel'], crossRef: 'customs' },
        ],
      },
      {
        id: 'languages',
        title: 'Languages & Communication',
        code: 'CONSTELLATION: NEXUS',
        subtitle: 'Năng lực Đa ngôn ngữ, Thuyết trình & Giao tiếp Đội ngũ',
        accent: '#7dd3fc', // Light Cyan (Xanh lam nhạt)
        stars: [
          { id: 'chinese', label: 'Chinese – Learning', x: 0.24, y: 0.28, textAnchor: 'middle', links: ['english', 'written'] },
          { id: 'english', label: 'English', x: 0.50, y: 0.20, textAnchor: 'middle', links: ['chinese', 'presentation', 'written'], crossRef: 'ielts' },
          { id: 'presentation', label: 'Presentation', x: 0.76, y: 0.30, textAnchor: 'middle', links: ['english', 'teamwork'], crossRef: 'powerpoint' },
          { id: 'written', label: 'Written Communication', x: 0.34, y: 0.68, textAnchor: 'middle', links: ['english', 'chinese', 'teamwork'] },
          { id: 'teamwork', label: 'Teamwork', x: 0.72, y: 0.72, textAnchor: 'middle', links: ['written', 'presentation'] },
        ],
      },
      {
        id: 'certifications',
        title: 'Certifications & Strengths',
        code: 'CONSTELLATION: POLARIS',
        subtitle: 'Chứng chỉ Đỉnh cao & Phẩm chất Tư duy Độc lập',
        accent: '#fde047', // Pale Gold (Vàng kim nhạt / Sao Bắc Đẩu)
        stars: [
          { id: 'ielts', label: 'IELTS 8.0', x: 0.50, y: 0.20, isApex: true, textAnchor: 'middle', links: ['analytical', 'detail', 'self_learning'], crossRef: 'english' },
          { id: 'analytical', label: 'Analytical Thinking', x: 0.23, y: 0.44, textAnchor: 'middle', links: ['ielts', 'detail', 'adaptability'] },
          { id: 'detail', label: 'Attention to Detail', x: 0.77, y: 0.44, textAnchor: 'middle', links: ['ielts', 'analytical', 'self_learning'] },
          { id: 'adaptability', label: 'Adaptability', x: 0.28, y: 0.78, textAnchor: 'middle', links: ['analytical', 'self_learning'] },
          { id: 'self_learning', label: 'Self-learning', x: 0.72, y: 0.78, textAnchor: 'middle', links: ['ielts', 'detail', 'adaptability'] },
        ],
      },
    ],
    crossLinks: [
      { from: 'customs', to: 'ecus', label: 'Customs Clearance ↔ ECUS', desc: 'Thực hành khai báo thủ tục hải quan trực tiếp trên hệ thống ECUS' },
      { from: 'data_analysis', to: 'economics', label: 'Data Analysis ↔ Business Economics', desc: 'Ứng dụng phân tích dữ liệu định lượng vào mô hình kinh tế doanh nghiệp' },
      { from: 'english', to: 'ielts', label: 'English ↔ IELTS 8.0', desc: 'Năng lực tiếng Anh học thuật & chuyên ngành quốc tế' },
      { from: 'presentation', to: 'powerpoint', label: 'Presentation ↔ Microsoft PowerPoint', desc: 'Kỹ năng truyền tải ý tưởng và thiết kế bài thuyết trình trực quan' },
    ],
  },

  // ─── CONTACT ───────────────────────────────
  contact: {
    label: 'LIÊN HỆ',
    status: 'TRANSMISSION CHANNEL OPEN',
    email: 'trungkien1605@gmail.com',
    location: 'Hà Nội, Việt Nam',
    copyLabel: 'Sao chép email',
    copySuccess: 'Đã sao chép!',
  },

  // ─── NAVIGATION ────────────────────────────
  nav: [
    { label: 'Giới thiệu', target: 'about' },
    { label: 'Kinh nghiệm', target: 'experience' },
    { label: 'Hoạt động',   target: 'activities' },
    { label: 'Kỹ năng',     target: 'skills' },
    { label: 'Liên hệ',     target: 'contact' },
  ],
};

// Đảm bảo CONTENT luôn sẵn sàng trên window cho các script khác
if (typeof window !== 'undefined') {
  window.CONTENT = CONTENT;
}

