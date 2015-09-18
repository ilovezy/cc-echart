// cc at 2015-8-19
// 从后台获取数据，且绘制k线图

function getDataAndDrawK(baseUrl, CompanyId, drawDomId, QueryString) {

    $.ajax({
            url: baseUrl + CompanyId + (QueryString || ''),
            dataType: 'jsonp',
            jsonpCallback: "jsonpcallback",
        })
        .done(function(data) {
            var AR_COMPANY = data.AR_COMPANY[0],
                ArDailyExchange = data.AR_DAILY_EXCHANGE

            var kData = {
                FullName: AR_COMPANY.FullName,
                Tcode: AR_COMPANY.Tcode,
                Tname: AR_COMPANY.Tname,
                companyDate: [],
                priceData: [],
                BeginDate: AR_COMPANY.BeginDate,
                EndDate: AR_COMPANY.EndDate
            }
            $('title').text(kData.Tname)
            $('#FullName').text(kData.Tname + ' ' + kData.Tcode)
            $('#beginDate').val(kData.BeginDate.substring(0, 10))
            $("#endDate").val(kData.EndDate.substring(0, 10))

            // 遍历数组, 还是用 $.each 吧， IE 下不至于报错这么蛋疼

            // for (item in ArDailyExchange) {
            //     // 日期是倒着过来的，所以从头部推入数组
            //     kData.companyDate.unshift(ArDailyExchange[item].ExchangeDate.substring(0, 10));
            //         // 到这里已经获取了需要的日期数组了，接下来就是早晚高低收盘数据咯

            //     var tempArray = [];
            //     tempArray.push(
            //         ArDailyExchange[item].OpeningPrice,
            //         ArDailyExchange[item].ClosePrice,
            //         ArDailyExchange[item].LowPrice,
            //         ArDailyExchange[item].HighPrice
            //     );
            //     kData.priceData.push(tempArray);
            // }
            $.each(ArDailyExchange, function(index, el) {
                var thisItem = ArDailyExchange[index];
                kData.companyDate.unshift(thisItem.ExchangeDate.substring(0, 10));
                // 到这里已经获取了需要的日期数组了，接下来就是早晚高低收盘数据咯

                var tempArray = [];
                tempArray.push(
                    thisItem.OpeningPrice,
                    thisItem.ClosePrice,
                    thisItem.LowPrice,
                    thisItem.HighPrice
                );
                kData.priceData.push(tempArray);
            });


            // 需要的数据已经存在 kData 对象里了
            require.config({
                paths: {
                    echarts: 'echarts-2.2.7/build/dist/'
                }
            });
            require(['echarts', 'echarts/chart/k'], function(ec) {
                var option = {
                    // 左上角的标题
                    title: {
                        text: kData.FullName
                    },
                    // 水泡提示框
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            var res = params[0].seriesName + ' ' + params[0].name;
                            res += '<br/>  开盘 : ' + params[0].value[0] + '  最高 : ' + params[0].value[3];
                            res += '<br/>  收盘 : ' + params[0].value[1] + '  最低 : ' + params[0].value[2];
                            return res;
                        },
                    },

                    // 居中的标题
                    legend: {
                        data: [kData.Tname]
                    },

                    //  右上角的工具栏
                    toolbox: {
                        show: true,
                        feature: {
                            mark: { // 像铅笔一样画辅助线
                                show: true
                            },
                            dataZoom: { // 区域缩放
                                show: true
                            },
                            restore: { // 还原最开始
                                show: true
                            },
                            saveAsImage: { // 保存为图片
                                show: true
                            }
                        }
                    },

                    // 图表下面的数据拖动区域条
                    dataZoom: {
                        show: true,
                        realtime: true,
                        // 这两个参数居然是百分比的
                        start: 0,
                        end: 100
                    },

                    xAxis: [{
                        type: 'category',
                        boundaryGap: true,
                        axisTick: {
                            onGap: false
                        },
                        // 竖着的分割线, 最好设为 false
                        splitLine: {
                            show: false
                        },
                        // 日期，x轴的坐标
                        data: kData.companyDate
                    }],

                    yAxis: [{
                        type: 'value',
                        scale: true,
                        boundaryGap: [0.01, 0.01]
                    }],

                    series: [{
                        name: kData.Tname,
                        type: 'k',
                        data: kData.priceData
                    }]
                };

                var myChart = ec.init(document.getElementById(drawDomId), 'default')
                myChart.setOption(option)
            })
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });

}
