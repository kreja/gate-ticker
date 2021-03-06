import QueryString from 'query-string';
import reqwest from 'reqwest';
import constants from './constants.js';

export { QueryString, reqwest, constants };

export default {
    isLocal: () => {
        const hostname = location.hostname;
        return /127\.0\.0\.1/.test(hostname) || /localhost/.test(hostname) || /^(\d+\.){1,}\d+$/.test(hostname);
    },
    getUrlParam: (name, originUrl) => {
        let search = location.search;
        if (originUrl) {
            search = originUrl.indexOf('?') > -1 ? originUrl.split('?')[1] : originUrl;
        }
        const params = QueryString.parse(search);
        return typeof name === 'undefined' ? undefined : params[name];
    },
    isTrue: (v) => {
        return v === true || v === 'true';
    },
    formatDate: function(date, fmt) {
        if (this.isObject(date) == false) {
            return date;
        }
        date = new Date(date);
        if (fmt === undefined) {
            fmt = 'yyyy-MM-dd hh:mm:ss';
        }
        var o = {
            'M+': date.getMonth() + 1, // month
            'd+': date.getDate(), // date
            'h+': date.getHours(), // hour
            'm+': date.getMinutes(), // minute
            's+': date.getSeconds(), // second
            'q+': Math.floor((date.getMonth() + 3) / 3), // quater
            'S': date.getMilliseconds() // ms
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        return fmt;
    },
    isObject: function(obj) {
        return this._type(obj) == 'object';
    },
    _type: function(obj) {
        var class2type = {};
        var toString = class2type.toString;
        return obj == null ? String(obj) :
            class2type[toString.call(obj)] || 'object';
    },
    toString: (data) => {
      let string = [];
      for (let name in data) {
        string.push(`${name}=${data[name]}`)
      }
      return string.join("&");
    }
};
