---
title: PyQt6 进阶：布局系统与 QMainWindow 实战
abbrlink: pyqt6-layout-mainwindow
cover: /img/2.png
date: 2026-04-06 11:50:00
updated: 2026-04-06 11:50:00
toc: true
tags:
  - Python
  - PyQt6
  - GUI
categories:
  - Python
---

这篇文章专门讲 PyQt6 的“界面骨架能力”：布局系统 + `QMainWindow`。学完你就能搭出结构清晰、可维护的主程序窗口。

## 1. 为什么要学 QMainWindow

`QWidget` 适合简单窗口，而 `QMainWindow` 原生支持：

- 菜单栏（MenuBar）
- 工具栏（ToolBar）
- 状态栏（StatusBar）
- 中央区域（Central Widget）
- 停靠面板（Dock Widget）

这正是桌面软件常见形态。

## 2. 最小主窗口代码

```python
import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QLabel

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PyQt6 主窗口")
        self.resize(900, 600)

        center = QLabel("欢迎使用 PyQt6")
        center.setStyleSheet("font-size: 20px; padding: 20px;")
        self.setCentralWidget(center)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = MainWindow()
    w.show()
    sys.exit(app.exec())
```

## 3. 菜单栏与动作（QAction）

```python
from PyQt6.QtGui import QAction

file_menu = self.menuBar().addMenu("文件")
open_action = QAction("打开", self)
save_action = QAction("保存", self)
exit_action = QAction("退出", self)

file_menu.addAction(open_action)
file_menu.addAction(save_action)
file_menu.addSeparator()
file_menu.addAction(exit_action)

exit_action.triggered.connect(self.close)
```

经验：把所有 Action 放到单独方法 `create_actions()`，后续快捷键和权限控制更好维护。

## 4. 工具栏与状态栏

```python
toolbar = self.addToolBar("主工具栏")
toolbar.addAction(open_action)
toolbar.addAction(save_action)

self.statusBar().showMessage("就绪")
```

状态栏建议用来反馈：

- 当前文件路径
- 保存状态
- 后台任务进度

## 5. 布局系统实践：左右分栏 + 顶部过滤

```python
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QListWidget, QTextEdit, QLineEdit

container = QWidget()
root = QVBoxLayout(container)

search = QLineEdit()
search.setPlaceholderText("输入关键词过滤...")
root.addWidget(search)

content = QHBoxLayout()
left_list = QListWidget()
right_editor = QTextEdit()
content.addWidget(left_list, 2)
content.addWidget(right_editor, 5)

root.addLayout(content)
self.setCentralWidget(container)
```

这就是典型“后台管理/笔记软件”基础框架。

## 6. 停靠面板（Dock）提升扩展性

```python
from PyQt6.QtWidgets import QDockWidget, QTextEdit
from PyQt6.QtCore import Qt

dock = QDockWidget("日志", self)
dock.setAllowedAreas(Qt.DockWidgetArea.LeftDockWidgetArea | Qt.DockWidgetArea.RightDockWidgetArea)
dock.setWidget(QTextEdit())
self.addDockWidget(Qt.DockWidgetArea.RightDockWidgetArea, dock)
```

后续可放：日志、属性面板、任务队列。

## 7. 推荐工程化写法

建议分层：

- `main_window.py`：界面结构
- `actions.py`：动作定义与信号连接
- `views/`：左面板、右面板等子组件
- `services/`：业务处理

避免把所有逻辑塞进一个窗口类。

## 8. 小结

掌握 `QMainWindow + 布局` 后，你已经具备开发“真正桌面软件”的基础框架能力。下一篇建议学习线程与进度条，解决“耗时操作导致卡界面”的痛点。