'use strict';

import fetch from '../../utils/ajax.js';
import constants from '../../utils/constants.js';

const { defaultRefreshIntervalMs, defaultSelectedMaps, symbols } = constants;
let _cfg;

const background = {
  init: () => {
    background.getData();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.method === 'CFGCHANGE') { // get new configuration
        chrome.storage.sync.get({
          refreshIntervalMs: defaultRefreshIntervalMs,
          selectMaps: defaultSelectedMaps,
          noticeMaps: {}
        }, (items) => {
          _cfg = items;
        });
      }
    });
  },

  getData: () => {
    fetch({
      api: 'tickers',
      data: {},
      suc: (data = {}) => {
        background.processData(data);
      },
      err: (e) => {
        console.log('fetch fail:', e);
      }
    });

    setTimeout(background.getData, _cfg.refreshIntervalMs);
  },

  processData: (allTickers) => {
    let notices = [];

    for(var market in _cfg.selectMaps){
      const curExchangeList = _cfg.selectMaps[market] || [];

      curExchangeList.map((coin) => {
        const curExchange = allTickers[`${coin}_${market}`];

        symbols.map((syItem) => {
          const { symbol, flag } = syItem;
          const curNotice = _cfg.noticeMaps[`${coin}_${market}${symbol}`];

          if(curNotice){
            const reached = (curExchange.last - curNotice.rate) * flag >= 0;

            if(!reached){
              curNotice.hasReached = false;
            }else if(!curNotice.hasReached){
              notices.push(`${coin} is ${symbol} ${curNotice.rate} ${market}`);
              curNotice.hasReached = true;
            }
          }
        });
      });

      if(notices[0]){
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Target Price Reached!',
          message: notices.join(';')
        }, function(notificationId) {
          setTimeout(() => {
            chrome.notifications.clear(notificationId, (wasCleared) => {});
          }, 5000);
        });
      }
    }
  }
};

chrome.storage.sync.get({
  refreshIntervalMs: defaultRefreshIntervalMs,
  selectMaps: defaultSelectedMaps,
  noticeMaps: {}
}, (items) => {
  _cfg = items;
  background.init();
});
