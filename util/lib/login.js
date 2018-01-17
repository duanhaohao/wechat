/*
* @Author: wang
* @Date:   2017-11-17 15:16:08
* @Last Modified by:   wang
* @Last Modified time: 2017-11-20 19:29:52
*/
var extend = require('../util.js').extend;
var Session = require('./session.js');
const app = getApp();
var LoginError = (function () {
    function LoginError(type, message) {
        Error.call(this, message);
        this.type = type;
        this.message = message;
    }

    LoginError.prototype = new Error();
    LoginError.prototype.constructor = LoginError;

    return LoginError;
})();
/**
 * 微信登录，获取code和encryptData
 */
var getWxLoginResult = function (callback) {
    wx.login({
        success: function(loginResult) {
            wx.getUserInfo({
                success: function(userResult) {
                  wx.setStorageSync('wxuserInfo', userResult.userInfo)
                    callback(null, {
                        code: loginResult.code,
                        encryptedData: userResult.encryptedData,
                        iv: userResult.iv,
                        userInfo: userResult.userInfo,
                    })
                },
                fail: function(userError) {
                    wx.showModal({
                      title: '警告',
                      content: '您点击了拒绝授权，将无法正常使用安装大师的功能体验。请10分钟后再次点击授权，或者删除小程序重新进入。',
                      success: function (res) {
                        if (res.confirm) {
                          wx.redirectTo({
                            url: '/pages/login/login',
                          })
                        }else{
                          wx.redirectTo({
                            url: '/pages/login/login',
                          })
                        }
                      }
                    })
                    var error = new LoginError('ERR_WX_GET_USER_INFO', '获取微信用户信息失败，请检查网络状态!')
                    error.detail = userError
                    callback(error, null)
                    
                }
            })
        },
        fail: function(lofinError) {
            var error = new LoginError('ERR_WX_LOGIN_FAILED', '微信登录失败，请检查网络状态');
            error.detail = loginError;
            callback(error, null)
        }
    })
}

var noop = function noop() {};
var defaultOptions = {
    loginUrl: null,
    method: 'POST',
    success: noop,
    fail: noop,
};

var login = function(options) {
    options = extend({}, defaultOptions, options)
    if (!defaultOptions.loginUrl) {
        throw new LoginError('ERR_INVALID_PARAMS', '登录错误：缺少登录地址！')
        return;
    }
    var doLogin = function() {
        getWxLoginResult(function(wxLoginError, wxLoginResult) {
            if(wxLoginError) {
                options.fail(wxLoginError)
                return;
            }
            var userInfo = wxLoginResult.userInfo;
            // 获取会话信息，获取token
            wx.request({
                url: options.loginUrl,
                method: options.method,
                header: options.header,
                data: extend({code: wxLoginResult.code}, options.data),
                success: function(result) {
                    var data = result.data;
                    var statusCode = result.code;
                    // if(!data.userInfo) {
                    //     // 若无用户信息则呼出登录页面

                    //     return;
                    // }
                    // Session.set(data.token);
                    options.success(userInfo);
                },
                fail: function() {
                    var error = new LoginError('ERR_LOGIN_FAILED', '登录失败，可能是网络错误或者服务器发生异常!')
                    options.fail(error)
                }
            })
        })
    }

    doLogin()
}

var setLoginUrl = function(loginUrl) {
    defaultOptions.loginUrl = loginUrl;
}

module.exports = {
    LoginError: LoginError,
    login: login,
    setLoginUrl: setLoginUrl,
    getWxLoginResult: getWxLoginResult
}