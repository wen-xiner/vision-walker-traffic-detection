# -*- coding: utf-8 -*-
import time
from PyQt5.QtWidgets import QApplication, QMainWindow, QFileDialog, \
    QMessageBox, QWidget, QHeaderView, QTableWidgetItem, QAbstractItemView, QStackedWidget, QDialog, QLabel, QProgressBar, QPushButton, QVBoxLayout, QHBoxLayout
from PyQt5 import QtGui
import sys
import os
from PIL import ImageFont, Image, ImageDraw
from ultralytics import YOLO
sys.path.append('UIProgram')
from UIProgram.UiMain import Ui_MainWindow
import sys
from PyQt5.QtCore import QTimer, Qt, QThread, pyqtSignal,QCoreApplication
import cv2
import numpy as np
import torch
import UIProgram.ui_sources_rc
from UIProgram import ui_sources_rc

# 配置信息
# 图片及视频检测结果保存路径
save_path = 'save_data'

# 使用的模型路径
model_path = 'models/best.pt'

names = {0: 'Trafic Light Signal' ,
  1: 'Stop Signal' ,
  2: 'Speedlimit Signal' ,
  3: 'Crosswalk Signal' ,
  4: 'Crosswalk',
  5: 'Pedestrian',
  6: 'Bus',
  7: 'Car',
  8: 'Truck'}
CH_names =  ['交通信号灯', '停止信号', '限速信号', '人行横道信号', '人行横道',
             '行人', '公交车', '汽车', '卡车', ]

# 工具函数和类

def drawRectBox(image, rect, addText, fontC, color):
    """
    绘制矩形框与结果
    :param image: 原始图像
    :param rect: 矩形框坐标, int类型
    :param addText: 类别名称
    :param fontC: 字体
    :return:
    """
    # 绘制位置方框
    cv2.rectangle(image, (rect[0], rect[1]),
                 (rect[2], rect[3]),
                 color, 2)

    # 绘制字体背景框
    cv2.rectangle(image, (rect[0] - 1, rect[1] - 25), (rect[0] + 60, rect[1]), color, -1, cv2.LINE_AA)

    img = Image.fromarray(image)
    draw = ImageDraw.Draw(img)
    draw.text((rect[0]+2, rect[1]-27), addText, (255, 255, 255), font=fontC)
    imagex = np.array(img)
    return imagex


def img_cvread(path):
    # 读取含中文名的图片文件
    img = cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_COLOR)
    return img


def cvimg_to_qpiximg(cvimg):
    height, width, depth = cvimg.shape
    cvimg = cv2.cvtColor(cvimg, cv2.COLOR_BGR2RGB)
    qimg = QtGui.QImage(cvimg.data, width, height, width * depth, QtGui.QImage.Format_RGB888)
    qpix_img = QtGui.QPixmap(qimg)
    return qpix_img


class Colors:
    # 用于绘制不同颜色
    def __init__(self):
        """Initialize colors as hex = matplotlib.colors.TABLEAU_COLORS.values()."""
        hexs = ('FF3838', 'FF9D97', 'FF701F', 'FFB21D', 'CFD231', '48F90A', '92CC17', '3DDB86', '1A9334', '00D4BB',
                '2C99A8', '00C2FF', '344593', '6473FF', '0018EC', '8438FF', '520085', 'CB38FF', 'FF95C8', 'FF37C7')
        self.palette = [self.hex2rgb(f'#{c}') for c in hexs]
        self.n = len(self.palette)
        self.pose_palette = np.array([[255, 128, 0], [255, 153, 51], [255, 178, 102], [230, 230, 0], [255, 153, 255],
                                      [153, 204, 255], [255, 102, 255], [255, 51, 255], [102, 178, 255], [51, 153, 255],
                                      [255, 153, 153], [255, 102, 102], [255, 51, 51], [153, 255, 153], [102, 255, 102],
                                      [51, 255, 51], [0, 255, 0], [0, 0, 255], [255, 0, 0], [255, 255, 255]],
                                     dtype=np.uint8)

    def __call__(self, i, bgr=False):
        """Converts hex color codes to rgb values."""
        c = self.palette[int(i) % self.n]
        return (c[2], c[1], c[0]) if bgr else c

    @staticmethod
    def hex2rgb(h):  # rgb order (PIL)
        return tuple(int(h[1 + i:1 + i + 2], 16) for i in (0, 2, 4))


