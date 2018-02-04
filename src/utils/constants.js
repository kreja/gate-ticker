const constants = {
  defaultRefreshIntervalMs: 5000, // unit: ms
  maxIntervalMs: 120000, // unit: ms
  defaultSelectedMaps: { // default selected exchange list
    usdt: ['btc', 'eth'],
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
