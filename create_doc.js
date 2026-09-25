const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, LevelFormat
} = require("docx");

// ============ 颜色和样式常量 ============
const PRIMARY = "0077B6";
const DARK = "0A1628";
const LIGHT_BG = "F0F4F8";
const WHITE = "FFFFFF";
const ACCENT = "FF6B35";
const GRAY = "F2F5F9";
const BORDER_GRAY = "CCCCCC";

// ============ 工具函数 ============
const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 32, bold: true, color: DARK })],
    spacing: { before: 360, after: 240 },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 28, bold: true, color: PRIMARY })],
    spacing: { before: 280, after: 180 },
  });
}

function bodyPara(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 360 },
    indent: options.noIndent ? undefined : { firstLine: 480 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 24, color: "333333", ...options })],
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40, line: 340 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 24, color: "333333" })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });
}

// ============ 构建文档 ============
async function main() {
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: "Microsoft YaHei", size: 24 } },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Microsoft YaHei", color: DARK },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Microsoft YaHei", color: PRIMARY },
          paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      // ============================================================
      // 封面
      // ============================================================
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          emptyLine(), emptyLine(), emptyLine(), emptyLine(),
          emptyLine(), emptyLine(),

          // 大赛标识
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [new TextRun({
              text: "iCAN 大学生创新创业大赛",
              font: "Microsoft YaHei", size: 36, bold: true, color: PRIMARY,
            })],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [new TextRun({
              text: "创新赛道 · 智能交通",
              font: "Microsoft YaHei", size: 28, color: "666666",
            })],
          }),

          emptyLine(), emptyLine(),

          // 分隔线
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY, space: 1 } },
            spacing: { before: 200, after: 200 },
            children: [],
          }),

          emptyLine(),

          // 项目名称
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 200 },
            children: [new TextRun({
              text: "基于深度学习的\n交通标志与行人车辆检测系统",
              font: "Microsoft YaHei", size: 44, bold: true, color: DARK,
            })],
          }),

          emptyLine(),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({
              text: "项目策划文档",
              font: "Microsoft YaHei", size: 32, bold: true, color: ACCENT,
            })],
          }),

          emptyLine(), emptyLine(), emptyLine(), emptyLine(),
          emptyLine(), emptyLine(),

          // 团队信息表格
          new Table({
            width: { size: 5500, type: WidthType.DXA },
            columnWidths: [1800, 3700],
            rows: [
              createInfoRow("团队名称", "视界行者"),
              createInfoRow("项目负责人", "温惠锦"),
              createInfoRow("团队成员", "林叶青、王森涛、郭家兴、汤司达"),
              createInfoRow("指导老师", "金晨磊"),
              createInfoRow("申报日期", "2026年6月"),
            ],
          }),
        ],
      },

      // ============================================================
      // 正文内容
      // ============================================================
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "视界行者 · iCAN参赛策划文档", font: "Microsoft YaHei", size: 18, color: "999999" })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 18, color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 18, color: "999999" }),
                new TextRun({ text: " 页", font: "Microsoft YaHei", size: 18, color: "999999" }),
              ],
            })],
          }),
        },
        children: [
          // ============ 一、项目概述 ============
          heading1("一、项目概述"),

          heading2("1.1 项目简介"),
          bodyPara("本项目是一款基于YOLO深度学习模型的智能交通目标检测系统，能够实时识别道路场景中的交通标志、行人及各类车辆，为智慧交通、自动驾驶和道路安全监测提供精准的视觉感知能力。系统采用PyQt5构建桌面应用界面，支持图片检测、视频检测和摄像头实时检测三种模式。"),

          heading2("1.2 核心功能"),
          bulletItem("支持9类交通目标精准识别：交通信号灯、停止信号、限速信号、人行横道信号、人行横道、行人、公交车、汽车、卡车"),
          bulletItem("三种检测模式：图片检测、视频检测、摄像头实时检测"),
          bulletItem("基于PyQt5的桌面应用程序，操作直观，部署便捷"),
          bulletItem("搭载YOLOv8/YOLOv11深度学习模型，检测速度快、精度高"),

          // ============ 二、项目背景与意义 ============
          heading1("二、项目背景与意义"),

          heading2("2.1 行业背景"),
          bodyPara("随着城市化进程加快和机动车保有量持续增长，交通安全问题日益突出。据世界卫生组织统计，全球每年约135万人死于交通事故，中国交通事故年死亡人数居世界前列。交通参与者的实时感知与预警是降低事故率的关键手段。"),

          heading2("2.2 技术趋势"),
          bodyPara("传统交通监测依赖人工巡查和固定传感器，存在覆盖盲区大、响应速度慢、人工成本高等问题，难以满足智慧交通的实时性要求。近年来，YOLO等深度学习目标检测算法的快速发展，使得高精度、实时性的交通多目标检测成为可能，为智能交通系统提供了核心技术支撑。"),

          heading2("2.3 市场前景"),
          bodyPara("智慧交通市场正处于高速增长期。据前瞻产业研究院数据显示，2026年中国智慧交通市场规模预计突破3000亿元。目标检测作为智慧交通的核心感知技术，具有广阔的应用前景和商业价值。"),

          // ============ 三、技术方案 ============
          heading1("三、技术方案"),

          heading2("3.1 系统架构"),
          bodyPara("本系统采用 C/S 桌面应用架构，由以下几个核心层次组成："),
          bulletItem("前端展示层：基于PyQt5框架构建图形用户界面，自定义QSS样式美化，提供直观的操作体验"),
          bulletItem("推理引擎层：集成Ultralytics YOLO模型框架，支持YOLOv8/YOLOv11多版本切换"),
          bulletItem("数据处理层：OpenCV视频流处理、图像预处理与增强、检测结果可视化和坐标转换"),
          bulletItem("存储层：检测结果CSV导出、标注数据YOLO格式存储、模型权重文件管理"),

          heading2("3.2 核心技术"),
          bodyPara("（1）YOLO目标检测算法：采用CSPDarknet骨干网络与PAN-FPN特征金字塔结构，结合CIoU损失函数优化，实现多尺度特征融合与高精度检测。"),
          bodyPara("（2）多线程并行处理：将UI主线程与检测推理线程分离，保证界面流畅响应的同时实现高效的目标检测推理。"),
          bodyPara("（3）中文场景适配：针对中文路径图片读取、中文类别标注显示、自定义中文字体渲染进行专项优化，解决OpenCV中文支持不足的痛点。"),
          bodyPara("（4）模型训练与评估：使用自建数据集进行模型训练，采用SGD优化器，配合数据增强策略，通过混淆矩阵和PR曲线进行系统评估。"),

          heading2("3.3 技术路线图"),
          bodyPara("数据集采集与标注 → 数据预处理与增强 → YOLO模型训练与调优 → 模型评估与导出 → PyQt5界面集成 → 系统测试与部署"),

          // ============ 四、系统功能 ============
          heading1("四、系统功能详述"),

          heading2("4.1 图片检测模式"),
          bodyPara("支持单张或批量图片导入，系统自动进行目标检测并在图片上标注检测结果，以不同颜色的矩形框标注各类目标。检测完成后支持结果可视化展示和数据CSV导出，方便后续分析与报告生成。"),

          heading2("4.2 视频检测模式"),
          bodyPara("支持导入视频文件进行逐帧检测分析，实时显示检测进度与中间结果。检测过程采用多线程架构，确保界面响应流畅。完成检测后可导出带标注框的结果视频，便于演示和存档。"),

          heading2("4.3 实时摄像头检测模式"),
          bodyPara("调用本地摄像头进行实时交通场景目标检测，具备毫秒级推理速度，适合道路实时监测场景。实时画面低延迟渲染，检测框平滑跟踪，适用于智能交通监控和辅助驾驶等场景。"),

          // ============ 五、创新特色 ============
          heading1("五、创新特色"),

          heading2("5.1 多类别联合检测"),
          bodyPara("创新性地将交通标志（4类）、行人、车辆（3类）、道路标线统一纳入单一检测框架，实现9类目标同步识别。相较于传统的多模型分别检测方案，显著降低了部署开销和推理延迟。"),

          heading2("5.2 端到端桌面应用"),
          bodyPara("突破纯算法demo的局限，构建了完整的PyQt5桌面应用程序。支持图片/视频/摄像头三种输入模式，产品化程度高，开箱即用，降低了非技术用户的使用门槛。"),

          heading2("5.3 中文友好适配"),
          bodyPara("针对中文使用场景进行深度优化，包括中文路径图片读取、中文类别名称标注显示、自定义中文字体渲染等功能，解决了OpenCV在中文环境下常见的兼容性问题。"),

          heading2("5.4 模型灵活可扩展"),
          bodyPara("采用YOLO标准模型接口设计，支持YOLOv8/YOLOv11等多个版本的平滑切换。用户可根据实际需求快速适配新数据集和检测类别，系统具备良好的扩展性和可维护性。"),

          // ============ 六、预期成果 ============
          heading1("六、预期成果"),

          heading2("6.1 技术成果"),
          bulletItem("完成一款功能完善的交通目标检测桌面应用系统"),
          bulletItem("训练出在自建数据集上mAP@0.5达到85%以上的检测模型"),
          bulletItem("形成完整的数据集标注、模型训练、部署应用的技术方案文档"),
          bulletItem("申请软件著作权1项"),

          heading2("6.2 应用成果"),
          bulletItem("系统可在智慧交通管理、自动驾驶感知、道路安全监测等场景中应用"),
          bulletItem("为交通管理部门提供智能化的道路目标监测工具"),
          bulletItem("可作为高校智能交通相关课程的教学演示平台"),

          // ============ 七、项目进度安排 ============
          heading1("七、项目进度安排"),

          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1600, 3200, 2200, 2026],
            rows: [
              createTableHeaderRow(["阶段", "主要任务", "时间节点", "预期产出"]),
              createTableRow(["需求分析", "市场调研、功能需求梳理、技术选型", "第1-2周", "需求文档"]),
              createTableRow(["系统设计", "架构设计、UI原型设计、数据库设计", "第3-4周", "设计文档"]),
              createTableRow(["核心开发", "模型训练优化、检测引擎集成、UI开发", "第5-12周", "可运行原型"]),
              createTableRow(["测试优化", "功能测试、性能调优、用户体验改进", "第13-15周", "测试报告"]),
              createTableRow(["文档撰写", "技术文档、用户手册、项目报告", "第15-16周", "完整文档"]),
              createTableRow(["答辩准备", "PPT制作、路演排练、材料整理", "第17-18周", "答辩材料"]),
            ],
          }),

          emptyLine(),

          // ============ 八、团队分工 ============
          heading1("八、团队分工"),

          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1400, 1900, 1300, 4426],
            rows: [
              createTableHeaderRow(["姓名", "角色", "专业", "主要职责"]),
              createTableRow(["温惠锦", "项目负责人", "人工智能", "系统架构设计、模型训练与调优、核心算法实现"]),
              createTableRow(["林叶青", "前端开发", "软件工程", "PyQt5界面开发、UI/UX设计、功能测试"]),
              createTableRow(["王森涛", "算法工程师", "计算机科学", "数据集标注与管理、模型评估与分析、文档撰写"]),
              createTableRow(["郭家兴", "后端开发", "电子信息", "视频流处理、数据预处理、系统集成部署"]),
              createTableRow(["汤司达", "系统测试", "软件工程", "系统功能测试、性能评估优化、用户反馈收集"]),
              createTableRow(["金晨磊", "指导老师", "—", "项目方向指导、技术方案审核、资源协调"]),
            ],
          }),

          emptyLine(),

          // ============ 九、经费预算 ============
          heading1("九、经费预算"),

          new Table({
            width: { size: 9026, type: WidthType.DXA },
            columnWidths: [1400, 2200, 2200, 1600, 1626],
            rows: [
              createTableHeaderRow(["序号", "支出项目", "用途说明", "数量", "金额（元）"]),
              createTableRow(["1", "GPU云服务器租赁", "模型训练与推理", "3个月", "3000"]),
              createTableRow(["2", "数据集采集标注", "交通场景数据采集", "1批", "1500"]),
              createTableRow(["3", "软件许可费", "开发工具与库授权", "1项", "1000"]),
              createTableRow(["4", "文献资料", "技术书籍与论文", "若干", "500"]),
              createTableRow(["5", "差旅与展示", "比赛差旅与展板制作", "1次", "2000"]),
              createTableRow(["", "", "", "合计", "8000"], true),
            ],
          }),

          emptyLine(),

          // ============ 十、风险分析与对策 ============
          heading1("十、风险分析与对策"),

          heading2("10.1 技术风险"),
          bodyPara("风险：模型在复杂光照、恶劣天气等场景下检测精度可能下降。",
            { bold: false }),
          bodyPara("对策：扩充训练数据集，增加多样化场景样本；采用数据增强技术提升模型鲁棒性；引入模型量化技术保证边缘设备推理性能。",
            { bold: false }),

          heading2("10.2 进度风险"),
          bodyPara("风险：项目开发周期紧张，可能影响功能完整度。",
            { bold: false }),
          bodyPara("对策：采用敏捷开发方法，按功能模块优先级分批迭代；预留缓冲时间应对突发情况；核心功能优先保障，次要功能可后续迭代。",
            { bold: false }),

          heading2("10.3 竞争风险"),
          bodyPara("风险：市场上已有类似交通检测产品。",
            { bold: false }),
          bodyPara("对策：聚焦中文场景适配和桌面端应用差异化；突出多类别联合检测的技术优势；通过开源社区持续迭代优化产品竞争力。",
            { bold: false }),

          emptyLine(),

          // 结尾
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY, space: 1 } },
            children: [new TextRun({
              text: "视界行者 · 用视觉感知世界，以智能守护出行",
              font: "Microsoft YaHei", size: 24, color: "666666", italics: true,
            })],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("E:\\project\\python1\\策划文档.docx", buffer);
  console.log("策划文档已生成: 策划文档.docx");
}

