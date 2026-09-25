# 视界行者 · 交通标志与行人车辆检测系统 (Vision Walker)

基于 YOLOv8 / YOLO11 + PyQt5 的桌面端目标检测系统，可识别常见交通标志、行人及车辆。iCAN 大学生创新创业大赛参赛项目。

## 检测类别

| ID | 类别 | ID | 类别 |
|----|------|----|------|
| 0  | 交通信号灯 | 5  | 行人 |
| 1  | 停止标志 | 6  | 公交车 |
| 2  | 限速标志 | 7  | 汽车 |
| 3  | 人行横道标志 | 8  | 卡车 |
| 4  | 人行横道 | | |

## 技术栈

- Python 3.9
- PyQt5（桌面界面）
- Ultralytics YOLOv8 / YOLO11（目标检测）
- OpenCV（图像处理）

## 项目结构

```
.
├── MainProgram.py        # 主程序入口
├── Config.py             # 检测类别与模型路径配置
├── train.py              # 模型训练脚本
├── detect_tools.py       # 检测工具函数
├── CameraTest.py        # 摄像头实时检测
├── VideoTest.py          # 视频文件检测
├── imgTest.py            # 单张图片检测
├── UIProgram/            # 界面代码与资源
├── Font/                  # 字体资源
├── models/best.pt         # 训练好的模型权重
├── datasets/              # 数据集（不入库，需自行准备）
├── runs/                   # 训练产物（不入库）
├── create_ppt.js          # 参赛 PPT 生成脚本
├── create_doc.js           # 文档生成脚本
└── requirements.txt
```

## 环境配置

```bash
conda create -n py39 python=3.9
conda activate py39
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

或一键安装：

```bash
python installPackages.py
```

> 训练用 GPU 版 PyTorch 需根据本机 CUDA 版本单独安装 torch（见 https://pytorch.org）。

## 运行

```bash
python MainProgram.py
```

启动后进入登录界面，登录后在主界面可选择图片 / 视频 / 摄像头进行检测。

## 模型训练

1. 准备数据集放入 `datasets/dataset/{train,val,test}`，按 `datasets/dataset/dataset.yaml` 结构配置。
2. 运行：

```bash
python train.py
```

训练结果保存在 `runs/detect/`，最优权重在 `runs/detect/train/weights/best.pt`。

## 说明

- `runs/`、`datasets/`、`node_modules/`、`yolov8n.pt`、`yolo11n.pt`、`*.mp4`、`*.zip` 已在 `.gitignore` 中排除。
- clone 后需自行准备数据集与预训练权重（可从 https://github.com/ultralytics/assets/releases 下载）；训练成果 `models/best.pt` 已入库可直接用于推理。