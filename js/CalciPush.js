// 设置日期默认为当天
// var today = new Date();
// thisYear = today.getFullYear();
// thisMonth = addZero(today.getMonth() + 1); // js存月份的时候按数组来存的
// thisDay = addZero(today.getDate());

// function addZero(num) {
//     if (num < 10) {
//         num = '0' + num;
//     }
//     return num;
// }
// Today = thisYear + '-' + thisMonth + '-' + thisDay;
// $('#StartDate').val(Today);

var DayOptionStr = '';
var $Day = $('#Day');

function setDayOption() {
    var TypeVal = $('#Type').val()
    if (TypeVal == 'Month') {
        DayOptionStr = '';
        for (var i = 1; i <= 30; i++) {
            DayOptionStr += '<option>' + i + '</option>'
        }
        $Day.html(DayOptionStr)
    } else if (TypeVal == 'Week') {
        DayOptionStr = '';
        for (var i = 1; i <= 5; i++) {
            DayOptionStr += '<option>' + i + '</option>'
        }
        $Day.html(DayOptionStr)
    }
}

setDayOption();
$('#Type').change(setDayOption);

// 刚开始处理一下传递的json, 这里处理日期插件
$("#StartDate").datetimepicker({
    'minView': 2,
    autoclose: true,
    format: 'yyyy-mm-dd'
});

$("#EndDate").datetimepicker({
    'minView': 2,
    autoclose: true,
    format: 'yyyy-mm-dd'
});

// 后台地址： ../Library/WebInsertXmlPage.tkx?Source=Query/CalciPush
$('#searchData').click(function(event) {
    $('form input').trigger('blur')
    $('#loadingAnimate').fadeIn(1000)

    event = window.event || event;
    event.preventDefault();

    var formData = $("form").serializeArray();
    var formDataArr = [];

    $.each(formData, function(index, val) {
        formDataArr.push(formData[index].value);
    });

    var toBackJson = {
        iPushCondition: {
            Tcode: '',
            StartDate: '',
            EndDate: '',
            Type: '',
            Day: '',
            Money: ''
        }
    };
    var tbAnasCondition = toBackJson.iPushCondition;
    tbAnasCondition.Tcode = formDataArr[0];
    tbAnasCondition.StartDate = formDataArr[1]
    tbAnasCondition.EndDate = formDataArr[2];
    tbAnasCondition.Type = formDataArr[3];
    tbAnasCondition.Day = formDataArr[4];
    tbAnasCondition.Money = formDataArr[5];

    toBackJson = JSON.stringify(toBackJson);
    // console.log(toBackJson) //已经出来了需要的字符串

    // 调用 ajax先去触发一下后台，让后台产生数据
    var backEndUrl = '../Library/WebInsertXmlPage.tkx?Source=Query/CalciPush'; // 后台地址
    // var backEndUrl = 'http://localhost/Account/Library/WebInsertXmlPage.tkx?Source=Query/CalciPush'; // 后台地址
    $.ajax({
        url: backEndUrl,
        type: 'POST',
        data: toBackJson,
        cache: false,
        success: function() {
            // 这里最后就可以调用 getAllDataAndDrawTable 来获取两个jsonp数据并绘制表格了
            getAllDataAndDrawTable();
        }
    });
});

