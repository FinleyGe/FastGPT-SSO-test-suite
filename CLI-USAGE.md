# FastGPT SSO 测试数据生成工具使用指南

## 功能概述

这个命令行工具可以帮助你生成大规模的测试用户和组织架构数据，用于测试FastGPT的SSO功能和用户同步功能。

## 主要特性

1. **灵活的数据生成**：支持自定义用户数量、组织深度和分支数
2. **配置文件支持**：可以通过JSON配置文件批量生成数据
3. **数据持久化**：生成的数据保存为JSON文件，方便复现问题
4. **智能数据分配**：用户会随机分配到1-3个组织中
5. **真实数据模拟**：生成真实的中文姓名和手机号码

## 安装依赖

```bash
bun install
```

## 基本用法

### 1. 生成测试数据

```bash
# 生成默认数据（10个用户，3层组织，每层2个分支）
bun run generate

# 自定义参数生成
bun run generate -u 50 -d 4 -b 3 -o ./my-test-data.json

# 生成大规模数据
bun run generate --users 1000 --org-depth 5 --org-branches 4 --output ./large-test-data.json
```

### 2. 使用配置文件

创建配置文件 `config.json`：
```json
{
  "userCount": 100,
  "orgDepth": 4,
  "orgBranches": 3
}
```

从配置文件生成：
```bash
bun run generate -c ./config.json -o ./test-data.json
```

### 3. 查看生成的数据

```bash
# 显示数据统计和预览
bun run show -f ./test-data.json
```

## 命令参数说明

| 参数 | 短参数 | 说明 | 默认值 |
|------|--------|------|--------|
| `--users` | `-u` | 用户数量 | 10 |
| `--org-depth` | `-d` | 组织架构深度 | 3 |
| `--org-branches` | `-b` | 每层组织分支数 | 2 |
| `--config` | `-c` | 配置文件路径 | - |
| `--output` | `-o` | 输出文件路径 | ./test-data.json |
| `--file` | `-f` | 要显示的数据文件路径 | - |
| `--help` | `-h` | 显示帮助信息 | - |

## 使用生成的数据

### 1. 启动SSO服务器时指定数据文件

```bash
# 使用环境变量指定测试数据文件
TEST_DATA_FILE=./test-data.json bun run dev

# 或者
export TEST_DATA_FILE=./test-data.json
bun run dev
```

### 2. 测试API端点

启动服务器后，你可以测试以下端点：

```bash
# 获取用户列表
curl "http://localhost:3000/user/list"

# 获取组织列表  
curl "http://localhost:3000/org/list"

# 获取授权URL
curl "http://localhost:3000/login/oauth/getAuthURL?redirect_uri=http://localhost:3001/callback"
```

## 生成的数据格式

### 用户数据格式
```json
{
  "username": "user0001",
  "memberName": "张伟",
  "avatar": "https://api.dicebear.com/7.x/avatars/svg?seed=user0001",
  "contact": "13812345678",
  "orgs": ["1", "2", "3"]
}
```

### 组织数据格式
```json
{
  "id": "1",
  "name": "总公司",
  "parentId": "0"
}
```

## 测试场景示例

### 小规模测试（快速验证）
```bash
bun run generate -u 10 -d 2 -b 2 -o ./small-test.json
```

### 中等规模测试（功能测试）
```bash
bun run generate -u 100 -d 4 -b 3 -o ./medium-test.json
```

### 大规模测试（性能测试）
```bash
bun run generate -u 10000 -d 6 -b 5 -o ./large-test.json
```

### 复杂组织架构测试
```bash
bun run generate -u 500 -d 8 -b 4 -o ./complex-org-test.json
```

## 常见问题

### Q: 如何确保数据一致性？
A: 生成的数据会保存到JSON文件中，每次使用相同的文件可以确保测试数据一致性。

### Q: 组织架构是如何生成的？
A: 采用树状结构，从根组织（总公司）开始，按指定的深度和分支数递归生成子组织。

### Q: 用户如何分配到组织？
A: 每个用户会随机分配到1-3个组织中，确保测试数据的多样性。

### Q: 如何生成更真实的测试数据？
A: 工具会生成真实的中文姓名组合和有效的手机号码格式，头像使用DiceBear API生成。

## 开发和调试

如果需要修改数据生成逻辑，主要文件位于：
- `src/cli.ts` - 命令行工具主文件
- `src/provider/test.ts` - 测试数据提供者
- `src/type.ts` - 类型定义

```bash
# 开发模式运行CLI
bun --watch src/cli.ts generate -u 5 -d 2 -b 2
```