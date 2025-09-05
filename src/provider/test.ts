import {
  RedirectFn,
  GetUserInfoFn,
  GetOrgListFn,
  GetUserListFn,
} from "../type";
import { loadTestData, TestData } from "../cli";
import { existsSync } from "fs";

// 用于存储生成的code和对应的用户信息
const codeMap = new Map();

// 全局变量存储测试数据
let testData: TestData | null = null;

// 加载测试数据
function loadTestDataIfExists(): void {
  if (testData) return; // 已经加载过了

  const testDataPath = process.env.TEST_DATA_FILE || "./test-data.json";

  if (existsSync(testDataPath)) {
    try {
      testData = loadTestData(testDataPath);
      console.log(
        `✅ 已加载测试数据: ${testData.users.length} 个用户, ${testData.orgs.length} 个组织`,
      );
    } catch (error: any) {
      console.warn(`⚠️  加载测试数据失败: ${error.message}, 使用默认数据`);
    }
  } else {
    console.log(`ℹ️  测试数据文件不存在 (${testDataPath}), 使用默认数据`);
  }
}

export const test_redirectFn: RedirectFn = async ({ redirect_uri, state }) => {
  loadTestDataIfExists();

  // 生成随机 code
  const code = Math.random().toString(36).substring(2, 15);

  // 从测试数据中选择用户，支持环境变量指定
  let userInfo;
  if (testData && testData.users.length > 0) {
    let selectedUser;

    // 检查是否通过环境变量指定用户
    const selectedUsername = process.env.TEST_USER_USERNAME;
    if (selectedUsername) {
      selectedUser = testData.users.find(
        (user) => user.username === selectedUsername,
      );
      if (selectedUser) {
        console.log(`🎯 使用环境变量指定的用户: ${selectedUsername}`);
      } else {
        console.warn(
          `⚠️  环境变量指定的用户 ${selectedUsername} 不存在，使用随机用户`,
        );
      }
    }

    // 如果没有指定用户或指定的用户不存在，则随机选择
    if (!selectedUser) {
      selectedUser =
        testData.users[Math.floor(Math.random() * testData.users.length)];
      console.log(`🎲 随机选择用户: ${selectedUser.username}`);
    }

    userInfo = {
      username: selectedUser.username,
      avatar: selectedUser.avatar,
      contact: selectedUser.contact,
      memberName: selectedUser.memberName,
    };
  } else {
    userInfo = {
      username: "testuser1234",
      avatar: "https://example.com/avatar.jpg",
      contact: "15677751111",
      memberName: "测试用户",
    };
  }

  // 存储 code 对应的用户信息
  codeMap.set(code, userInfo);

  const redirectUrl = `${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`;
  console.log(`🔗 重定向URL: ${redirectUrl}`);

  return { redirectUrl };
};

export const test_getUserInfo: GetUserInfoFn = async (code: string) => {
  // 获取存储的用户信息
  const userInfo = codeMap.get(code);
  console.log(`👤 获取用户信息:`, userInfo, `Code: ${code}`);
  if (!userInfo) {
    return Promise.reject("Invalid code");
  }

  // 使用完后删除 code
  codeMap.delete(code);

  return userInfo;
};

export const test_GetUserList: GetUserListFn = async () => {
  loadTestDataIfExists();

  if (testData && testData.users.length > 0) {
    console.log(`📋 返回用户列表: ${testData.users.length} 个用户`);
    return testData.users.map((user) => ({
      username: user.username,
      avatar: user.avatar,
      contact: user.contact,
      memberName: user.memberName,
      orgs: user.orgs,
    }));
  }

  // 默认用户列表
  console.log(`📋 返回默认用户列表`);
  return [
    {
      username: "test-1",
      avatar: "https://example.com/avatar.jpg",
      contact: "15677751111",
      memberName: "testuser1234",
      orgs: ["1", "2"],
    },
    {
      username: "test-2",
      avatar: "https://example.com/avatar.jpg",
      contact: "15677751111",
      memberName: "testuser5678",
      orgs: ["3", "4"],
    },
  ];
};

export const test_getOrgList: GetOrgListFn = async () => {
  loadTestDataIfExists();

  if (testData && testData.orgs.length > 0) {
    console.log(`🏢 返回组织列表: ${testData.orgs.length} 个组织`);
    return testData.orgs;
  }

  // 默认组织列表
  console.log(`🏢 返回默认组织列表`);
  return [
    {
      id: "1",
      name: "社区管理",
      parentId: "0",
    },
    {
      id: "2",
      name: "1-2",
      parentId: "1",
    },
    {
      id: "3",
      name: "1-2-3",
      parentId: "2",
    },
    {
      id: "4",
      name: "4",
      parentId: "0",
    },
  ];
};
