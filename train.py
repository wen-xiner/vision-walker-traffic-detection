#coding:utf-8
from ultralytics import YOLO

model = YOLO("yolov8.yaml")

if __name__ == '__main__':
    results = model.train(
        data='datasets/dataset/dataset.yaml',
        epochs=60,
        batch=4,
        imgsz=640,
        optimizer='SGD',
        project='runs/train',
        name='exp28',
        workers=0,
        pretrained=True,
        plots=True
    )