/*
* @Author: wang
* @Date:   2017-11-17 18:03:15
* @Last Modified by:   wang
* @Last Modified time: 2017-11-20 17:39:22
*/
var sessionKey = 'AZDS-TOKEN';
var Session = {
    get: function() {
        return wx.getStorageSync(sessionKey) || null
    },
    set: function(session) {
        wx.setStorageSync(sessionKey, session)
    },
    clear: function() {
        wx.removeStorageSync(sessionKey)
    }
}

module.exports = Session;