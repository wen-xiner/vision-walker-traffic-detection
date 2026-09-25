#coding:utf-8
from ultralytics import YOLO

weight_path = 'runs/train/exp283/weights/best.pt'

model = YOLO(weight_path)

model.export(format='torchscript')
model.export(format='onnx')

print(f'导出完成，文件已保存至 {model.ckpt_path if hasattr(model, "ckpt_path") else "weight 同级目录"}')