// ============ 表格辅助函数 ============
function createInfoRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 1800, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: label + "：", font: "Microsoft YaHei", size: 22, bold: true, color: "555555" })],
        })],
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 3700, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: value, font: "Microsoft YaHei", size: 22, color: "333333" })],
        })],
      }),
    ],
  });
}

function createTableHeaderRow(labels) {
  return new TableRow({
    children: labels.map((label, i) =>
      new TableCell({
        borders,
        width: { size: 0, type: WidthType.DXA }, // 让 columnWidths 控制
        shading: { fill: DARK, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: label, font: "Microsoft YaHei", size: 20, bold: true, color: WHITE })],
        })],
      })
    ),
  });
}

function createTableRow(cells, isLast = false) {
  const bgColor = isLast ? "FFF3E0" : undefined;
  return new TableRow({
    children: cells.map((cell, i) =>
      new TableCell({
        borders,
        width: { size: 0, type: WidthType.DXA },
        shading: bgColor ? { fill: bgColor, type: ShadingType.CLEAR } : undefined,
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({
            text: String(cell),
            font: "Microsoft YaHei",
            size: 20,
            color: isLast ? DARK : "333333",
            bold: isLast,
          })],
        })],
      })
    ),
  });
}

main().catch(err => {
  console.error("文档生成失败:", err);
  process.exit(1);
});
