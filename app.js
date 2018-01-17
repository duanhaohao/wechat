//app.js
var azds = require('/utils/azds.js')
var login = require('/utils/lib/login.js');
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    login.getWxLoginResult(
      function (code, userInfo){
        wx.setStorageSync('code', userInfo.code)

      }
    )
  },
  globalData: {
    userInfo: null
  }
})