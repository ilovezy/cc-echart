// cc-line-chart.js at 2015-8-20

this.src=this.src+'?time='+Math.random() // 给地址加一串随机数

function getDataAndDrawLine(drawDomId, titleText, Base, xData, yData) {
    // 这段对应单位
    var danwei = ''

    if (Base == 1) {
        danwei = "元"
    } else if (Base == 1000) {
        danwei = "千元"
    } else if (Base == 10000) {
        danwei = "万元"
    } else if (Base == 1000000) {
        danwei = "百万元"
    }

    console.log(danwei)

    require.config({
        paths: {
            echarts: 'echarts-2.2.7/build/dist/'
        }
    });
    require(['echarts', 'echarts/chart/line', 'echarts/chart/bar'], function(ec) {
        var option = {
            // 左上角的标题
            title: {
                text: titleText + '(单位：'+ danwei +')',
            },

            // 水泡提示框
            tooltip: {
                trigger: 'axis'
            },

            // 居中的标题
            legend: {
                data: [titleText]
            },

            //  右上角的工具栏
            toolbox: {
                show: true,
                feature: {
                    dataZoom: { // 区域缩放
                        show: true
                    },
                    dataView: { // 数据视图
                        show: true,
                        readOnly: false
                    },
                    magicType: { // 图表切换
                        show: true,
                        type: ['line', 'bar']
                    },
                    restore: { // 还原最开始
                        show: true
                    },
                    saveAsImage: { // 保存为图片
                        show: true
                    }
                }
            },

            calculable: true,

            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisTick: {
                    onGap: false
                },
                data: xData //这里就是横坐标日期
            }],

            yAxis: [{
                type: 'value'
            }],

            // series是显示多条数据的时候就可以用数组里包含多个对象即可
            series: [{
                name: titleText,
                type: 'line',
                // smooth: true, // 加了这两个就有填充效果了日
                // itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: yData // 这里是对应的y坐标值，即具体数据
           }]
        }
        var myChart = ec.init(document.getElementById(drawDomId), 'macarons')
        myChart.setOption(option)
    })
}
