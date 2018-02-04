'use strict';

import {} from 'antd-mobile'; // for shared
import fetch from '../../utils/ajax.js';
import constants from '../../utils/constants.js';

import 'antd-mobile/dist/antd-mobile.css'; // for shared

const { defaultRefreshIntervalMs, defaultSelectedMaps, symbols, defaultNoticeIntervalMs } = constants;
let _cfg;
let lastCount = 0;

const background = {
  init: () => {
    background.getData();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.method === 'CFGCHANGE') { // get new configuration
        chrome.storage.sync.get({
          noticeIntervalMs: defaultNoticeIntervalMs,
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
    let newConut = 0;
    const curTime = (new Date()).getTime();

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
            }else if(!curNotice.hasReached){ // from not reach to reach
              curNotice.hasReached = true;

              // the first time or has reached the interval
              if(!curNotice.lastNoticeTime || curNotice.lastNoticeTime + _cfg.noticeIntervalMs < curTime){
                notices.push(`${coin} is ${symbol} ${curNotice.rate} ${market}`);
                curNotice.lastNoticeTime = curTime;
              }
            }

            if(curNotice.hasReached){
              newConut++;
            }
          }
        });
      });

      if(notices[0]){
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: chrome.i18n.getMessage("NoticeTitlePriceReached"),
          message: notices.join('; ')
        }, function(notificationId) {
          setTimeout(() => {
            chrome.notifications.clear(notificationId, (wasCleared) => {});
          }, 5000);
        });
      }
    }

    if(newConut != lastCount ){
      chrome.browserAction.setBadgeText({
        text: newConut ? newConut.toString() : ''
      });
      lastCount = newConut;
    }
  }
};

chrome.storage.sync.get({
  noticeIntervalMs: defaultNoticeIntervalMs,
  refreshIntervalMs: defaultRefreshIntervalMs,
  selectMaps: defaultSelectedMaps,
  noticeMaps: {}
}, (items) => {
  _cfg = items;
  background.init();
});
