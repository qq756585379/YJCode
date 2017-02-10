
'use strict';

(function(angular) {

    var quanApp = angular.module('quanApp',[]);

    quanApp.controller('QuanController',['$scope','$interval','$http',function ($scope, $interval, $http) {

            $scope.btnText = '获取验证码';
            $scope.isTiming = false;

            $scope.user={
                tel: '',
                code: ''
            };


            if(window.location.search.split('?')[1]){
                var url = window.location.search.split('?')[1];
            }
            var telephone;
            if(url.split('&')[0].split('=')[1]){
                telephone = url.split('&')[0].split('=')[1];
            }else{
                var input = document.querySelector('.lg_phone');
                telephone = input.value
            }
            if(url.split('&')[0].split('=')[1]){
                var telephoneNumber = url.split('&')[0].split('=')[1];
                console.log(telephoneNumber);
            }
            if(url.split('&')[1].split('=')[1]){
                var activity_id = url.split('&')[1].split('=')[1];
                console.log(activity_id);
            }
            if(url.split('&')[2].split('=')[1]){
                var user_id  = url.split('&')[2].split('=')[1];
                console.log(user_id);
            }


            //官方的API中提供了一个$scope.$watch方法，
            $scope.$watch('user.tel', function(now, old) {
                // 当user.tel发生变化时触发这个函数
                console.log('now is ' + now);
                console.log('old is ' + old);
                if (now) {
                    if (now.length < 7) {
                        $scope.message = '输入格式不合法';
                    } else {
                        $scope.message = '';
                    }
                } else {
                    $scope.message = '请输入用户名';
                }
            });

            $scope.getCode = function () {
                //判断手机号输入是否合法， 如果不合法不计时
                if($scope.postForm.phone.$invalid) {//手机号输入不合法
                    $scope.postForm.phone.$dirty = true;
                    return;
                }
                //开始计时
                $scope.isTiming = true;
                var time = 60;
                $scope.btnText = time+'s后重新获取';
                //使用$interval启动计时
                var getcodetimer = $interval(function (){
                    time--;
                    //限制time的值>=1
                    if(time==0){
                        $scope.isTiming = false;
                        $scope.btnText = '获取验证码';
                        //取消定时器
                        $interval.cancel(getcodetimer);
                    } else {
                        $scope.btnText = time+'s后重新获取';
                    }
                }, 1000);

                //请求验证码
                var yanCode = 'http://114.55.234.142:8080/tztvapi/coupon/sendCode?callback=JSON_CALLBACK&user_id=100014&telephone='+$scope.user.tel;
                console.log(yanCode);
                $http.jsonp(yanCode).success(function(res){
                        console.log(res);
                        $scope.data = res.data;
                        console.log('res.code='+$scope.data)
                    }).error(function(res){
                        console.log('信息发送失败');
                });

            };

            //提交
            $scope.submit = function () {
                var id = $scope.user.tel.substr(5,6);
                var validateCode = 'http://114.55.234.142:8080/tztvapi/coupon/validateCode?callback=JSON_CALLBACK&id='+$scope.data+'&code='+$scope.user.code+'&activity_id='+8+'&user_id='+id;
                console.log(validateCode);
                $http.jsonp(validateCode)
                    .success(function(res){
                        console.log(res);
                        $scope.userId = res.data.user_id;
                        if(res.code == 0){
                            var getCouponList = 'http://114.55.234.142:8080/tztvapi/coupon/getCouponList?callback=JSON_CALLBACK&user_id='+$scope.userId;
                            $http.jsonp(getCouponList)
                                .success(function(response){
                                    if(response.code==0){
                                        //显示序列号
                                        var show = function(){
                                            var couponNum = document.querySelector('.coupon-num');
                                            couponNum.style.visibility = 'visible';
                                        };
                                        show();
                                        console.log(response);
                                        $scope.coupon=response.data[0].coupon_token;
                                    }
                                })
                                .error(function(response){

                                })
                        }
                    })
                    .error(function(res){
                        console.log(res);
                    })
            };

        }]);

    quanApp.directive('test',['$parse',function ($parse) {
        var dateFilter = $filter('date');
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                var url = window.location.search.split('?')[1];
                var telephone = url.split('&')[0].split('=')[1];
                var input = document.querySelector('.lg_phone');
                input.value =telephone;
                //更新模型
                $parse(attrs['ngModel']).assign(scope, input.value);
            }
        };
    }]);

})(angular);

