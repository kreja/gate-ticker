
import Utils, {
    reqwest
} from './index';

import API from './api';

/**
 * params
 *  api: string
 *  data: object
 *  suc: function
 *  err: function
 */
export default function fetch(params = {}, cb) {
    const { api } = params;
    const apiInfo = API[api];
    const { local, remote, ...others } = apiInfo;

    if (!apiInfo) {
        throw new Error(`Can not find api ${api}`);
    }

    params.url = API[api][Utils.isLocal() ? 'local' : 'remote'];
    const finalParams = Object.assign({}, params, others);

    fetchData(finalParams, cb);
}

function fetchData(params, cb) {
    const isLocal = Utils.isLocal();
    const { api, url, data = {}, type, suc, err, ...others } = params;

    reqwest({
        url,
        data,
        type: type || 'json',
        method: params.method || 'get',
        ...others,
        success: (res = {}) => {      
            // todo::gate 接口不规范啊
            params.suc && params.suc(res);
        },
        error: (err) => {
            params.err && params.err('fetch fail');
        }
    });
}