class QSSLoader:
    def __init__(self):
        pass

    @staticmethod
    def read_qss_file(qss_file_name):
        with open(qss_file_name, 'r',  encoding='UTF-8') as file:
            return file.read()


class ProgressBar(QDialog):
    def __init__(self, parent=None):
        super(ProgressBar, self).__init__(parent)

        self.resize(350, 100)
        self.setWindowTitle(self.tr("视频保存进度信息"))

        self.TipLabel = QLabel(self.tr("当前帧/总帧数:0/0"))
        self.FeatLabel = QLabel(self.tr("保存进度:"))

        self.FeatProgressBar = QProgressBar(self)
        self.FeatProgressBar.setMinimum(0)
        self.FeatProgressBar.setMaximum(100)  # 总进程换算为100
        self.FeatProgressBar.setValue(0)  # 进度条初始值为0

        TipLayout = QHBoxLayout()
        TipLayout.addWidget(self.TipLabel)

        FeatLayout = QHBoxLayout()
        FeatLayout.addWidget(self.FeatLabel)
        FeatLayout.addWidget(self.FeatProgressBar)

        self.cancelButton = QPushButton('取消保存', self)

        buttonlayout = QHBoxLayout()
        buttonlayout.addStretch(1)
        buttonlayout.addWidget(self.cancelButton)

        layout = QVBoxLayout()
        layout.addLayout(FeatLayout)
        layout.addLayout(TipLayout)
        layout.addLayout(buttonlayout)
        self.setLayout(layout)
        self.cancelButton.clicked.connect(self.onCancel)

    def setValue(self, start, end, progress):
        self.TipLabel.setText(self.tr("当前帧/总帧数:" + "   " + str(start) + "/" + str(end)))
        self.FeatProgressBar.setValue(progress)

    def onCancel(self, event):
        self.close()


