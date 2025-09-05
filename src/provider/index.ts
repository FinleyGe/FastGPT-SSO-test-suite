import type {
  AssertFn,
  CallbackFn,
  GetMetaDataFn,
  GetOrgListFn,
  GetUserInfoFn,
  GetUserListFn,
  RedirectFn,
} from "type";

import {
  test_getOrgList,
  test_getUserInfo,
  test_GetUserList,
  test_redirectFn,
} from "./test";
// TODO: other providers

const providerMap: {
  [key: string]: {
    getUserInfo: GetUserInfoFn;
    redirectFn: RedirectFn;
    callbackFn?: CallbackFn;
    getMetaData?: GetMetaDataFn;
    assertFn?: AssertFn;
    getUserList?: GetUserListFn;
    getOrgList?: GetOrgListFn;
  };
} = {
  test: {
    redirectFn: test_redirectFn,
    getUserInfo: test_getUserInfo,
    getUserList: test_GetUserList,
    getOrgList: test_getOrgList,
  },
};

export function getProvider() {
  const provider = process.env.SSO_PROVIDER as keyof typeof providerMap;
  if (!providerMap[provider]) {
    return false;
  }
  return providerMap[provider];
}
