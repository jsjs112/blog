---
title: PyQt6 实战：QThread + 进度条，彻底解决界面卡顿
abbrlink: pyqt6-qthread-progress
cover: /img/3.png
date: 2026-02-26 12:10:00
updated: 2026-02-26 12:10:00
toc: true
tags:
  - Python
  - PyQt6
  - 多线程
categories:
  - Python
---

很多人做 PyQt6 时都会遇到一个问题：点击“开始”后界面卡死。根因通常是耗时任务跑在主线程。本文用一个完整例子解决这个问题。

## 1. 为什么会卡顿

PyQt6 的 GUI 运行在主线程，负责：

- 刷新界面
- 响应鼠标键盘
- 分发事件

如果主线程执行长循环、网络请求、文件扫描，界面就无法刷新。

## 2. 正确思路

- 耗时任务放到工作线程（`QThread`）
- 线程通过信号把进度发回主线程
- 主线程只负责更新界面

## 3. 完整示例：模拟 100 步任务

```python
import sys
import time
from PyQt6.QtCore import QThread, pyqtSignal
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QPushButton, QLabel, QProgressBar
)

class Worker(QThread):
    progress = pyqtSignal(int)
    finished = pyqtSignal(str)

    def run(self):
        for i in range(1, 101):
            time.sleep(0.03)
            self.progress.emit(i)
        self.finished.emit("任务完成")

class Window(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("QThread 进度条示例")
        self.resize(420, 220)

        self.info = QLabel("点击开始执行任务")
        self.bar = QProgressBar()
        self.bar.setRange(0, 100)
        self.btn = QPushButton("开始")

        layout = QVBoxLayout()
        layout.addWidget(self.info)
        layout.addWidget(self.bar)
        layout.addWidget(self.btn)
        self.setLayout(layout)

        self.btn.clicked.connect(self.start_task)
        self.worker = None

    def start_task(self):
        self.btn.setEnabled(False)
        self.info.setText("任务执行中...")
        self.bar.setValue(0)

        self.worker = Worker()
        self.worker.progress.connect(self.bar.setValue)
        self.worker.finished.connect(self.task_done)
        self.worker.start()

    def task_done(self, msg: str):
        self.info.setText(msg)
        self.btn.setEnabled(True)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = Window()
    w.show()
    sys.exit(app.exec())
```

## 4. 常见错误写法（不要这样）

直接在按钮回调里写长循环：

```python
def on_click(self):
    for i in range(100000000):
        ...
```

这样 GUI 主线程会被阻塞。

## 5. 线程通信规则

- 不要在子线程里直接操作界面控件
- 用 `pyqtSignal` 把数据发回主线程
- 主线程收到信号后更新 UI

## 6. 取消任务怎么做

常见做法：在 Worker 里加 `self._running` 标记。

- 启动时设为 `True`
- 点击取消时设为 `False`
- `run()` 里循环检查该标记

## 7. 适用场景

- 文件批量处理
- 爬虫/接口轮询
- 大图片计算/模型推理
- 数据导入导出

## 8. 小结

线程不是“可选项”，而是 PyQt6 做实用工具的基础能力。你只要记住一句话：

> UI 主线程永远只做 UI；耗时任务永远放后台线程。