class MainWindow(QMainWindow, Ui_MainWindow):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setupUi(self)
        self.initMain()
        self.signalconnect()

        # 加载css渲染效果
        style_file = 'UIProgram/style.css'
        qssStyleSheet = QSSLoader.read_qss_file(style_file)
        self.setStyleSheet(qssStyleSheet)

        # 设置SpinBox的范围和步长
        self.doubleSpinBox.setRange(0.0, 1.0)  # 置信度阈值范围
        self.doubleSpinBox.setSingleStep(0.05)  # 步长
        self.doubleSpinBox_2.setRange(0.0, 1.0)  # IOU阈值范围
        self.doubleSpinBox_2.setSingleStep(0.05)  # 步长

        # 添加新控件的信号连接
        self.doubleSpinBox.valueChanged.connect(self.update_conf_thres)
        self.doubleSpinBox_2.valueChanged.connect(self.update_iou_thres)
        self.checkBox.stateChanged.connect(self.update_show_labels)
        
        # 初始化参数
        self.conf_thres = 0.25  # 默认置信度阈值
        self.iou_thres = 0.45   # 默认IOU阈值
        self.show_labels = True  # 默认显示标签
        
        # 设置SpinBox的初始值
        self.doubleSpinBox.setValue(self.conf_thres)
        self.doubleSpinBox_2.setValue(self.iou_thres)
        self.checkBox.setChecked(self.show_labels)

    def signalconnect(self):
        self.PicBtn.clicked.connect(self.open_img)
        self.comboBox.activated.connect(self.combox_change)
        self.VideoBtn.clicked.connect(self.vedio_show)
        self.CapBtn.clicked.connect(self.camera_show)
        self.SaveBtn.clicked.connect(self.save_detect_video)
        self.ExitBtn.clicked.connect(QCoreApplication.quit)
        self.FilesBtn.clicked.connect(self.detact_batch_imgs)
        # 新添加的筛选按钮信号
        self.pushButton_filter.clicked.connect(self.filter_by_confidence)

    def initMain(self):
        self.show_width = 770
        self.show_height = 480

        self.org_path = None

        self.is_camera_open = False
        self.cap = None

        self.device = 0 if torch.cuda.is_available() else 'cpu'

        # 加载检测模型
        self.model = YOLO(model_path, task='detect')
        self.model(np.zeros((48, 48, 3)), device=self.device)  #预先加载推理模型
        self.fontC = ImageFont.truetype("Font/platech.ttf", 25, 0)

        # 用于绘制不同颜色矩形框
        self.colors = Colors()

        # 更新视频图像
        self.timer_camera = QTimer()

        # 更新检测信息表格
        # self.timer_info = QTimer()
        # 保存视频
        self.timer_save_video = QTimer()

        # 表格
        self.tableWidget.verticalHeader().setSectionResizeMode(QHeaderView.Fixed)
        self.tableWidget.verticalHeader().setDefaultSectionSize(30)
        self.tableWidget.setColumnWidth(0, 60)  # 设置列宽
        self.tableWidget.setColumnWidth(1, 200)
        self.tableWidget.setColumnWidth(2, 100)
        self.tableWidget.setColumnWidth(3, 80)
        self.tableWidget.setColumnWidth(4, 160)
        self.tableWidget.setSelectionBehavior(QAbstractItemView.SelectRows)  # 设置表格整行选中
        self.tableWidget.verticalHeader().setVisible(False)  # 隐藏列标题
        self.tableWidget.setAlternatingRowColors(True)  # 表格背景交替

        # 设置主页背景图片border-image: url(:/icons/ui_imgs/icons/camera.png)
        # self.setStyleSheet("#MainWindow{background-image:url(:/bgs/ui_imgs/bg3.jpg)}")

    def open_img(self):
        if self.cap:
            # 打开图片前关闭摄像头
            self.video_stop()
            self.is_camera_open = False
            self.CaplineEdit.setText('摄像头未开启')
            self.cap = None

        # 弹出的窗口名称：'打开图片'
        # 默认打开的目录：'./'
        # 只能打开.jpg与.gif结尾的图片文件
        # file_path, _ = QFileDialog.getOpenFileName(self.centralwidget, '打开图片', './', "Image files (*.jpg *.gif)")
        file_path, _ = QFileDialog.getOpenFileName(None, '打开图片', './', "Image files (*.jpg *.jpeg *.png *.bmp)")
        if not file_path:
            return

        self.comboBox.setDisabled(False)
        self.org_path = file_path
        self.org_img = img_cvread(self.org_path)

        # 目标检测
        t1 = time.time()
        results = self.model(self.org_path, conf=self.conf_thres, iou=self.iou_thres)[0]
        t2 = time.time()
        take_time_str = '{:.3f} s'.format(t2 - t1)
        self.time_lb.setText(take_time_str)

        # 设置路径显示
        self.PiclineEdit.setText(self.org_path)

        # 更新UI
        self.update_ui_with_detection(results, self.org_path)


    def detact_batch_imgs(self):
        if self.cap:
            # 打开图片前关闭摄像头
            self.video_stop()
            self.is_camera_open = False
            self.CaplineEdit.setText('摄像头未开启')
            self.cap = None
        directory = QFileDialog.getExistingDirectory(self,
                                                      "选取文件夹",
                                                      "./")  # 起始路径
        if not  directory:
            return
        self.org_path = directory
        img_suffix = ['jpg','png','jpeg','bmp']
        for file_name in os.listdir(directory):
            full_path = os.path.join(directory,file_name)
            if os.path.isfile(full_path) and file_name.split('.')[-1].lower() in img_suffix:
                # self.comboBox.setDisabled(False)
                img_path = full_path
                self.org_img = img_cvread(img_path)
                # 目标检测
                t1 = time.time()
                results = self.model(img_path,conf=self.conf_thres, iou=self.iou_thres)[0]
                t2 = time.time()
                take_time_str = '{:.3f} s'.format(t2 - t1)
                self.time_lb.setText(take_time_str)

                # 设置路径显示
                self.PiclineEdit.setText(img_path)

                # 更新UI
                self.update_ui_with_detection(results, img_path)
                self.tableWidget.scrollToBottom()
                QApplication.processEvents()  #刷新页面

    def draw_rect_and_tabel(self, results, img):
        now_img = img.copy()
        location_list = results.boxes.xyxy.tolist()
        self.location_list = [list(map(int, e)) for e in location_list]
        cls_list = results.boxes.cls.tolist()
        self.cls_list = [int(i) for i in cls_list]
        self.conf_list = results.boxes.conf.tolist()
        self.conf_list = ['%.2f %%' % (each * 100) for each in self.conf_list]

        for loacation, type_id, conf in zip(self.location_list, self.cls_list, self.conf_list):
            type_id = int(type_id)
            color = self.colors(int(type_id), True)
            # cv2.rectangle(now_img, (int(x1), int(y1)), (int(x2), int(y2)), colors(int(type_id), True), 3)
            now_img = drawRectBox(now_img, loacation, CH_names[type_id], self.fontC, color)

        # 获取缩放后的图片尺寸
        self.img_width, self.img_height = self.get_resize_size(now_img)
        resize_cvimg = cv2.resize(now_img, (self.img_width, self.img_height))
        pix_img = cvimg_to_qpiximg(resize_cvimg)
        self.label_show.setPixmap(pix_img)
        self.label_show.setAlignment(Qt.AlignCenter)
        # 设置路径显示
        self.PiclineEdit.setText(self.org_path)

        # 目标数目
        target_nums = len(self.cls_list)
        self.label_nums.setText(str(target_nums))
        if target_nums >= 1:
            self.type_lb.setText(CH_names[self.cls_list[0]])
            self.label_conf.setText(str(self.conf_list[0]))
            self.label_xmin.setText(str(self.location_list[0][0]))
            self.label_ymin.setText(str(self.location_list[0][1]))
            self.label_xmax.setText(str(self.location_list[0][2]))
            self.label_ymax.setText(str(self.location_list[0][3]))
        else:
            self.type_lb.setText('')
            self.label_conf.setText('')
            self.label_xmin.setText('')
            self.label_ymin.setText('')
            self.label_xmax.setText('')
            self.label_ymax.setText('')

        # 删除表格所有行
        self.tableWidget.setRowCount(0)
        self.tableWidget.clearContents()
        self.tabel_info_show(self.location_list, self.cls_list, self.conf_list, path=self.org_path)
        return now_img

    def combox_change(self):
        com_text = self.comboBox.currentText()
        if com_text == '全部':
            cur_box = self.location_list
            cur_img = self.results.plot()
            # 更新目标信息
            # 目标选择通过comboBox实现，不需要单独的标签
            self.type_lb.setText(CH_names[self.cls_list[0]])
            self.label_conf_value.setText(str(self.conf_list[0]))
            # 设置坐标位置值
            self.label_xmin_value.setText(str(cur_box[0][0]))
            self.label_ymin_value.setText(str(cur_box[0][1]))
            self.label_xmax_value.setText(str(cur_box[0][2]))
            self.label_ymax_value.setText(str(cur_box[0][3]))
        else:
            index = int(com_text.split('_')[-1])
            cur_box = [self.location_list[index]]
            cur_img = self.results[index].plot()
            # 更新目标信息
            # 目标选择通过comboBox实现，不需要单独的标签
            self.type_lb.setText(CH_names[self.cls_list[index]])
            self.label_conf_value.setText(str(self.conf_list[index]))
            # 设置坐标位置值
            self.label_xmin_value.setText(str(cur_box[0][0]))
            self.label_ymin_value.setText(str(cur_box[0][1]))
            self.label_xmax_value.setText(str(cur_box[0][2]))
            self.label_ymax_value.setText(str(cur_box[0][3]))

        resize_cvimg = cv2.resize(cur_img, (self.img_width, self.img_height))
        pix_img = cvimg_to_qpiximg(resize_cvimg)
        self.label_show.clear()
        self.label_show.setPixmap(pix_img)
        self.label_show.setAlignment(Qt.AlignCenter)


    def get_video_path(self):
        file_path, _ = QFileDialog.getOpenFileName(None, '打开视频', './', "Image files (*.avi *.mp4 *.wmv *.mkv)")
        if not file_path:
            return None
        self.org_path = file_path
        self.VideolineEdit.setText(file_path)
        return file_path

    def video_start(self):
        # 删除表格所有行
        self.tableWidget.setRowCount(0)
        self.tableWidget.clearContents()

        # 清空下拉框
        self.comboBox.clear()

        # 定时器开启，每隔一段时间，读取一帧
        self.timer_camera.start(1)
        self.timer_camera.timeout.connect(self.open_frame)

    def add_table_row(self, row_count, path, location, cls, conf):
        """添加表格行"""
        item_id = QTableWidgetItem(str(row_count+1))  # 序号
        item_id.setTextAlignment(Qt.AlignHCenter | Qt.AlignVCenter)  # 设置文本居中
        item_path = QTableWidgetItem(str(path))  # 路径

        item_cls = QTableWidgetItem(str(CH_names[cls]))
        item_cls.setTextAlignment(Qt.AlignHCenter | Qt.AlignVCenter)  # 设置文本居中

        item_conf = QTableWidgetItem(str(conf))
        item_conf.setTextAlignment(Qt.AlignHCenter | Qt.AlignVCenter)  # 设置文本居中
        # 根据置信度设置颜色
        # 处理置信度字符串，移除空格和百分号
        conf_str = conf.replace(' ', '').replace('%', '')
        conf_value = float(conf_str)
        if conf_value > 90:
            item_conf.setForeground(QtGui.QColor(0, 255, 0))  # 绿色
        elif conf_value > 60:
            item_conf.setForeground(QtGui.QColor(255, 255, 0))  # 黄色
        else:
            item_conf.setForeground(QtGui.QColor(255, 0, 0))  # 红色

        item_location = QTableWidgetItem(str(location)) # 目标框位置

        self.tableWidget.setItem(row_count, 0, item_id)
        self.tableWidget.setItem(row_count, 1, item_path)
        self.tableWidget.setItem(row_count, 2, item_cls)
        self.tableWidget.setItem(row_count, 3, item_conf)
        self.tableWidget.setItem(row_count, 4, item_location)

    def tabel_info_show(self, locations, clses, confs, path=None):
        path = path
        for location, cls, conf in zip(locations, clses, confs):
            row_count = self.tableWidget.rowCount()  # 返回当前行数(尾部)
            self.tableWidget.insertRow(row_count)  # 尾部插入一行
            self.add_table_row(row_count, path, location, cls, conf)
        self.tableWidget.scrollToBottom()
        # 更新统计信息
        if hasattr(self, 'label_stats_value'):
            self.label_stats_value.setText(f"{len(clses)} 个目标")

    def filter_by_confidence(self):
        """根据置信度筛选目标"""
        filter_threshold = self.doubleSpinBox_filter.value()
        # 清空表格
        self.tableWidget.setRowCount(0)
        self.tableWidget.clearContents()
        
        # 重新添加符合条件的目标
        if hasattr(self, 'location_list') and hasattr(self, 'cls_list') and hasattr(self, 'conf_list'):
            for i, (location, cls, conf) in enumerate(zip(self.location_list, self.cls_list, self.conf_list)):
                # 处理置信度字符串，移除空格和百分号
                conf_str = conf.replace(' ', '').replace('%', '')
                conf_value = float(conf_str) / 100
                if conf_value >= filter_threshold:
                    row_count = self.tableWidget.rowCount()
                    self.tableWidget.insertRow(row_count)
                    self.add_table_row(row_count, self.org_path, location, cls, conf)

    def video_stop(self):
        self.cap.release()
        self.timer_camera.stop()
        # self.timer_info.stop()

    def open_frame(self):
        ret, now_img = self.cap.read()
        if ret:
            # 目标检测
            t1 = time.time()
            results = self.model(now_img,conf=self.conf_thres, iou=self.iou_thres)[0]
            t2 = time.time()
            take_time_str = '{:.3f} s'.format(t2 - t1)
            self.time_lb.setText(take_time_str)

            self.location_list, self.cls_list, self.conf_list = self.parse_detection_results(results)

            now_img = results.plot()

            # 获取缩放后的图片尺寸
            self.img_width, self.img_height = self.get_resize_size(now_img)
            resize_cvimg = cv2.resize(now_img, (self.img_width, self.img_height))
            pix_img = cvimg_to_qpiximg(resize_cvimg)
            self.label_show.setPixmap(pix_img)
            self.label_show.setAlignment(Qt.AlignCenter)

            # 目标数目
            target_nums = len(self.cls_list)
            self.label_nums.setText(str(target_nums))

            # 设置目标选择下拉框
            choose_list = ['全部']
            target_names = [names[id] + '_' + str(index) for index, id in enumerate(self.cls_list)]
            # object_list = sorted(set(self.cls_list))
            # for each in object_list:
            #     choose_list.append(CH_names[each])
            choose_list = choose_list + target_names

            self.comboBox.clear()
            self.comboBox.addItems(choose_list)

            if target_nums >= 1:
                self.type_lb.setText(CH_names[self.cls_list[0]])
                self.label_conf.setText(str(self.conf_list[0]))
                #   默认显示第一个目标框坐标
                #   设置坐标位置值
                self.label_xmin.setText(str(self.location_list[0][0]))
                self.label_ymin.setText(str(self.location_list[0][1]))
                self.label_xmax.setText(str(self.location_list[0][2]))
                self.label_ymax.setText(str(self.location_list[0][3]))
            else:
                self.type_lb.setText('')
                self.label_conf.setText('')
                self.label_xmin.setText('')
                self.label_ymin.setText('')
                self.label_xmax.setText('')
                self.label_ymax.setText('')


            # 删除表格所有行
            # self.tableWidget.setRowCount(0)
            # self.tableWidget.clearContents()
            self.tabel_info_show(self.location_list, self.cls_list, self.conf_list, path=self.org_path)

        else:
            self.cap.release()
            self.timer_camera.stop()

    def vedio_show(self):
        if self.is_camera_open:
            self.is_camera_open = False
            self.CaplineEdit.setText('摄像头未开启')

        video_path = self.get_video_path()
        if not video_path:
            return None
        self.cap = cv2.VideoCapture(video_path)
        self.video_start()
        self.comboBox.setDisabled(True)

    def camera_show(self):
        self.is_camera_open = not self.is_camera_open
        if self.is_camera_open:
            self.CaplineEdit.setText('摄像头开启')
            self.cap = cv2.VideoCapture(0)
            self.video_start()
            self.comboBox.setDisabled(True)
        else:
            self.CaplineEdit.setText('摄像头未开启')
            self.label_show.setText('')
            if self.cap:
                self.cap.release()
                cv2.destroyAllWindows()
            self.label_show.clear()

    def get_resize_size(self, img):
        _img = img.copy()
        img_height, img_width , depth= _img.shape
        ratio = img_width / img_height
        if ratio >= self.show_width / self.show_height:
            self.img_width = self.show_width
            self.img_height = int(self.img_width / ratio)
        else:
            self.img_height = self.show_height
            self.img_width = int(self.img_height * ratio)
        return self.img_width, self.img_height

    def save_detect_video(self):
        if self.cap is None and not self.org_path:
            QMessageBox.about(self, '提示', '当前没有可保存信息，请先打开图片或视频！')
            return

        if self.is_camera_open:
            QMessageBox.about(self, '提示', '摄像头视频无法保存!')
            return

        if self.cap:
            res = QMessageBox.information(self, '提示', '保存视频检测结果可能需要较长时间，请确认是否继续保存？',QMessageBox.Yes | QMessageBox.No ,  QMessageBox.Yes)
            if res == QMessageBox.Yes:
                self.video_stop()
                com_text = self.comboBox.currentText()
                self.btn2Thread_object = btn2Thread(self.org_path, self.model, com_text,self.conf_thres,self.iou_thres)
                self.btn2Thread_object.start()
                self.btn2Thread_object.update_ui_signal.connect(self.update_process_bar)
            else:
                return
        else:
            if os.path.isfile(self.org_path):
                fileName = os.path.basename(self.org_path)
                name , end_name= fileName.rsplit(".",1)
                save_name = name + '_detect_result.' + end_name
                save_img_path = os.path.join(save_path, save_name)
                # 保存图片
                cv2.imwrite(save_img_path, self.draw_img)
                QMessageBox.about(self, '提示', '图片保存成功!\n文件路径:{}'.format(save_img_path))
            else:
                img_suffix = ['jpg', 'png', 'jpeg', 'bmp']
                for file_name in os.listdir(self.org_path):
                    full_path = os.path.join(self.org_path, file_name)
                    if os.path.isfile(full_path) and file_name.split('.')[-1].lower() in img_suffix:
                        name, end_name = file_name.rsplit(".",1)
                        save_name = name + '_detect_result.' + end_name
                        save_img_path = os.path.join(save_path, save_name)
                        results = self.model(full_path,conf=self.conf_thres, iou=self.iou_thres)[0]
                        now_img = results.plot()
                        # 保存图片
                        cv2.imwrite(save_img_path, now_img)

                QMessageBox.about(self, '提示', '图片保存成功!\n文件路径:{}'.format(save_path))


    def update_process_bar(self,cur_num, total):
        if cur_num == 1:
            self.progress_bar = ProgressBar(self)
            self.progress_bar.show()
        if cur_num >= total:
            self.progress_bar.close()
            QMessageBox.about(self, '提示', '视频保存成功!\n文件在{}目录下'.format(save_path))
            return
        if self.progress_bar.isVisible() is False:
            # 点击取消保存时，终止进程
            self.btn2Thread_object.stop()
            return
        value = int(cur_num / total *100)
        self.progress_bar.setValue(cur_num, total, value)
        QApplication.processEvents()

    # 添加新的槽函数
    def update_conf_thres(self, value):
        self.conf_thres = value
        # 更新检测参数
        if hasattr(self, 'model'):
            self.model.conf = value
            # 如果当前有图片，重新检测
            if hasattr(self, 'org_img'):
                self.detect_current_image()

    def update_iou_thres(self, value):
        self.iou_thres = value
        # 更新检测参数
        if hasattr(self, 'model'):
            self.model.iou = value
            # 如果当前有图片，重新检测
            if hasattr(self, 'org_img'):
                self.detect_current_image()

    def update_show_labels(self, state):
        self.show_labels = state == Qt.Checked
        # 如果当前有检测结果，重新绘制
        if hasattr(self, 'results'):
            self.draw_detection_results()

    # 添加新方法用于重新检测当前图片
    def parse_detection_results(self, results):
        """解析检测结果，返回位置、类别和置信度列表"""
        location_list = results.boxes.xyxy.tolist()
        location_list = [list(map(int, e)) for e in location_list]
        cls_list = results.boxes.cls.tolist()
        cls_list = [int(i) for i in cls_list]
        conf_list = results.boxes.conf.tolist()
        conf_list = ['%.2f %%' % (each*100) for each in conf_list]
        return location_list, cls_list, conf_list

    def detect_current_image(self):
        if hasattr(self, 'org_img'):
            t1 = time.time()
            results = self.model(self.org_img, conf=self.conf_thres, iou=self.iou_thres)[0]
            t2 = time.time()
            take_time_str = '{:.3f} s'.format(t2 - t1)
            self.time_lb.setText(take_time_str)

            # 更新UI
            self.update_ui_with_detection(results, self.org_path)

    def update_ui_with_detection(self, results, img_path=None):
        """根据检测结果更新UI"""
        # 解析检测结果
        location_list, cls_list, conf_list = self.parse_detection_results(results)
        
        # 更新实例属性
        self.location_list = location_list
        self.cls_list = cls_list
        self.conf_list = conf_list
        self.results = results
        
        # 更新目标数目
        target_nums = len(cls_list)
        self.label_nums.setText(str(target_nums))
        if hasattr(self, 'label_nums_value'):
            self.label_nums_value.setText(str(target_nums))
        
        # 更新统计信息
        if hasattr(self, 'label_stats_value'):
            self.label_stats_value.setText(f"{target_nums} 个目标")
        
        # 设置目标选择下拉框
        choose_list = ['全部']
        target_names = [names[id] + '_' + str(index) for index, id in enumerate(cls_list)]
        choose_list = choose_list + target_names
        self.comboBox.clear()
        self.comboBox.addItems(choose_list)
        self.comboBox.setCurrentIndex(0)  # 设置为"全部"
        
        # 更新目标信息显示
        if target_nums >= 1:
            self.type_lb.setText(CH_names[cls_list[0]])
            if hasattr(self, 'label_conf_value'):
                self.label_conf_value.setText(str(conf_list[0]))
            else:
                self.label_conf.setText(str(conf_list[0]))
            # 设置坐标位置值
            if hasattr(self, 'label_xmin_value'):
                self.label_xmin_value.setText(str(location_list[0][0]))
                self.label_ymin_value.setText(str(location_list[0][1]))
                self.label_xmax_value.setText(str(location_list[0][2]))
                self.label_ymax_value.setText(str(location_list[0][3]))
            else:
                self.label_xmin.setText(str(location_list[0][0]))
                self.label_ymin.setText(str(location_list[0][1]))
                self.label_xmax.setText(str(location_list[0][2]))
                self.label_ymax.setText(str(location_list[0][3]))
        else:
            self.type_lb.setText('')
            if hasattr(self, 'label_conf_value'):
                self.label_conf_value.setText('')
            else:
                self.label_conf.setText('')
            # 清空坐标位置值
            if hasattr(self, 'label_xmin_value'):
                self.label_xmin_value.setText('')
                self.label_ymin_value.setText('')
                self.label_xmax_value.setText('')
                self.label_ymax_value.setText('')
            else:
                self.label_xmin.setText('')
                self.label_ymin.setText('')
                self.label_xmax.setText('')
                self.label_ymax.setText('')
        
        # 更新表格信息
        self.tableWidget.setRowCount(0)
        self.tableWidget.clearContents()
        self.tabel_info_show(location_list, cls_list, conf_list, path=img_path)
        
        # 绘制检测结果
        self.draw_detection_results()

    # 添加新方法用于绘制检测结果
    def draw_detection_results(self):
        if not hasattr(self, 'results'):
            return
        
        # 使用results.plot()作为基础图像
        now_img = self.results.plot()
        
        # 如果不显示标签，重新绘制只有框的图像
        if not self.show_labels:
            if hasattr(self, 'org_img'):
                now_img = self.org_img.copy()
                for box in self.results.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cls = int(box.cls[0])
                    color = self.colors(cls, True)
                    cv2.rectangle(now_img, (x1, y1), (x2, y2), color, 2)

        self.draw_img = now_img
        # 更新显示
        self.img_width, self.img_height = self.get_resize_size(now_img)
        resize_cvimg = cv2.resize(now_img, (self.img_width, self.img_height))
        pix_img = cvimg_to_qpiximg(resize_cvimg)
        self.label_show.setPixmap(pix_img)
        self.label_show.setAlignment(Qt.AlignCenter)


