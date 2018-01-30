/**
 * 常量
 */

const constants = {
  defaultRefreshIntervalMs: 5000, // 默认刷新间隔毫秒数
  maxIntervalMs: 120000, // 最大刷新间隔毫秒数
  defaultSelectedMaps: { // 默认选中的交易对
    usdt: ['btc', 'eth'],
    btc: ['eth']
  }
};

export default constants;
