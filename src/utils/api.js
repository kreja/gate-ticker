const apis = {
    tickers: { // all exchange prices
        local: 'http://127.0.0.1:8000/data/tickers.json',
        remote: 'http://data.gate.io/api2/1/tickers',
        method: 'get',
        type: 'json'
    },
    pairs: { // all exchange pairs
        local: '/data/pairs.json',
        remote: 'http://data.gate.io/api2/1/pairs',
        method: 'get',
        type: 'json'
    },
};

export default apis;
