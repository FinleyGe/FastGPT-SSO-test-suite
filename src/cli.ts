#!/usr/bin/env bun

import { parseArgs } from "util";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

type TestDataConfig = {
  userCount: number;
  orgDepth: number;
  orgBranches: number;
  outputFile?: string;
};

type GeneratedUser = {
  username: string;
  memberName: string;
  avatar: string;
  contact: string;
  orgs: string[];
};

type GeneratedOrg = {
  id: string;
  name: string;
  parentId: string;
};

type TestData = {
  users: GeneratedUser[];
  orgs: GeneratedOrg[];
  config: TestDataConfig;
};

function generateRandomName(): string {
  const firstNames = [
    "张",
    "李",
    "王",
    "刘",
    "陈",
    "杨",
    "赵",
    "黄",
    "周",
    "吴",
  ];
  const lastNames = [
    "伟",
    "芳",
    "娜",
    "敏",
    "静",
    "丽",
    "强",
    "磊",
    "军",
    "洋",
  ];
  return (
    firstNames[Math.floor(Math.random() * firstNames.length)] +
    lastNames[Math.floor(Math.random() * lastNames.length)]
  );
}

function generateRandomPhone(): string {
  const prefixes = [
    "138",
    "139",
    "150",
    "151",
    "152",
    "158",
    "159",
    "186",
    "187",
    "188",
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return prefix + suffix;
}

function generateOrganizations(
  depth: number,
  branches: number,
): GeneratedOrg[] {
  const orgs: GeneratedOrg[] = [];
  let idCounter = 1;

  function createOrg(name: string, parentId: string): string {
    const id = idCounter.toString();
    orgs.push({
      id,
      name,
      parentId,
    });
    idCounter++;
    return id;
  }

  // 创建根组织
  const rootId = createOrg("总公司", "");

  // 递归创建子组织
  function createSubOrgs(
    parentId: string,
    currentDepth: number,
    parentName: string,
  ) {
    if (currentDepth >= depth) return;

    for (let i = 1; i <= branches; i++) {
      const orgName = `${parentName}-部门${i}`;
      const newOrgId = createOrg(orgName, parentId);

      if (currentDepth < depth - 1) {
        createSubOrgs(newOrgId, currentDepth + 1, orgName);
      }
    }
  }

  createSubOrgs(rootId, 1, "总公司");
  return orgs;
}

function generateUsers(
  userCount: number,
  orgs: GeneratedOrg[],
): GeneratedUser[] {
  const users: GeneratedUser[] = [];

  for (let i = 1; i <= userCount; i++) {
    const memberName = generateRandomName();
    const username = `test-user${i.toString().padStart(4, "0")}`;

    // 随机分配1-3个组织
    const userOrgs: string[] = [];
    const orgCount = Math.floor(Math.random() * 3) + 1;
    const shuffledOrgs = [...orgs].sort(() => Math.random() - 0.5);

    for (let j = 0; j < Math.min(orgCount, shuffledOrgs.length); j++) {
      userOrgs.push(shuffledOrgs[j].id);
    }

    users.push({
      username,
      memberName,
      avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${username}`,
      contact: generateRandomPhone(),
      orgs: userOrgs,
    });
  }

  return users;
}

function generateTestData(config: TestDataConfig): TestData {
  console.log(`正在生成测试数据...`);
  console.log(`- 用户数量: ${config.userCount}`);
  console.log(`- 组织深度: ${config.orgDepth}`);
  console.log(`- 每层分支数: ${config.orgBranches}`);

  const orgs = generateOrganizations(config.orgDepth, config.orgBranches);
  const users = generateUsers(config.userCount, orgs);

  console.log(`生成完成:`);
  console.log(`- 实际生成用户: ${users.length}`);
  console.log(`- 实际生成组织: ${orgs.length}`);

  return {
    users,
    orgs,
    config,
  };
}

function loadConfigFromFile(filePath: string): TestDataConfig {
  if (!existsSync(filePath)) {
    throw new Error(`配置文件不存在: ${filePath}`);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const config = JSON.parse(content);

    // 验证配置格式
    if (typeof config.userCount !== "number" || config.userCount <= 0) {
      throw new Error("userCount 必须是大于0的数字");
    }
    if (typeof config.orgDepth !== "number" || config.orgDepth <= 0) {
      throw new Error("orgDepth 必须是大于0的数字");
    }
    if (typeof config.orgBranches !== "number" || config.orgBranches <= 0) {
      throw new Error("orgBranches 必须是大于0的数字");
    }

    return config;
  } catch (error: any) {
    throw new Error(`解析配置文件失败: ${error.message}`);
  }
}

function saveTestData(testData: TestData, outputPath: string): void {
  try {
    const dir = path.dirname(outputPath);
    if (!existsSync(dir)) {
      throw new Error(`输出目录不存在: ${dir}`);
    }

    writeFileSync(outputPath, JSON.stringify(testData, null, 2), "utf-8");
    console.log(`测试数据已保存到: ${outputPath}`);
  } catch (error: any) {
    throw new Error(`保存文件失败: ${error.message}`);
  }
}

function loadTestData(filePath: string): TestData {
  if (!existsSync(filePath)) {
    throw new Error(`测试数据文件不存在: ${filePath}`);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error: any) {
    throw new Error(`加载测试数据失败: ${error.message}`);
  }
}

function printUsage(): void {
  console.log(`
FastGPT SSO 测试数据生成工具

用法:
  生成新的测试数据:
    bun src/cli.ts generate --users <数量> --org-depth <深度> --org-branches <分支数> --output <输出文件>

  从配置文件生成:
    bun src/cli.ts generate --config <配置文件> --output <输出文件>

  显示测试数据:
    bun src/cli.ts show --file <测试数据文件>

参数说明:
  --users, -u       用户数量 (默认: 10)
  --org-depth, -d   组织架构深度 (默认: 3)
  --org-branches, -b 每层组织分支数 (默认: 2)
  --config, -c      从JSON配置文件读取参数
  --output, -o      输出文件路径 (默认: ./test-data.json)
  --file, -f        要显示的测试数据文件路径
  --help, -h        显示帮助信息

示例:
  # 生成100个用户，4层组织架构，每层3个分支
  bun src/cli.ts generate -u 100 -d 4 -b 3 -o ./data/test-100-users.json

  # 从配置文件生成
  bun src/cli.ts generate -c ./config.json -o ./test-data.json

  # 显示测试数据统计
  bun src/cli.ts show -f ./test-data.json

配置文件格式 (JSON):
{
  "userCount": 100,
  "orgDepth": 4,
  "orgBranches": 3
}
`);
}

async function main(): Promise<void> {
  try {
    const { values, positionals } = parseArgs({
      args: process.argv.slice(2),
      options: {
        help: { type: "boolean", short: "h" },
        users: { type: "string", short: "u" },
        "org-depth": { type: "string", short: "d" },
        "org-branches": { type: "string", short: "b" },
        config: { type: "string", short: "c" },
        output: { type: "string", short: "o" },
        file: { type: "string", short: "f" },
      },
      allowPositionals: true,
    });

    if (values.help || positionals.length === 0) {
      printUsage();
      return;
    }

    const command = positionals[0];

    if (command === "generate") {
      let config: TestDataConfig;

      if (values.config) {
        // 从配置文件读取
        config = loadConfigFromFile(values.config);
      } else {
        // 从命令行参数读取
        config = {
          userCount: values.users ? parseInt(values.users) : 10,
          orgDepth: values["org-depth"] ? parseInt(values["org-depth"]) : 3,
          orgBranches: values["org-branches"]
            ? parseInt(values["org-branches"])
            : 2,
        };

        // 验证参数
        if (isNaN(config.userCount) || config.userCount <= 0) {
          throw new Error("用户数量必须是大于0的数字");
        }
        if (isNaN(config.orgDepth) || config.orgDepth <= 0) {
          throw new Error("组织深度必须是大于0的数字");
        }
        if (isNaN(config.orgBranches) || config.orgBranches <= 0) {
          throw new Error("组织分支数必须是大于0的数字");
        }
      }

      const outputPath = values.output || "./test-data/test-data.json";
      const testData = generateTestData(config);
      saveTestData(testData, outputPath);
    } else if (command === "show") {
      if (!values.file) {
        throw new Error("请指定要显示的测试数据文件路径 (--file)");
      }

      const testData = loadTestData(values.file);

      console.log("\n=== 测试数据统计 ===");
      console.log(`配置信息:`);
      console.log(`  用户数量: ${testData.config.userCount}`);
      console.log(`  组织深度: ${testData.config.orgDepth}`);
      console.log(`  每层分支数: ${testData.config.orgBranches}`);
      console.log(`\n实际数据:`);
      console.log(`  用户总数: ${testData.users.length}`);
      console.log(`  组织总数: ${testData.orgs.length}`);

      console.log(`\n=== 组织架构预览 ===`);
      // 显示组织树结构
      const orgMap = new Map(testData.orgs.map((org) => [org.id, org]));

      function printOrgTree(parentId: string, indent: string = "") {
        const children = testData.orgs.filter(
          (org) => org.parentId === parentId,
        );
        children.forEach((org, index) => {
          const isLast = index === children.length - 1;
          const prefix = isLast ? "└── " : "├── ";
          console.log(`${indent}${prefix}${org.name} (ID: ${org.id})`);

          const nextIndent = indent + (isLast ? "    " : "│   ");
          printOrgTree(org.id, nextIndent);
        });
      }

      printOrgTree("0");

      console.log(`\n=== 用户样本 (前5个) ===`);
      testData.users.slice(0, 5).forEach((user) => {
        console.log(`${user.memberName} (${user.username})`);
        console.log(`  联系方式: ${user.contact}`);
        console.log(`  所属组织: ${user.orgs.join(", ")}`);
        console.log("");
      });
    } else {
      throw new Error(`未知命令: ${command}`);
    }
  } catch (error: any) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

main();

export { generateTestData, loadTestData, type TestData };
