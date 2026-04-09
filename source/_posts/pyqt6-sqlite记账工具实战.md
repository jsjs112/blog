---
title: PyQt6 + SQLite 实战：做一个可持久化记账工具
abbrlink: pyqt6-sqlite-ledger
cover: /img/4.png
date: 2026-03-06 12:35:00
updated: 2026-03-06 12:35:00
toc: true
tags:
  - Python
  - PyQt6
  - SQLite
categories:
  - Python
---

这篇带你做一个小型记账工具，目标是把“界面 + 数据持久化”完整串起来。

## 1. 需求拆解

最小可用版本需要：

- 输入金额、类型（收入/支出）、备注
- 保存到本地 SQLite
- 列表展示最近记录
- 支持删除一条记录

## 2. 数据库设计

```sql
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    kind TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL
);
```

## 3. 数据层代码（db.py）

```python
import sqlite3
from datetime import datetime

DB_FILE = "ledger.db"


def get_conn():
    return sqlite3.connect(DB_FILE)


def init_db():
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                kind TEXT NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL
            )
            """
        )


def add_record(amount: float, kind: str, note: str):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO records(amount, kind, note, created_at) VALUES (?, ?, ?, ?)",
            (amount, kind, note, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        )


def list_records(limit=50):
    with get_conn() as conn:
        cur = conn.execute(
            "SELECT id, amount, kind, note, created_at FROM records ORDER BY id DESC LIMIT ?",
            (limit,)
        )
        return cur.fetchall()


def delete_record(record_id: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM records WHERE id = ?", (record_id,))
```

## 4. 界面层代码（main.py）

```python
import sys
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QLineEdit, QPushButton, QComboBox, QListWidget, QMessageBox
)

import db

class LedgerWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("记账工具")
        self.resize(560, 420)

        self.amount_input = QLineEdit()
        self.amount_input.setPlaceholderText("金额，例如 35.6")

        self.kind_box = QComboBox()
        self.kind_box.addItems(["支出", "收入"])

        self.note_input = QLineEdit()
        self.note_input.setPlaceholderText("备注")

        self.add_btn = QPushButton("保存")
        self.del_btn = QPushButton("删除选中")

        self.list_widget = QListWidget()

        top = QHBoxLayout()
        top.addWidget(self.amount_input)
        top.addWidget(self.kind_box)
        top.addWidget(self.note_input)
        top.addWidget(self.add_btn)

        layout = QVBoxLayout()
        layout.addLayout(top)
        layout.addWidget(self.list_widget)
        layout.addWidget(self.del_btn)
        self.setLayout(layout)

        self.add_btn.clicked.connect(self.add_record)
        self.del_btn.clicked.connect(self.delete_record)

        self.refresh_list()

    def refresh_list(self):
        self.list_widget.clear()
        for row in db.list_records():
            rid, amount, kind, note, created_at = row
            self.list_widget.addItem(f"{rid} | {kind} | {amount:.2f} | {note} | {created_at}")

    def add_record(self):
        try:
            amount = float(self.amount_input.text().strip())
        except ValueError:
            QMessageBox.warning(self, "提示", "金额格式不正确")
            return

        kind = self.kind_box.currentText()
        note = self.note_input.text().strip()
        db.add_record(amount, kind, note)

        self.amount_input.clear()
        self.note_input.clear()
        self.refresh_list()

    def delete_record(self):
        item = self.list_widget.currentItem()
        if not item:
            QMessageBox.information(self, "提示", "请先选中一条记录")
            return

        rid = int(item.text().split("|")[0].strip())
        db.delete_record(rid)
        self.refresh_list()

if __name__ == "__main__":
    db.init_db()
    app = QApplication(sys.argv)
    w = LedgerWindow()
    w.show()
    sys.exit(app.exec())
```

## 5. 这个项目你练到了什么

- 界面输入与列表展示
- SQLite 本地持久化
- 简单的数据增删
- 业务与 UI 分离

## 6. 下一步优化建议

- 增加日期筛选
- 增加总支出/总收入统计
- 增加图表（按月汇总）
- 增加导出 CSV

## 7. 小结

当你把 PyQt6 和 SQLite 结合起来，就已经脱离“玩具 DEMO”阶段，开始进入可实用的小型桌面工具开发。