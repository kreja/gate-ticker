/**
 * apimaps
 */

const apis = {
    tickers: { // 所有交易行情
        local: '/data/tickers.json',
        remote: 'http://data.gate.io/api2/1/tickers',
        method: 'get',
        type: 'json'
    },
    pairs: { // 所有交易对
        local: '/data/pairs.json',
        remote: 'http://data.gate.io/api2/1/pairs',
        method: 'get',
        type: 'json'
    },
};

export default apis;
