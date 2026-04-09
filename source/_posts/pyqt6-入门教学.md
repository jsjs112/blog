---
title: PyQt6 入门教学：从 0 到 1 写出桌面 GUI
abbrlink: pyqt6-guide
cover: /img/1.png
date: 2026-02-03 10:30:00
updated: 2026-02-03 11:40:00
toc: true
tags:
  - Python
  - PyQt6
  - GUI
categories:
  - Python
---

如果你会一点 Python，但还没做过桌面图形界面（GUI），这篇教程可以带你快速上手 **PyQt6**。这是一篇“能直接跑、能看见结果、能继续扩展”的实战入门。

## 1. PyQt6 是什么？为什么值得学

PyQt6 是 Qt 在 Python 世界的绑定库，核心优势是：

- 跨平台（Windows / macOS / Linux）
- 组件丰富（按钮、表格、树、菜单、对话框、图形视图）
- 适合工具型产品、内部系统客户端、教学项目
- 对 Python 开发者非常友好

如果你正在做自动化脚本、数据处理脚本，PyQt6 可以把“命令行工具”升级成“可视化工具”。

## 2. 环境安装与项目结构建议

建议使用 Python 3.10+。

```bash
pip install pyqt6
```

验证：

```bash
python -c "import PyQt6; print('PyQt6 OK')"
```

推荐项目结构：

```text
my_pyqt6_app/
├─ main.py
├─ ui/
├─ services/
├─ assets/
└─ requirements.txt
```

## 3. 第一个窗口：理解 QApplication 与事件循环

```python
import sys
from PyQt6.QtWidgets import QApplication, QWidget

app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("我的第一个 PyQt6 窗口")
window.resize(520, 340)
window.show()
sys.exit(app.exec())
```

关键点：

- `QApplication`：应用对象，一个进程只保留一个。
- `QWidget`：最基础的窗口/控件父类。
- `app.exec()`：事件循环启动，界面才会响应点击、输入等行为。

## 4. 控件与布局：从“能显示”到“能组织”

```python
import sys
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QLabel, QLineEdit, QPushButton
)

class DemoWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PyQt6 控件示例")
        self.resize(420, 240)

        self.label = QLabel("请输入你的名字：")
        self.input_box = QLineEdit()
        self.btn = QPushButton("打招呼")

        layout = QVBoxLayout()
        layout.addWidget(self.label)
        layout.addWidget(self.input_box)
        layout.addWidget(self.btn)
        self.setLayout(layout)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DemoWindow()
    window.show()
    sys.exit(app.exec())
```

布局是 GUI 开发里非常关键的一层：

- `QVBoxLayout`：垂直堆叠
- `QHBoxLayout`：水平排列
- `QGridLayout`：网格布局
- 嵌套布局：复杂界面的标准做法

## 5. 信号与槽：交互逻辑的核心

```python
import sys
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QLabel, QLineEdit, QPushButton
)

class DemoWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PyQt6 信号槽示例")
        self.resize(420, 240)

        self.label = QLabel("请输入你的名字：")
        self.input_box = QLineEdit()
        self.result = QLabel("")
        self.btn = QPushButton("打招呼")

        self.btn.clicked.connect(self.say_hello)

        layout = QVBoxLayout()
        layout.addWidget(self.label)
        layout.addWidget(self.input_box)
        layout.addWidget(self.btn)
        layout.addWidget(self.result)
        self.setLayout(layout)

    def say_hello(self):
        name = self.input_box.text().strip() or "同学"
        self.result.setText(f"你好，{name}！欢迎学习 PyQt6")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DemoWindow()
    window.show()
    sys.exit(app.exec())
```

常见信号：

- `clicked`
- `textChanged`
- `currentIndexChanged`
- `itemSelectionChanged`

## 6. 小实战：简易待办清单（Todo）

```python
import sys
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QLineEdit, QPushButton, QListWidget, QMessageBox
)

class TodoApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("PyQt6 Todo")
        self.resize(520, 380)

        self.input_box = QLineEdit()
        self.input_box.setPlaceholderText("输入待办事项...")

        self.add_btn = QPushButton("添加")
        self.del_btn = QPushButton("删除选中")

        self.list_widget = QListWidget()

        top_layout = QHBoxLayout()
        top_layout.addWidget(self.input_box)
        top_layout.addWidget(self.add_btn)

        main_layout = QVBoxLayout()
        main_layout.addLayout(top_layout)
        main_layout.addWidget(self.list_widget)
        main_layout.addWidget(self.del_btn)
        self.setLayout(main_layout)

        self.add_btn.clicked.connect(self.add_item)
        self.del_btn.clicked.connect(self.delete_item)

    def add_item(self):
        text = self.input_box.text().strip()
        if not text:
            QMessageBox.warning(self, "提示", "请输入内容后再添加")
            return
        self.list_widget.addItem(text)
        self.input_box.clear()

    def delete_item(self):
        row = self.list_widget.currentRow()
        if row < 0:
            QMessageBox.information(self, "提示", "请先选中一条待办")
            return
        self.list_widget.takeItem(row)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = TodoApp()
    window.show()
    sys.exit(app.exec())
```

## 7. 代码拆分建议：避免 main.py 越写越大

当项目稍微复杂后，建议这么拆：

- `ui/main_window.py`：界面类
- `services/todo_service.py`：业务逻辑
- `models/`：数据结构
- `main.py`：只做应用启动

这会让后续维护、测试、重构都更轻松。

## 8. 常见坑位与排查方法

### 8.1 点按钮没反应

优先排查是否正确绑定：

```python
self.btn.clicked.connect(self.on_click)
```

### 8.2 窗口一闪而过

通常是没有进入事件循环，或程序提前退出。

### 8.3 样式无效

确认你是否用的是 Qt 样式表（QSS），并检查选择器是否匹配控件对象。

## 9. PyQt6 与 Tkinter 的差异（快速理解）

- Tkinter：轻量、上手快、组件相对少
- PyQt6：更现代、组件更多、企业级可扩展性更强

如果你未来会做中大型桌面工具，建议优先 PyQt6。

## 10. 下一步学习路线

建议按这个顺序继续：

1. `QMainWindow`（菜单栏、工具栏、状态栏）
2. `QTableWidget` / `QTreeWidget`
3. 文件读写（JSON / SQLite）
4. `QThread`（耗时任务不卡 UI）
5. 打包发布（PyInstaller）

## 11. 打包成可执行文件

```bash
pip install pyinstaller
pyinstaller -F -w main.py
```

- `-F`：打成单文件
- `-w`：Windows 下关闭控制台窗口

## 12. 总结

你现在已经掌握 PyQt6 的核心主线：

- 控件（Widget）
- 布局（Layout）
- 事件（Signal/Slot）
- 业务组织（分层拆分）

接下来建议直接做一个“可保存数据”的小项目，比如记账、任务管理、下载器，这样成长最快。