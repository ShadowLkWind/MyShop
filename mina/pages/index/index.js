//login.js
//获取应用实例
var app = getApp();
Page({
    data: {
        remind: '加载中',
        angle: 0,
        userInfo: {},
        // 用户的注册状态，区分直接进和授权登录
        regFlag: true
    },
    // 跳转主页
    goToIndex: function () {
        wx.switchTab({
            url: '/pages/food/index',
        });
    },
    // 打开后默认执行
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: app.globalData.shopName
        });

        this.checkLogin();
    },
    onShow: function () {

    },
    onReady: function () {
        var that = this;
        setTimeout(function () {
            that.setData({
                remind: ''
            });
        }, 1000);
        wx.onAccelerometerChange(function (res) {
            var angle = -(res.x * 30).toFixed(1);
            if (angle > 14) {
                angle = 14;
            } else if (angle < -14) {
                angle = -14;
            }
            if (that.data.angle !== angle) {
                that.setData({
                    angle: angle
                });
            }
        });
    },
    // 判断用户是否注册过
    checkLogin: function () {
        var that = this;
        // 调用微信的登录接口
        wx.login({
            success: function (res) {
                if (!res.code) {
                    app.alert({'content': '登录失败，请再次点击'});
                    return;
                }
                // 发送请求到后端
                wx.request({
                    url: app.buildUrl("/member/check-reg"),
                    header: app.getRequestHeader(),
                    method: 'POST',
                    data: {code: res.code},
                    success: function (res) {
                        if (res.data.code != 200) {
                            that.setData({
                                regFlag: false
                            });
                            return;
                        }
                        app.setCache("token", res.data.data.token);
                        // that.goToIndex();
                    },
                    // 失败执行
                    fail: function () {
                        app.alert({'content': '网络异常请重试'})
                        that.setData({
                            regFlag: false
                        });
                        return;
                    }
                });
            }
        });
    },
    // 注册并登录
    login: function () {
        var that = this;
        // 调用新的获取头像用户名接口
        wx.getUserProfile({
            desc: '测试获取会员资料', // 不写不弹窗
            success: (res) => {
                if (!res.userInfo) {
                    app.alert({'content': "授权失败，请重试"});
                    return;
                }
                // 拿到数据
                var data = res.userInfo;
                // 调用微信的登录接口
                wx.login({
                    success: function (res) {
                        if (!res.code) {
                            app.alert({'content': '登录失败，请再次点击'});
                            return;
                        }
                        data['code'] = res.code;
                        // 发送请求到后端
                        wx.request({
                            url: app.buildUrl("/member/login"),
                            header: app.getRequestHeader(),
                            method: 'POST',
                            data: data,
                            success: function (res) {
                                // 注意是点data，详见微信小程序文档
                                if (res.data.code != 200) {
                                    app.alert({'content': res.data.msg});
                                    return;
                                }
                                app.setCache("token", res.data.data.token);
                                // 成功则进入主页
                                that.goToIndex();
                            },
                            // 失败执行
                            fail: function () {
                                app.alert({'content': '网络异常请重试'})
                                return;
                            }
                        });
                    }
                });

                // this.setData({
                //     userInfo: res.userInfo,
                //     hasUserInfo: true
                // })
            }
        })
    }
});