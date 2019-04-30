const constants = {
  defaultRefreshIntervalMs: 5000, // unit: ms
  maxIntervalMs: 120000, // unit: ms
  defaultNoticeIntervalMs: 1000 * 60 * 1, // unit: ms
  maxNoticeIntervalMs: 1000 * 60 * 30, // unit: ms
  defaultSelectedMaps: { // default selected exchange list
    usdt: ['btc', 'eth'], // NOTE::all coin name and exchange name use lowercase, display as uppercase
    btc: ['eth']
  },

  // for notice
  symbols: [{
    symbol: '≤',
    flag: -1
  }, {
    symbol: '≥',
    flag: 1
  }]
};

export default constants;
