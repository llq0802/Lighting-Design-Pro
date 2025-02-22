// export const BASE_URL = 'xxxxxxxx' as const; //

export const USER_TOKEN = `USER_TOKEN`;

export const LOGIN_PATH = '/user/login'; // 登录页路由
export const HOME_PATH = '/dashboard'; // 首页路由
export const NOT_PATH = '/404'; // 404路由

export const THEME_DARK = 'THEME_DARK'; // 主题
export const TABS_LIST = 'TABS_LIST'; // tab路由缓存

export const NOTIFICATION_TYPES = {
  success: '操作成功',
  info: '操作信息',
  warning: '操作警告',
  error: '操作失败',
  add: '新增成功',
  edit: '修改成功',
  del: '删除成功',
} as const;

export const CODE_MESSAGE = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '禁止操作、没有此权限。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
} as const;

/** 用户性别 */
export const genderLabels: Record<number, string> = {
  0: '女',
  1: '男',
};

export const genderOptions: { value: '0' | '1' | null; label: string }[] = [
  { value: '0', label: genderLabels['0'] },
  { value: '1', label: genderLabels['1'] },
];

/** 用户状态 */
export const userStatusLabels: Record<number, string> = {
  1: '启用',
  2: '禁用',
  3: '冻结',
};
