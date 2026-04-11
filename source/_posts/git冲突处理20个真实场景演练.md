---
title: Git 冲突处理 20 个真实场景演练（含图解）
abbrlink: git-conflict-20-scenarios
cover: /img/7.png
date: 2026-04-10 12:20:00
updated: 2026-04-10 12:20:00
toc: true
tags:
  - Git
  - 冲突处理
  - 团队协作
  - 工程化
categories:
  - 开发工具
---

如果你在团队开发里用 Git，那么冲突不是“会不会遇到”，而是“什么时候遇到”。

真正拉开差距的不是“没冲突”，而是：

- 冲突来了不慌
- 能快速判断风险
- 能在 10 分钟内把问题稳稳处理掉

这篇文章我给你做成 **20 个真实场景演练**。每个场景都按一个结构来：

- **现象**：你会看到什么
- **原因**：为什么会这样
- **处理**：一步步怎么做
- **要点**：避免二次翻车

---

## 0. 先记住一条总原则

### 冲突处理四步法

1. **看状态**：`git status`
2. **看文件**：找到冲突文件并阅读冲突标记
3. **改内容**：手动合并，删掉冲突标记
4. **标记完成并提交**：`git add` + `git commit`

冲突标记长这样：

```text
<<<<<<< HEAD
你的分支内容
=======
对方（或目标分支）内容
>>>>>>> main
```

你要做的是：**保留正确结果，删掉这 3 组标记**。

---

## 1. 你改了同一行代码，`git pull` 直接冲突

- **现象**：`git pull` 后提示 `CONFLICT (content)`
- **原因**：你和远程都改了同一行
- **处理**：

```bash
git status
# 打开冲突文件，手动合并
git add <冲突文件>
git commit -m "fix: resolve pull conflict"
```

- **要点**：先理解业务逻辑，再决定保留哪段，不要机械“全选我的”。

---

## 2. `git merge main` 时冲突（功能分支同步主分支）

- **现象**：合并中断，提示冲突文件
- **原因**：功能分支与 `main` 的改动重叠
- **处理**：

```bash
git switch feature/xxx
git merge main
# 处理冲突
git add .
git commit -m "merge: resolve conflict with main"
```

- **要点**：建议每天同步一次 `main`，冲突会小很多。

---

## 3. `git rebase main` 冲突

- **现象**：rebase 停在某个提交，提示 `Resolve all conflicts manually`
- **处理**：

```bash
git rebase main
# 解决当前冲突
git add <文件>
git rebase --continue
```

如果不想继续：

```bash
git rebase --abort
```

- **要点**：rebase 是“逐提交重放”，可能连续冲突多次，耐心处理。

---

## 4. 前端样式文件冲突（`custom.css` / `index.css`）

- **现象**：同一选择器都改了
- **处理建议**：
  - 优先保留语义更清晰、作用域更小的规则
  - 重新整理顺序，避免后续覆盖混乱

```bash
git diff
# 合并后记得本地预览页面
```

- **要点**：CSS 冲突合并后一定要做视觉回归。

---

## 5. 后端配置文件冲突（`.yml` / `.json`）

- **现象**：配置键被两边修改
- **处理**：逐项核对，不能“随便选一边”

```bash
# 合并后做一次配置校验
npm run lint
# 或项目对应的启动检查
```

- **要点**：配置冲突最容易引发“能合并但跑不起来”。

---

## 6. `package-lock.json` 冲突

- **原因**：多人安装依赖导致锁文件差异
- **处理**（稳妥方案）：

```bash
# 1) 先保留 package.json 正确内容
# 2) 删除冲突的 lock 文件
# 3) 重新安装生成一致 lock
npm install
```

然后提交：

```bash
git add package-lock.json
git commit -m "chore: regenerate lockfile after conflict"
```

- **要点**：锁文件冲突优先“重生成”，别手工改半天。

---

## 7. 二进制文件冲突（图片/视频）

- **现象**：Git 无法自动合并
- **处理**：只能选一个版本或重新制作新文件

```bash
# 选择当前分支版本
git checkout --ours <file>
# 或选择对方版本
git checkout --theirs <file>

git add <file>
git commit -m "fix: resolve binary file conflict"
```

- **要点**：二进制冲突没有“行级合并”。

---

## 8. 删除 vs 修改 冲突（`deleted by us/them`）

- **现象**：一边删文件，一边改文件
- **处理**：
  - 要删除：`git rm <file>`
  - 要保留并继续用：恢复并编辑后 `git add <file>`

- **要点**：先确认该文件是否仍被项目引用。

---

## 9. 重命名 vs 修改 冲突

