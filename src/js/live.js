
'use strict';

(function(angular) {

    angular.module('liveApp',['me-lazyload'])
        .controller('LiveController',['$scope','$interval','$http',function ($scope, $interval, $http) {

            var getLiveList ='http://116.62.37.194:8080/tztvapi/live/getLiveList?callback=JSON_CALLBACK&city=上海&page=1&pageSize=10&location=100,112';
            var getLiveUserList = 'http://116.62.37.194:8080/tztvapi/live/getLiveUserList?callback=JSON_CALLBACK';
            //请求主播头像
            $http.jsonp(getLiveUserList).success(function(res){
                console.log(res);
                $scope.head = res.data;

                //请求直播链接
                $scope.live = function(index) {
                    var id = $scope.head[index].user_id;
                    console.log(id);
                    var getLiveInfoByUid = 'http://116.62.37.194:8080/tztvapi/live/getLiveInfoByUid?callback=JSON_CALLBACK&user_id='+id;
                    console.log(getLiveInfoByUid);
                    $http.jsonp(getLiveInfoByUid).success(function(respons){
                            console.log(respons);
                            console.log(respons.data.live_rtmp_play_url);
                            window.location.href = respons.data.live_rtmp_play_url;
                        }).error(function (respons) {

                        });
                }

            }).error(function (res) {
                console.log(res);
            });

            //请求直播列表
            $http.jsonp(getLiveList).success(function(res){
                console.log(res);
                $scope.list = res.data;

                $scope.fun = function(index){
                    if(res.data[index].live_type==2){
                        window.location.href = res.data.live_rtmp_play_url;
                    }else if(res.data[index].live_type==1){
                        var qieHuan = 'http://116.62.37.194:8080/tztvapi/live/getHistory?callback=JSON_CALLBACK&live_id='+res.data[index].live_id+'&live_rtmp_play_url='+res.data[index].live_rtmp_play_url;
                        $http.jsonp(qieHuan).success(function(sth){
                                console.log(sth);
                                window.location.href = sth.data;
                            }).error(function(sth){

                            });
                    }
                }
            }).error(function (res) {
                console.log(res);
            });

        }]);

})(angular);

