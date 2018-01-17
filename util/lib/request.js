/*
* @Author: wang
* @Date:   2017-11-17 18:18:26
* @Last Modified by:   wang
* @Last Modified time: 2017-11-20 19:25:38
*/
var utils = require('../util.js'),
    Session = require('./session.js'),
    loginLib = require('./login');
var noop = function(){};

var buildAuthHeader = function(session) {
    var header = {};
    if (session){
      header['Authorization-Token'] = session;
    }      
    return header;
}

/***
 * @class
 * 表示请求过程中发生的异常
 */
var RequestError = (function () {
    function RequestError(type, message) {
        Error.call(this, message);
        this.type = type;
        this.message = message;
    }

    RequestError.prototype = new Error();
    RequestError.prototype.constructor = RequestError;

    return RequestError;
})();

var request = function(options) {
    if(typeof options !== 'object') {
        throw new RequestError('ERR_INVALID_PARAMS', '请求传参应为object类型！')
    }

    var requireLogin = options.login,
        success = options.success || noop,
        fail = options.fail || noop,
        header = options.header || {};

    // success callback
    var callSuccess = function() {
        success.apply(null, arguments)
    }

    // fail callback
    var callFail = function(error) {
        fail.call(null, error)
    }

    requireLogin ? doRequestWithLogin() : doRequest();

    // 请求需要先登录
    function doRequestWithLogin(){
        Session.clear()
        loginLib.login({
            success: doRequest,
            fail: callFail
        })
    }

    // 一般请求，无需登录
    function doRequest() {
      var authHeader = buildAuthHeader(wx.getStorageSync('AZDS-TOKEN'));
        wx.request(utils.extend({}, options, {
            header: utils.extend({}, header, authHeader),
            success: function(result){
                // TODO 对返回的结果全局处理
                if(result.statusCode === 401){
                    // 登录过期
                    doRequestWithLogin()
                    return;
                }
                if (result.statusCode === 403){
                  wx.showModal({
                    title: '网络错误403',
                    content: '请重试',
                  })
                  console.log('请求失败');
                  return;
                }
                if (result.statusCode === 404) {
                  wx.showModal({
                    title: '网络错误404',
                    content: '请重试',
                  })
                  console.log('请求失败');
                  return;
                }
                if (result.statusCode === 500) {
                  wx.showModal({
                    title: '网络错误500',
                    content: '请重试',
                  })
                  console.log('请求失败');
                  return;
                }
                if(!result.data.userInfo){

                }
                callSuccess.apply(null, arguments)
            },
            fail: callFail
        }))
    }
}

module.exports = {
    RequestError: RequestError,
    request: request
}