function getAllDataAndDrawTable() {
    // 这里取消一下全局的 ajax缓存，防止 IE 的巨坑
    $.ajaxSetup({
        cache: false
    });

    // 这里设置一个全局变量，判断是否获取了meta
    var alreadyGetMeta = true;
    var allDataUrl = '../Library/WebListXmlPage.tkx?Source=Query/CalciPush';
    // var allDataUrl = 'http://localhost/Account/Library/WebListXmlPage.tkx?Source=Query/CalciPush';
    // 这个这里先写死的，注意改变后面的 &_toolkit=meta 和 &_toolkit=jsonp 就行
    var allData = {
        thData: [],
        tdData: []
    };
    allData.tdData = [];
    $.ajax({
        url: allDataUrl + '&_toolkit=meta', // 获取meta数据
        type: 'GET',
        cache: false,
        success: function(data) {
            if (data.Table) {
                var ListField = data.Table.List.Field;
                var tempObj;
                $.each(ListField, function(index, val) {
                    tempObj = {};
                    tempObj.DisplayName = ListField[index].DisplayName;
                    tempObj.NickName = ListField[index].NickName;
                    allData.thData.push(tempObj);
                });
            } else {
                alreadyGetMeta = false;
            }
        }
        // 第一个数据获取完了之后获取第二个具体数据
    }).done(function() {
        $('#loadingAnimate').fadeOut(1000);
        // 这里用全局的 alreadyGetMeta来判断是否获取到了 meta
        if (alreadyGetMeta) {
            $.ajax({
                url: allDataUrl + '&_toolkit=jsonp',
                type: 'GET',
                cache: false
            })
            .done(function(newData) {
                if (newData && newData.PushData) {
                    var PushData = newData.PushData;

                    // 先用来绘制 3线图
                    var lineChartData = {
                        ExchangeDateArr: [],
                        ClosePriceArr: [],
                        MySumArr: [],
                        MyTotalArr: []
                    };
                    $.each(PushData, function(index, val) {
                        lineChartData.ExchangeDateArr.push(val.ExchangeDate.substring(0, 10));
                        lineChartData.ClosePriceArr.push((+val.ClosePrice).toFixed(2));
                        lineChartData.MySumArr.push((+val.MySum).toFixed(2));
                        lineChartData.MyTotalArr.push((+val.MyTotal).toFixed(2));
                    });
                    // 到这里为止已经获取了所有需要的数据了
                    // 开始绘制 3线的 line 图，且必须在模态框出现后才能开始绘制，不然就不会有图像
                    $('#myModal').on('shown.bs.modal', function(e) {
                        require.config({
                            paths: {
                                echarts: 'echarts-2.2.7/build/dist/'
                            }
                        });
                        require(['echarts', 'echarts/chart/line'], function(ec) {
                                var myChart = ec.init(document.getElementById('threeLineChart'), 'macarons');

                                var option = {
                                    title: {
                                        text: '定值模拟计算',
                                        x: 'center'
                                    },
                                    tooltip: {
                                        trigger: 'axis',
                                        formatter: function(params) {
                                            return params[0].name + '<br/>' + params[0].seriesName + ' : ' + params[0].value + ' (元)<br/>' + params[1].seriesName + ' : ' + params[1].value + ' (元)<br/>' + params[2].seriesName + ' : ' + params[2].value + ' (元)';
                                        }
                                    },
                                    legend: {
                                        data: ['价格', '净值', '本金'],
                                        x: 'left'
                                    },
                                    toolbox: {
                                        show: true,
                                        feature: {
                                            mark: {
                                                show: true
                                            },
                                            dataView: {
                                                show: true,
                                                readOnly: false
                                            },
                                            restore: {
                                                show: true
                                            },
                                            saveAsImage: {
                                                show: true
                                            }
                                        }
                                    },
                                    dataZoom: {
                                        show: true,
                                        realtime: true,
                                        start: 0,
                                        end: 100
                                    },
                                    xAxis: [{
                                        type: 'category',
                                        boundaryGap: false,
                                        axisLine: {
                                            onZero: false
                                        },
                                        data: lineChartData.ExchangeDateArr
                                    }],
                                    yAxis: [{
                                        name: '净值和本金（元）',
                                        type: 'value'
                                    }, {
                                        name: '价格(元)',
                                        type: 'value'
                                    }],
                                    series: [{
                                        name: '价格',
                                        type: 'line',
                                        yAxisIndex: 1,
                                        data: lineChartData.ClosePriceArr
                                    }, {
                                        name: '净值',
                                        type: 'line',
                                        data: lineChartData.MySumArr
                                    }, {
                                        name: '本金',
                                        type: 'line',
                                        data: lineChartData.MyTotalArr
                                    }]
                                };

                                myChart.setOption(option)
                            })
                            // 绘制 line-chart结束
                    })

                    var tempArr;
                    var item, metaItem;
                    // console.log(allData.thData) //这是上一个 ajax获取来的 th数据，所有的 th 都是有的
                    // 在具体数据获取的时候，就按 属性名 去获取
                    $.each(PushData, function(index, val) {
                        tempArr = [];
                        tempArr.push(
                            val.ExchangeDate.substring(0, 10), (+val.ClosePrice).toFixed(2), (+val.MyAccount).toFixed(2), (+val.MySum).toFixed(2), (+val.MyTotal).toFixed(2), (+val.MyProfit).toFixed(2)
                        );
                        allData.tdData.push(tempArr)
                    });

                    // 再转化一下 columns 需要的格式,这部分已经完成了
                    var columnsData = [];
                    var tempObj = {};
                    $.each(allData.thData, function(index, val) {
                        tempObj = {};
                        tempObj.title = val.DisplayName || '';
                        tempObj.defaultContent = '';
                        columnsData.push(tempObj);
                    });

                    // console.log('columnsData is : ' + columnsData[0].title)
                    // 这里是处理 table 重新渲染报错的问题，解决方案 http://datatables.net/manual/tech-notes/3#destroy, 不太好用，换种方式
                    // 所有数据都齐全了开始绘制表格
                    var windowHeight = $(window).height() - 130;

                    $("#showTable").empty().append('<table id="ccTable" class="display table-nowrap table-bordered"></table>');
                    var ccTable = $('#ccTable').DataTable({
                        info: false,
                        paging: false,
                        searching: false,
                        scrollY: windowHeight + 'px',
                        columns: columnsData, // 这里需要有列的名字, 即 th的名字
                        data: allData.tdData,
                        dom: 'T<"clear">lfrtip',
                        tableTools: {
                            "aButtons": [{
                                "sExtends": "copy",
                                "sButtonText": "复制"
                            }, {
                                "sExtends": "xls",
                                "sButtonText": "导出"
                            }],
                            "sSwfPath": "../DataTables-1.10.7/extensions/TableTools/swf/copy_csv_xls.swf"
                        }
                    });

                    $('#showChartBtn').show()

                } else {
                    $('#showTable').empty().append('<div class="alert alert-warning" style="margin-top: 100px">请修改您的计算条件</div>');
                    $('#showChartBtn').hide();
                    $('#threeLineChart').empty();
                }
            })
        } else {
            $('#showTable').empty().append('<div class="alert alert-warning" style="margin-top: 100px">请修改您的计算条件</div>');
            $('#showChartBtn').hide();
            $('#threeLineChart').empty();
        }
    })
}
