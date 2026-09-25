const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ============ 图标工具函数 ============
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ============ 颜色体系 ============
const C = {
  darkBg: "0A1628",
  darkBg2: "0F1F38",
  cardBg: "FFFFFF",
  lightBg: "F2F5F9",
  primary: "0077B6",
  primaryDark: "023E8A",
  secondary: "00B4D8",
  accent: "FF6B35",
  accentWarm: "F59E0B",
  textDark: "1A1A2E",
  textBody: "334155",
  textMuted: "5D6F85",     // 加深以提高对比度
  textMutedLight: "A0AEC0", // 深色背景用浅灰
  white: "FFFFFF",
  border: "E2E8F0",
  green: "10B981",
  purple: "7C3AED",
};

// ============ 字体 ============
const FONT = {
  title: "Microsoft YaHei",
  body: "Microsoft YaHei",
};

// ============ 阴影工厂（避免对象复用）============
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.12,
});

// ============ 创建演示文稿 ============
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "视界行者";
  pres.title = "基于深度学习的交通标志与行人车辆检测系统";

  // 导入图标
  const { FaCar, FaCamera, FaVideo, FaLightbulb, FaRocket, FaUsers, FaRoad, FaBrain, FaChartLine, FaCheckCircle, FaStar, FaMapMarkedAlt, FaTrafficLight, FaUserShield, FaCogs, FaProjectDiagram, FaCity } = require("react-icons/fa");
  const { MdSmartToy } = require("react-icons/md");

  // 预渲染图标
  const iconCar = await iconToBase64Png(FaCar, "#" + C.primary, 256);
  const iconCamera = await iconToBase64Png(FaCamera, "#" + C.accent, 256);
  const iconVideo = await iconToBase64Png(FaVideo, "#" + C.secondary, 256);
  const iconBrain = await iconToBase64Png(FaBrain, "#" + C.purple, 256);
  const iconRocket = await iconToBase64Png(FaRocket, "#" + C.green, 256);
  const iconUsers = await iconToBase64Png(FaUsers, "#" + C.primary, 256);
  const iconLightbulb = await iconToBase64Png(FaLightbulb, "#" + C.accentWarm, 256);
  const iconRoad = await iconToBase64Png(FaRoad, "#" + C.primary, 256);
  const iconChart = await iconToBase64Png(FaChartLine, "#" + C.green, 256);
  const iconCheck = await iconToBase64Png(FaCheckCircle, "#" + C.green, 256);
  const iconStar = await iconToBase64Png(FaStar, "#" + C.accentWarm, 256);
  const iconMap = await iconToBase64Png(FaMapMarkedAlt, "#" + C.secondary, 256);
  const iconTraffic = await iconToBase64Png(FaTrafficLight, "#" + C.accent, 256);
  const iconShield = await iconToBase64Png(FaUserShield, "#" + C.primaryDark, 256);
  const iconCogs = await iconToBase64Png(FaCogs, "#" + C.textMuted, 256);
  const iconProject = await iconToBase64Png(FaProjectDiagram, "#" + C.primary, 256);
  const iconCity = await iconToBase64Png(FaCity, "#" + C.primaryDark, 256);
  const iconSmartToy = await iconToBase64Png(MdSmartToy, "#" + C.secondary, 256);

  // ========================================================
  // Slide 1: 封面
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkBg };

    // 顶部装饰线
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.secondary },
    });

    // 左侧装饰竖条
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 1.2, w: 0.06, h: 3.2, fill: { color: C.secondary },
    });

    // 项目名称
    slide.addText("基于深度学习的\n交通标志与行人车辆检测系统", {
      x: 1.0, y: 1.2, w: 8.4, h: 2.0,
      fontSize: 36, fontFace: FONT.title, color: C.white,
      bold: true, align: "left", valign: "middle",
      lineSpacingMultiple: 1.3,
    });

    // 副标题/团队名
    slide.addText("视界行者", {
      x: 1.0, y: 3.2, w: 4, h: 0.6,
      fontSize: 22, fontFace: FONT.title, color: C.secondary,
      bold: true, align: "left",
    });

    // 分隔线
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.0, y: 3.85, w: 2.5, h: 0.015, fill: { color: C.accent },
    });

    // 比赛信息（提高对比度）
    slide.addText([
      { text: "iCAN 大学生创新创业大赛  |  创新赛道  |  智能交通", options: { breakLine: true } },
      { text: "团队成员：温惠锦（负责人） 林叶青  王森涛  郭家兴  汤司达", options: { breakLine: true } },
      { text: "指导老师：金晨磊", options: {} },
    ], {
      x: 1.0, y: 4.05, w: 8, h: 1.0,
      fontSize: 13, fontFace: FONT.body, color: C.textMutedLight,
      align: "left", valign: "top", lineSpacingMultiple: 1.6,
    });

    // 右下角装饰图形（缩小并内移，防止旋转后溢出）
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 8.2, y: 4.6, w: 0.9, h: 0.7,
      fill: { color: C.primaryDark, transparency: 50 },
      rotate: 15,
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 8.3, y: 4.7, w: 0.7, h: 0.5,
      fill: { color: C.secondary, transparency: 60 },
      rotate: 15,
    });
  }

  // ========================================================
  // Slide 2: 目录
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    // 顶部色条
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    // 标题
    slide.addText("汇报目录", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true,
      align: "left", valign: "middle", margin: 0,
    });

    // 目录项 - 2x4 网格布局（加大间距）
    const tocItems = [
      { num: "01", title: "项目背景", sub: "交通安全的痛点与机遇", iconData: iconRoad },
      { num: "02", title: "项目概述", sub: "系统功能与设计目标", iconData: iconProject },
      { num: "03", title: "核心技术", sub: "YOLO深度学习与系统架构", iconData: iconBrain },
      { num: "04", title: "系统功能", sub: "三大检测模式详解", iconData: iconCogs },
      { num: "05", title: "成果展示", sub: "模型性能与检测效果", iconData: iconChart },
      { num: "06", title: "创新亮点", sub: "技术创新与优势分析", iconData: iconLightbulb },
      { num: "07", title: "应用场景", sub: "智慧交通多领域落地", iconData: iconCity },
      { num: "08", title: "团队介绍", sub: "成员分工与协作", iconData: iconUsers },
    ];

    const cardW = 1.95;
    const cardH = 1.45;
    const startX = 0.55;
    const startY = 1.3;
    const gapX = 0.28;
    const gapY = 0.30;
    const cols = 4;

    tocItems.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      // 卡片背景
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH,
        fill: { color: C.lightBg },
        shadow: makeShadow(),
      });

      // 左侧色条
      slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.05, h: cardH, fill: { color: C.primary },
      });

      // 图标
      slide.addImage({
        data: item.iconData, x: x + 0.15, y: y + 0.22, w: 0.35, h: 0.35,
      });

      // 编号
      slide.addText(item.num, {
        x: x + 0.10, y: y + 0.65, w: 0.4, h: 0.35,
        fontSize: 22, fontFace: FONT.title, color: C.primary,
        bold: true, align: "left", valign: "middle", margin: 0,
      });

      // 标题
      slide.addText(item.title, {
        x: x + 0.50, y: y + 0.60, w: 1.3, h: 0.4,
        fontSize: 14, fontFace: FONT.title, color: C.textDark,
        bold: true, align: "left", valign: "middle", margin: 0,
      });

      // 副标题
      slide.addText(item.sub, {
        x: x + 0.15, y: y + 0.98, w: 1.65, h: 0.35,
        fontSize: 9, fontFace: FONT.body, color: C.textMuted,
        align: "left", valign: "top", margin: 0,
      });
    });
  }

  // ========================================================
  // Slide 3: 项目背景
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("项目背景", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    // 左侧：痛点文本
    const painPoints = [
      { text: "交通安全形势严峻", options: { fontSize: 20, bold: true, color: C.textDark, breakLine: true } },
      { text: "据统计，全球每年约135万人死于交通事故，中国交通事故年死亡人数居世界前列。交通参与者的实时感知与预警是降低事故率的关键。", options: { fontSize: 12, color: C.textBody, breakLine: true, paraSpaceAfter: 12 } },
      { text: "传统检测手段局限性", options: { fontSize: 20, bold: true, color: C.textDark, breakLine: true } },
      { text: "传统交通监测依赖人工巡查和固定传感器，存在覆盖盲区大、响应速度慢、人工成本高等问题，难以满足智慧交通的实时性要求。", options: { fontSize: 12, color: C.textBody, breakLine: true, paraSpaceAfter: 12 } },
      { text: "深度学习赋能交通感知", options: { fontSize: 20, bold: true, color: C.textDark, breakLine: true } },
      { text: "YOLO等深度学习目标检测算法的快速发展，使得高精度、实时性的交通多目标检测成为可能，为智能交通系统提供核心技术支撑。", options: { fontSize: 12, color: C.textBody } },
    ];

    slide.addText(painPoints, {
      x: 0.6, y: 1.2, w: 5.2, h: 4.0,
      fontFace: FONT.body, align: "left", valign: "top",
    });

    // 右侧：数据卡片（加大间距和宽度）
    // 卡片1
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.2, y: 1.3, w: 3.3, h: 1.65,
      fill: { color: C.darkBg },
      shadow: makeShadow(),
    });
    slide.addText([
      { text: "135万", options: { fontSize: 38, bold: true, color: C.accent, breakLine: true } },
      { text: "全球每年交通事故死亡人数", options: { fontSize: 12, color: C.textMutedLight, breakLine: true } },
      { text: "数据来源：WHO《全球道路安全报告》", options: { fontSize: 9, color: C.textMutedLight } },
    ], {
      x: 6.4, y: 1.45, w: 2.9, h: 1.35,
      fontFace: FONT.body, align: "center", valign: "middle",
    });

    // 卡片2（增加间距到0.35）
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 6.2, y: 3.3, w: 3.3, h: 1.65,
      fill: { color: C.primary },
      shadow: makeShadow(),
    });
    slide.addText([
      { text: "3000亿+", options: { fontSize: 36, bold: true, color: C.white, breakLine: true } },
      { text: "智慧交通市场规模（2026年）", options: { fontSize: 12, color: "CBD5E1", breakLine: true } },
      { text: "来源：前瞻产业研究院", options: { fontSize: 9, color: "CBD5E1" } },
    ], {
      x: 6.4, y: 3.45, w: 2.9, h: 1.35,
      fontFace: FONT.body, align: "center", valign: "middle",
    });
  }

  // ========================================================
  // Slide 4: 项目概述
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("项目概述", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    // 左侧：系统描述（缩小高度，避免与底部统计条重叠）
    slide.addText([
      { text: "系统简介", options: { fontSize: 18, bold: true, color: C.primary, breakLine: true, paraSpaceAfter: 8 } },
      { text: "本系统是一款基于YOLO深度学习模型的智能交通目标检测系统，能够实时识别道路场景中的交通标志、行人及各类车辆，为智慧交通、自动驾驶和道路安全监测提供精准的视觉感知能力。", options: { fontSize: 13, color: C.textBody, breakLine: true, paraSpaceAfter: 12 } },
      { text: "核心能力", options: { fontSize: 18, bold: true, color: C.primary, breakLine: true, paraSpaceAfter: 6 } },
      { text: "• 支持9类交通目标精准识别（交通信号灯/停止信号/限速信号/人行横道信号/人行横道/行人/公交车/汽车/卡车）", options: { fontSize: 12, color: C.textBody, breakLine: true, paraSpaceAfter: 5 } },
      { text: "• 三种检测模式：图片检测、视频检测、摄像头实时检测", options: { fontSize: 12, color: C.textBody, breakLine: true, paraSpaceAfter: 5 } },
      { text: "• PyQt5桌面应用，操作直观，部署便捷", options: { fontSize: 12, color: C.textBody, breakLine: true, paraSpaceAfter: 5 } },
      { text: "• 基于YOLOv8/YOLOv11架构，检测速度快、精度高", options: { fontSize: 12, color: C.textBody } },
    ], {
      x: 0.6, y: 1.15, w: 4.6, h: 3.4,  // 缩小高度
      fontFace: FONT.body, align: "left", valign: "top",
    });

    // 右侧：主界面截图
    slide.addImage({
      path: "E:\\project\\python1\\截图\\主界面.png",
      x: 5.5, y: 1.15, w: 4.0, h: 2.7,
      sizing: { type: "contain", w: 4.0, h: 2.7 },
    });

    // 截图标注（增加间距）
    slide.addText("▲ 系统主界面（PyQt5）", {
      x: 5.5, y: 3.95, w: 4.0, h: 0.3,
      fontSize: 10, fontFace: FONT.body, color: C.textMuted, align: "center", margin: 0,
    });

    // 底部统计数据条
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 4.65, w: 8.8, h: 0.6, fill: { color: C.lightBg },
    });

    const stats = [
      { num: "9", label: "识别类别" },
      { num: "3", label: "检测模式" },
      { num: "60+", label: "训练轮次" },
      { num: "1500+", label: "数据集样本" },
    ];

    stats.forEach((s, i) => {
      const sx = 1.0 + i * 2.2;
      slide.addText(s.num, {
        x: sx, y: 4.67, w: 0.8, h: 0.35,
        fontSize: 20, fontFace: FONT.title, color: C.primary, bold: true,
        align: "center", valign: "middle", margin: 0,
      });
      slide.addText(s.label, {
        x: sx + 0.7, y: 4.67, w: 1.2, h: 0.35,
        fontSize: 12, fontFace: FONT.body, color: C.textMuted,
        align: "left", valign: "middle", margin: 0,
      });
    });
  }

  // ========================================================
  // Slide 5: 核心技术
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("核心技术", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    // 技术架构卡片 - 3列布局（增加间距）
    const techCards = [
      {
        title: "YOLO 目标检测算法",
        icon: iconBrain,
        items: [
          "基于YOLOv8 / YOLOv11架构",
          "CSPDarknet骨干网络",
          "PAN-FPN特征金字塔",
          "CIoU损失函数优化",
          "多尺度特征融合",
        ],
      },
      {
        title: "PyQt5 桌面应用",
        icon: iconProject,
        items: [
          "多线程检测架构",
          "实时画面渲染与标注",
          "OpenCV视频流处理",
          "自定义QSS样式美化",
          "模块化UI组件设计",
        ],
      },
      {
        title: "数据处理与训练",
        icon: iconCogs,
        items: [
          "自定义数据集标注",
          "YOLO格式坐标转换",
          "数据增强与预处理",
          "SGD优化器训练",
          "混淆矩阵与PR曲线评估",
        ],
      },
    ];

    const cardW = 2.85;
    const cardH = 3.8;
    const cardGap = 0.28;
    const totalW = cardW * 3 + cardGap * 2;
    const startX = (10 - totalW) / 2; // 居中

    techCards.forEach((card, i) => {
      const cx = startX + i * (cardW + cardGap);
      const cy = 1.2;

      // 卡片背景
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: cardW, h: cardH,
        fill: { color: C.lightBg },
      });

      // 顶部色带
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: cardW, h: 0.06,
        fill: { color: [C.primary, C.secondary, C.accent][i] },
      });

      // 图标
      slide.addImage({
        data: card.icon, x: cx + 0.22, y: cy + 0.25, w: 0.45, h: 0.45,
      });

      // 标题（加大宽度）
      slide.addText(card.title, {
        x: cx + 0.75, y: cy + 0.25, w: 1.95, h: 0.45,
        fontSize: 15, fontFace: FONT.title, color: C.textDark,
        bold: true, align: "left", valign: "middle", margin: 0,
      });

      // 技术点列表
      const items = card.items.map((item, j) => ({
        text: item,
        options: {
          bullet: true,
          fontSize: 12,
          color: C.textBody,
          breakLine: j < card.items.length - 1,
          paraSpaceAfter: 6,
        },
      }));

      slide.addText(items, {
        x: cx + 0.3, y: cy + 0.95, w: cardW - 0.5, h: cardH - 1.15,
        fontFace: FONT.body, align: "left", valign: "top",
      });
    });
  }

  // ========================================================
  // Slide 6: 系统功能
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkBg };

    slide.addText("系统功能", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.white, bold: true, margin: 0,
    });

    slide.addText("三种检测模式，全面覆盖交通场景感知需求", {
      x: 0.6, y: 0.9, w: 8.8, h: 0.4,
      fontSize: 13, fontFace: FONT.body, color: C.textMutedLight, margin: 0,
    });

    // 三个功能卡片（加大间距）
    const funcCards = [
      {
        title: "图片检测",
        sub: "Image Detection",
        icon: iconCamera,
        desc: "支持单张/批量图片导入，一键检测并标注交通目标，支持结果导出与保存。",
        features: ["单图/批量检测", "结果可视化标注", "检测数据CSV导出"],
      },
      {
        title: "视频检测",
        sub: "Video Detection",
        icon: iconVideo,
        desc: "导入视频文件进行逐帧检测，实时显示检测进度与结果，支持检测后视频导出。",
        features: ["逐帧智能检测", "实时进度展示", "带标注视频导出"],
      },
      {
        title: "实时检测",
        sub: "Real-time Detection",
        icon: iconTraffic,
        desc: "调用摄像头进行实时交通目标检测，毫秒级推理速度，适合道路实时监测场景。",
        features: ["摄像头实时输入", "毫秒级推理响应", "无延时画面渲染"],
      },
    ];

    const fCardW = 2.85;
    const fCardH = 3.6;
    const fCardGap = 0.28;
    const fTotalW = fCardW * 3 + fCardGap * 2;
    const fStartX = (10 - fTotalW) / 2; // 居中

    funcCards.forEach((card, i) => {
      const cx = fStartX + i * (fCardW + fCardGap);
      const cy = 1.55;

      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: fCardW, h: fCardH,
        fill: { color: C.darkBg2 },
      });

      // 图标圆圈（修正居中）
      const circleCenterX = cx + fCardW / 2;
      const circleY = cy + 0.2;
      const circleR = 0.4;
      slide.addShape(pres.shapes.OVAL, {
        x: circleCenterX - circleR, y: circleY, w: circleR * 2, h: circleR * 2,
        fill: { color: [C.primary, C.secondary, C.accent][i] },
      });

      slide.addImage({
        data: card.icon,
        x: circleCenterX - 0.2, y: circleY + 0.2, w: 0.4, h: 0.4,
      });

      // 标题
      slide.addText(card.title, {
        x: cx + 0.2, y: cy + 1.2, w: fCardW - 0.4, h: 0.4,
        fontSize: 20, fontFace: FONT.title, color: C.white, bold: true,
        align: "center", valign: "middle", margin: 0,
      });

      // 英文副标题
      slide.addText(card.sub, {
        x: cx + 0.2, y: cy + 1.58, w: fCardW - 0.4, h: 0.28,
        fontSize: 10, fontFace: FONT.body, color: C.textMutedLight,
        align: "center", valign: "middle", margin: 0,
      });

      // 描述
      slide.addText(card.desc, {
        x: cx + 0.3, y: cy + 1.95, w: fCardW - 0.6, h: 0.65,
        fontSize: 11, fontFace: FONT.body, color: "CBD5E1",
        align: "center", valign: "top",
      });

      // 功能点列表
      const feats = card.features.map((f, j) => ({
        text: f,
        options: {
          bullet: true,
          fontSize: 11,
          color: C.secondary,
          breakLine: j < card.features.length - 1,
          paraSpaceAfter: 4,
        },
      }));

      slide.addText(feats, {
        x: cx + 0.5, y: cy + 2.75, w: fCardW - 0.9, h: 0.7,
        fontFace: FONT.body, align: "left", valign: "top",
      });
    });
  }

  // ========================================================
  // Slide 7: 功能展示 — 图片检测
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("功能展示 — 图片检测", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.6,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    slide.addText("支持单张/批量图片导入，自动识别并标注交通标志、行人及车辆，结果一键导出", {
      x: 0.6, y: 0.85, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: FONT.body, color: C.textMuted, margin: 0,
    });

    // 截图
    slide.addImage({
      path: "E:\\project\\python1\\截图\\运行时（图片检测）.png",
      x: 0.8, y: 1.3, w: 8.4, h: 3.9,
      sizing: { type: "contain", w: 8.4, h: 3.9 },
    });
  }

  // ========================================================
  // Slide 8: 功能展示 — 视频检测
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    // 微调顶部色条颜色以增加变化
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.secondary },
    });

    slide.addText("功能展示 — 视频检测", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.6,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    slide.addText("支持视频文件导入，逐帧智能检测并实时标注，可导出带标注框的结果视频", {
      x: 0.6, y: 0.85, w: 8.8, h: 0.35,
      fontSize: 12, fontFace: FONT.body, color: C.textMuted, margin: 0,
    });

    // 截图
    slide.addImage({
      path: "E:\\project\\python1\\截图\\运行时（视频检测）.png",
      x: 0.8, y: 1.3, w: 8.4, h: 3.9,
      sizing: { type: "contain", w: 8.4, h: 3.9 },
    });
  }

  // ========================================================
  // Slide 9: 创新亮点
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("创新亮点", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    // 四个创新卡片 - 2x2网格（调整间距）
    const innovations = [
      {
        title: "多类别联合检测",
        desc: "创新性地将交通标志（4类）、行人、车辆（3类）、道路标线统一纳入单一检测框架，实现9类目标同步识别，减少多模型部署开销。",
        icon: iconStar,
        accent: C.accentWarm,
      },
      {
        title: "端到端桌面应用",
        desc: "突破纯算法demo局限，构建完整的PyQt5桌面应用，支持图片/视频/摄像头三种输入模式，产品化程度高，开箱即用。",
        icon: iconRocket,
        accent: C.green,
      },
      {
        title: "中文友好适配",
        desc: "针对中文场景优化，支持中文路径图片读取、中文类别标注显示、自定义中文字体渲染，解决OpenCV中文支持不足的问题。",
        icon: iconCheck,
        accent: C.primary,
      },
      {
        title: "模型灵活可扩展",
        desc: "采用YOLO标准模型接口，支持YOLOv8/YOLOv11等多版本切换，可快速适配新数据集和检测类别，具备良好的扩展性。",
        icon: iconSmartToy,
        accent: C.secondary,
      },
    ];

    innovations.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 0.6 + col * 4.5;
      const cy = 1.25 + row * 2.15;
      const cw = 4.2;
      const ch = 1.9;

      // 卡片背景
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: cw, h: ch,
        fill: { color: C.lightBg },
      });

      // 左侧色条
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: 0.06, h: ch, fill: { color: item.accent },
      });

      // 图标圆圈
      slide.addShape(pres.shapes.OVAL, {
        x: cx + 0.25, y: cy + 0.35, w: 0.55, h: 0.55,
        fill: { color: item.accent, transparency: 15 },
      });

      slide.addImage({
        data: item.icon, x: cx + 0.37, y: cy + 0.47, w: 0.3, h: 0.3,
      });

      // 标题（增加与描述的间距）
      slide.addText(item.title, {
        x: cx + 0.95, y: cy + 0.28, w: 3.0, h: 0.5,
        fontSize: 17, fontFace: FONT.title, color: C.textDark,
        bold: true, align: "left", valign: "middle", margin: 0,
      });

      // 描述
      slide.addText(item.desc, {
        x: cx + 0.95, y: cy + 0.82, w: 3.05, h: 0.95,
        fontSize: 12, fontFace: FONT.body, color: C.textBody,
        align: "left", valign: "top",
      });
    });
  }

  // ========================================================
  // Slide 10: 应用场景
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("应用场景", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    // 5个应用场景（加大间距和宽度）
    const scenarios = [
      { title: "智能交通管理", desc: "城市道路实时监测，辅助交通信号控制与拥堵预警", icon: iconTraffic },
      { title: "自动驾驶感知", desc: "为自动驾驶系统提供道路目标感知输入", icon: iconCar },
      { title: "道路安全监测", desc: "危险路段行人检测、交通标志识别预警", icon: iconShield },
      { title: "智慧城市建设", desc: "融入城市大脑，构建全域交通感知网络", icon: iconCity },
      { title: "辅助驾驶系统", desc: "车辆前向碰撞预警、车道偏离提醒等ADAS功能", icon: iconRoad },
    ];

    const sCardW = 1.7;
    const sCardH = 3.8;
    const sCardGap = 0.3;
    const sTotalW = sCardW * 5 + sCardGap * 4;
    const sStartX = (10 - sTotalW) / 2;

    scenarios.forEach((s, i) => {
      const cx = sStartX + i * (sCardW + sCardGap);
      const cy = 1.25;

      // 卡片背景
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: sCardW, h: sCardH,
        fill: { color: C.lightBg },
      });

      // 顶部色块
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: sCardW, h: 1.0,
        fill: { color: C.darkBg },
      });

      // 图标
      slide.addImage({
        data: s.icon, x: cx + sCardW / 2 - 0.25, y: cy + 0.15, w: 0.5, h: 0.5,
      });

      // 标题
      slide.addText(s.title, {
        x: cx + 0.12, y: cy + 1.2, w: sCardW - 0.24, h: 0.5,
        fontSize: 14, fontFace: FONT.title, color: C.textDark, bold: true,
        align: "center", valign: "middle", margin: 0,
      });

      // 描述
      slide.addText(s.desc, {
        x: cx + 0.15, y: cy + 1.75, w: sCardW - 0.30, h: 1.8,
        fontSize: 11, fontFace: FONT.body, color: C.textBody,
        align: "center", valign: "top",
      });
    });
  }

  // ========================================================
  // Slide 11: 团队介绍
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.primary },
    });

    slide.addText("团队介绍", {
      x: 0.6, y: 0.3, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.textDark, bold: true, margin: 0,
    });

    // 团队成员（5人排列）
    const members = [
      { name: "温惠锦", role: "项目负责人", tasks: "系统架构设计\n模型训练与调优\n核心算法实现", isLead: true },
      { name: "林叶青", role: "前端开发", tasks: "PyQt5界面开发\nUI/UX设计\n功能测试", isLead: false },
      { name: "王森涛", role: "算法工程师", tasks: "数据集标注与管理\n模型评估与分析\n文档撰写", isLead: false },
      { name: "郭家兴", role: "后端开发", tasks: "视频流处理\n数据预处理\n系统集成部署", isLead: false },
      { name: "汤司达", role: "系统测试", tasks: "系统功能测试\n性能评估优化\n用户反馈收集", isLead: false },
    ];

    const mCardW = 1.68;
    const mCardH = 3.4;
    const mCardGap = 0.25;
    const mTotalW = mCardW * 5 + mCardGap * 4;
    const mStartX = (10 - mTotalW) / 2;

    members.forEach((m, i) => {
      const cx = mStartX + i * (mCardW + mCardGap);
      const cy = 1.3;
      const halfW = mCardW / 2;

      // 卡片背景
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: cy, w: mCardW, h: mCardH,
        fill: { color: m.isLead ? C.darkBg : C.lightBg },
        shadow: makeShadow(),
      });

      // 头像圆圈（缩小适配窄卡）
      const avatarR = 0.38;
      const avatarColor = m.isLead ? C.accent : C.primary;
      slide.addShape(pres.shapes.OVAL, {
        x: cx + halfW - avatarR, y: cy + 0.3, w: avatarR * 2, h: avatarR * 2,
        fill: { color: avatarColor },
      });

      // 头像文字
      slide.addText(m.name.charAt(0), {
        x: cx + halfW - avatarR, y: cy + 0.3, w: avatarR * 2, h: avatarR * 2,
        fontSize: 28, fontFace: FONT.title, color: C.white, bold: true,
        align: "center", valign: "middle", margin: 0,
      });

      // 姓名
      slide.addText(m.name, {
        x: cx + 0.05, y: cy + 1.2, w: mCardW - 0.1, h: 0.35,
        fontSize: 16, fontFace: FONT.title,
        color: m.isLead ? C.white : C.textDark,
        bold: true, align: "center", valign: "middle", margin: 0,
      });

      // 角色
      slide.addText(m.role, {
        x: cx + 0.05, y: cy + 1.6, w: mCardW - 0.1, h: 0.28,
        fontSize: 11, fontFace: FONT.body,
        color: m.isLead ? C.secondary : C.primary,
        align: "center", valign: "middle", margin: 0,
      });

      // 分隔线
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cx + 0.35, y: cy + 2.0, w: mCardW - 0.7, h: 0.01,
        fill: { color: m.isLead ? "334155" : C.border },
      });

      // 任务分工
      slide.addText(m.tasks, {
        x: cx + 0.08, y: cy + 2.2, w: mCardW - 0.16, h: 1.0,
        fontSize: 10, fontFace: FONT.body,
        color: m.isLead ? "CBD5E1" : C.textBody,
        align: "center", valign: "top",
        lineSpacingMultiple: 1.5,
      });
    });

    // 指导老师
    slide.addText([
      { text: "指导老师：金晨磊", options: { fontSize: 13, fontFace: FONT.body, color: C.textMuted } },
    ], {
      x: 0.6, y: 4.95, w: 8.8, h: 0.4,
      align: "center", valign: "middle",
    });
  }

  // ========================================================
  // Slide 12: 未来展望与致谢
  // ========================================================
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkBg };

    // 顶部装饰线
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.secondary },
    });

    slide.addText("未来展望", {
      x: 0.6, y: 0.35, w: 8.8, h: 0.7,
      fontSize: 32, fontFace: FONT.title, color: C.white, bold: true, margin: 0,
    });

    // 未来规划 - 四步时间线
    const plans = [
      { phase: "阶段一", title: "功能增强", desc: "增加更多交通标志类别，提升小目标检测精度，优化推理速度" },
      { phase: "阶段二", title: "边缘部署", desc: "模型轻量化与量化，支持Jetson/RK3588等边缘设备部署" },
      { phase: "阶段三", title: "云端平台", desc: "构建云端检测SaaS平台，支持多路视频并发分析与数据统计" },
      { phase: "阶段四", title: "产业落地", desc: "对接智慧交通企业，实现真实道路场景下的试点应用与商业化" },
    ];

    plans.forEach((p, i) => {
      const py = 1.3 + i * 0.82;
      const isEven = i % 2 === 0;

      // 时间线节点
      slide.addShape(pres.shapes.OVAL, {
        x: 4.85, y: py + 0.08, w: 0.3, h: 0.3,
        fill: { color: i === 0 ? C.secondary : C.primaryDark },
      });

      // 连接线（除最后一个）
      if (i < plans.length - 1) {
        slide.addShape(pres.shapes.LINE, {
          x: 5.0, y: py + 0.38, w: 0, h: 0.52,
          line: { color: "334155", width: 1.5, dashType: "dash" },
        });
      }

      // 阶段标签
      slide.addText(p.phase, {
        x: isEven ? 3.2 : 5.4, y: py, w: 1.4, h: 0.3,
        fontSize: 11, fontFace: FONT.body, color: C.secondary,
        bold: true, align: isEven ? "right" : "left", valign: "middle", margin: 0,
      });

      // 内容
      slide.addText([
        { text: p.title, options: { bold: true, fontSize: 14, color: C.white, breakLine: true } },
        { text: p.desc, options: { fontSize: 11, color: C.textMutedLight } },
      ], {
        x: isEven ? 1.2 : 5.4, y: py + 0.02, w: isEven ? 3.4 : 3.4, h: 0.72,
        fontFace: FONT.body, align: isEven ? "right" : "left", valign: "top",
      });
    });

    // 致谢区域
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: 4.65, w: 7, h: 0.015, fill: { color: "334155" },
    });

    slide.addText("感谢各位评委老师！", {
      x: 0.6, y: 4.75, w: 8.8, h: 0.6,
      fontSize: 26, fontFace: FONT.title, color: C.white, bold: true,
      align: "center", valign: "middle",
    });
  }

  // ============ 输出文件 ============
  await pres.writeFile({ fileName: "E:\\project\\python1\\视界行者_iCAN参赛PPT.pptx" });
  console.log("PPT 已生成: 视界行者_iCAN参赛PPT.pptx");
}

main().catch(err => {
  console.error("PPT 生成失败:", err);
  process.exit(1);
});