- **现象**：一边重命名，一边改原文件
- **处理**：统一新文件名，并把改动迁移过去

```bash
git status
# 手动整理后
git add .
git commit
```

- **要点**：最后仓库里只能留一个权威文件路径。

---

## 10. 同名函数逻辑不同，合并后编译报错

- **现象**：冲突解决了，但运行失败
- **原因**：语法虽合法，业务逻辑被拼坏
- **处理**：

```bash
# 合并后必做
npm test
# 或 npm run build / 项目测试命令
```

- **要点**：**冲突“解决成功”不等于“系统可用”**。

---

## 11. PR 显示可合并，但本地拉下来冲突

- **原因**：你本地不是最新 `main`
- **处理**：

```bash
git switch main
git pull
git switch feature/xxx
git merge main
```

- **要点**：先同步主分支，再判断冲突。

---

## 12. 冲突太多想重来一次

- **处理**：直接放弃本次合并状态

```bash
git merge --abort
# 或 rebase 场景
git rebase --abort
```

- **要点**：不会处理就先 `abort`，别硬改把现场搞得更乱。

---

## 13. 误把冲突标记提交上去了

- **现象**：代码里残留 `<<<<<<<` 等标记
- **处理**：

```bash
# 全局搜冲突标记
# 例如在 IDE 搜索 <<<<<<< 或 =======

git add .
git commit -m "fix: remove leftover conflict markers"
```

- **要点**：合并后务必做一次全局搜索。

---

## 14. 想偏向“我的版本”快速处理大批文件

- **处理（merge 进行中）**：

```bash
# 全部采用当前分支版本
git checkout --ours .
git add .
git commit -m "merge: prefer ours"
```

- **风险**：可能误覆盖同事关键修复。
- **要点**：仅在你非常确定时使用。

---

## 15. 想偏向“对方版本”快速处理

```bash
git checkout --theirs .
git add .
git commit -m "merge: prefer theirs"
```

- **要点**：同样高风险，优先用于“临时救火 + 后续补回我的改动”。

---

## 16. 多人同时改文档导致冲突

- **现象**：`README.md` / 接口文档冲突
- **处理**：
  - 合并文字内容时注意段落顺序
  - 保证目录与标题层级正确

- **要点**：文档冲突虽然不报编译错，但会影响协作效率。

---

## 17. cherry-pick 引发冲突

- **现象**：`git cherry-pick <commit>` 中断
- **处理**：

```bash
# 解决冲突后
git add .
git cherry-pick --continue

# 放弃本次摘取
git cherry-pick --abort
```

- **要点**：cherry-pick 适合挑修复，不适合大规模功能迁移。

---

## 18. 子模块（submodule）冲突

- **现象**：子模块指针提交不同
- **处理**：确认要指向哪个子模块 commit，再提交父仓库引用

```bash
# 进入子模块检查
git submodule status
```

- **要点**：父仓库记录的是“子模块指针”，不是其内部文件差异。

---

## 19. 线上热修复与开发分支冲突

- **推荐流程**：
  1. 从 `main` 拉 `hotfix/*`
  2. 修复并合并回 `main`
  3. 再把 `main` 合回各开发分支

```bash
git switch main
git pull
git switch -c hotfix/login-crash
```

- **要点**：先保线上，再补功能分支同步。

---

## 20. 你不确定合并后对不对（最常见）

这是最真实也最重要的场景。

- **处理清单**：
  - 跑测试
  - 跑构建
  - 人工走核心流程
  - 让 PR reviewer 再看一轮

```bash
git status
npm test
npm run build
```

- **要点**：冲突处理的终点不是“命令执行完”，而是“功能可用且可回归”。

---

## 实战图解：冲突发生到解决的最短路径

```text
拉取/合并/变基
      ↓
出现冲突（CONFLICT）
      ↓
git status 定位文件
      ↓
手动编辑冲突块（保留正确逻辑）
      ↓
git add 标记已解决
      ↓
git commit 或 --continue
      ↓
测试 + 构建 + 走读核心功能
```

---

## 给新手的冲突处理“保命三件套”

1. **先看 `git status`，别盲目操作**
2. **先 `abort` 再重来，比乱改强 100 倍**
3. **冲突解决后必须测试，不要只看“命令成功”**

---

## 附：冲突应急命令速查

```bash
# 查看状态
git status

# 放弃本次 merge/rebase/cherry-pick
git merge --abort
git rebase --abort
git cherry-pick --abort

# 冲突处理后继续
git add .
git commit
git rebase --continue
git cherry-pick --continue

# 偏向某一方（谨慎）
git checkout --ours .
git checkout --theirs .
```

---