class btn2Thread(QThread):
    """
    进行检测后的视频保存
    """
    # 声明一个信号
    update_ui_signal = pyqtSignal(int,int)

    def __init__(self, path, model, com_text,conf,iou):
        super(btn2Thread, self).__init__()
        self.org_path = path
        self.model = model
        self.com_text = com_text
        self.conf = conf
        self.iou = iou
        # 用于绘制不同颜色矩形框
        self.colors = tools.Colors()
        self.is_running = True  # 标志位，表示线程是否正在运行

    def run(self):
        # VideoCapture方法是cv2库提供的读取视频方法
        cap = cv2.VideoCapture(self.org_path)
        # 设置需要保存视频的格式"xvid"
        # 该参数是MPEG-4编码类型，文件名后缀为.avi
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        # 设置视频帧频
        fps = cap.get(cv2.CAP_PROP_FPS)
        # 设置视频大小
        size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
        # VideoWriter方法是cv2库提供的保存视频方法
        # 按照设置的格式来out输出
        fileName = os.path.basename(self.org_path)
        name, end_name = fileName.split('.')
        save_name = name + '_detect_result.avi'
        save_video_path = os.path.join(save_path, save_name)
        out = cv2.VideoWriter(save_video_path, fourcc, fps, size)

        prop = cv2.CAP_PROP_FRAME_COUNT
        total = int(cap.get(prop))
        print("[INFO] 视频总帧数：{}".format(total))
        cur_num = 0

        # 确定视频打开并循环读取
        while (cap.isOpened() and self.is_running):
            cur_num += 1
            print('当前第{}帧，总帧数{}'.format(cur_num, total))
            # 逐帧读取，ret返回布尔值
            # 参数ret为True 或者False,代表有没有读取到图片
            # frame表示截取到一帧的图片
            ret, frame = cap.read()
            if ret == True:
                # 检测
                results = self.model(frame,conf=self.conf,iou=self.iou)[0]
                frame = results.plot()
                out.write(frame)
                self.update_ui_signal.emit(cur_num, total)
            else:
                break
        # 释放资源
        cap.release()
        out.release()

    def stop(self):
        self.is_running = False

if __name__ == "__main__":
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec_())