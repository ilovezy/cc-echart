// 工具栏的板块选项，jsonp获取
// 地址 Account/Library/WebModuleContentPage.tkx?Source=Accounting/PlateData

// 获取IndexId
var IndexIdUrl = '../Library/WebModuleContentPage.tkx?Source=Accounting/PlateData&Data=Index';
$.ajax({
        url: IndexIdUrl,
        dataType: 'jsonp',
        async: false,
        jsonpCallback: "jsonpcallback"
    })
    .done(function(data) {
        if ($.isArray(data.Index)) {
            var IndexIdArr = data.Index,
                IndexIdOptionsStr = '';

            $.each(IndexIdArr, function(index, val) {
                IndexIdOptionsStr += '<option value="' + IndexIdArr[index].IndexId + '">' + IndexIdArr[index].Name + '</option>';
            });
            $('#IndexId').append(IndexIdOptionsStr);
        }
    });

// var plateIdUrl = 'http://192.168.1.13/Account/Library/WebModuleContentPage.tkx?Source=Accounting/PlateData'
var plateIdUrl = '../Library/WebModuleContentPage.tkx?Source=Accounting/PlateData';
$.ajax({
        url: plateIdUrl,
        dataType: 'jsonp',
        async: false,
        jsonpCallback: "jsonpcallback"
    })
    .done(function(data) {
        if ($.isArray(data.Plate)) {
            var plateIdArr = data.Plate,
                PlateIdOptionsStr = '';

            $.each(plateIdArr, function(index, val) {
                PlateIdOptionsStr += '<option value="' + plateIdArr[index].PlateId + '">' + plateIdArr[index].Name + '</option>';
            });
            $('#PlateId').append(PlateIdOptionsStr);
        }
    });

// 工具栏的细分行业选项，jsonp获取
// 地址 /Library/WebListXmlPage.tkx?Source=Accounting/TradeData
var TradeUrl = '../Library/WebListXmlPage.tkx?Source=Accounting/TradeData';
$.ajax({
        url: TradeUrl,
        dataType: 'jsonp',
        async: false,
        jsonpCallback: "jsonpcallback"
    })
    .done(function(data) {
        if ($.isArray(data.CD_TRADE)) {
            var TradeArr = data.CD_TRADE,
                TradeOptionsStr = '';

            $.each(TradeArr, function(index, val) {
                TradeOptionsStr += '<option value="' + TradeArr[index].Value + '">' + (TradeArr[index].Value + ' - ' + TradeArr[index].Name) + '</option>';
            });
            $('#Trade').append(TradeOptionsStr);
        }
    })

// 设置 select的当前年倒退20年的option, 这里已经确定默认就是当前这一年了的
var thisYear = (new Date).getFullYear();
var optionsStr = '';
var optionVal;
for (var i = 0; i < 20; i++) {
    optionVal = thisYear - i;
    optionsStr += '<option value="' + optionVal + '">' + optionVal + '</option>';
}
$('#ReportDateYear').append(optionsStr);

// 这里处理一下报表时期，显示为每月的前一个季度
var today = new Date();
var year = today.getFullYear();
var month = today.getMonth() + 1;

var $ReportDateYear = $("#ReportDateYear")
var $ReportDateMonth = $("#ReportDateMonth")

if (month <= 3) { // 3月以内，年用去年，月用 12月
    var lastYear = year - 1;
    $ReportDateYear.children('option:selected').removeAttr('selected')
    $ReportDateYear.children('option[value=' + lastYear + ']').attr('selected', 'selected');
    $ReportDateMonth.children('option[value=12]').attr('selected', 'selected');

} else if (month > 3 && month <= 6) {
    $ReportDateYear.children('option[value=' + year + ']').attr('selected', 'selected');
    $ReportDateMonth.children('option[value=03]').attr('selected', 'selected');
} else if (month > 6 && month <= 9) {
    $ReportDateYear.children('option[value=' + year + ']').attr('selected', 'selected');
    $ReportDateMonth.children('option[value=06]').attr('selected', 'selected');
} else if (month > 9 && month <= 12) {
    $ReportDateYear.children('option[value=' + year + ']').attr('selected', 'selected');
    $ReportDateMonth.children('option[value="09"]').attr('selected', 'selected');
}

// 设置日期默认为当天
var today = new Date();
var thisYear = today.getFullYear();
var thisMonth = addZero(today.getMonth() + 1); // js存月份的时候按数组来存的
var thisDay = addZero(today.getDate());

function addZero(num) {
    if (num < 10) {
        num = '0' + num;
    }
    return num;
}
Today = thisYear + '-' + thisMonth + '-' + thisDay;
$('#PriceDate').val(Today);

// 刚开始处理一下传递的json, 这里处理日期插件
$("#PriceDate").datetimepicker({
    'minView': 2,
    autoclose: true,
    format: 'yyyy-mm-dd'
});

// 后台地址： ../Library/WebInsertXmlPage.tkx?Source=Query/AnalysisReport
$('#searchData').click(function(event) {
    $('#loadingAnimate').fadeIn(1000)

    event = window.event || event;
    event.preventDefault();

    var formData = $("form").serializeArray();
    var formDataArr = [];
    $.each(formData, function(index, val) {
        formDataArr.push(formData[index].value);
    });

    // 这里该声明查询语句了，需要的格式长这个样子.
    // {"AnalysisReportCondition":{"DetailTrade":"全国地产","PriceDate":"2015-09-02","ReportDate":"201503"}}
    var toBackJson = {
        AnalysisReportCondition: {
            IndexId: '',
            PlateId: '',
            Trade: '',
            DataType: '',
            DetailTrade: '',
            PriceDate: '',
            ReportDate: ''
        }
    };
    var tbAnasCondition = toBackJson.AnalysisReportCondition;
    tbAnasCondition.IndexId = formDataArr[0]
    tbAnasCondition.PlateId = formDataArr[1];
    tbAnasCondition.Trade = formDataArr[2];
    tbAnasCondition.DetailTrade = formDataArr[3];
    tbAnasCondition.PriceDate = formDataArr[4];
    tbAnasCondition.ReportDate = formDataArr[5] + formDataArr[6];
    tbAnasCondition.DataType = formDataArr[7];

    toBackJson = JSON.stringify(toBackJson);
    // 已经出来了需要的字符串

    // 调用 ajax先去触发一下后台，让后台产生数据
    var backEndUrl = '../Library/WebInsertXmlPage.tkx?Source=Query/AnalysisReport'; // 后台地址
    $.ajax({
        url: backEndUrl,
        type: 'POST',
        data: toBackJson,
        success: function() {
                // console.log('成功，开始绘制表格')
                // 这里最后就可以调用 getAllDataAndDrawTable 来获取两个jsonp数据并绘制表格了
                getAllDataAndDrawTable();
            }
            // fail: function() {
            //     // console.log('没有触发后台使后台产生数据')
            // }
    })
})

function getAllDataAndDrawTable() {
    // 这里设置一个全局变量，判断是否获取了meta
    // 这里取消一下全局的 ajax缓存，防止 IE 的巨坑
    $.ajaxSetup({
        cache: false
    })

    var alreadyGetMeta = true;
    var allDataUrl = '../Library/WebListXmlPage.tkx?Source=Query/AnalysisReport';
    // 这个这里先写死的，注意改变后面的 &_toolkit=meta 和 &_toolkit=jsonp 就行
    var allData = {
        thData: [],
        tdData: []
    };
    allData.tdData = [];
    $.ajax({
        url: allDataUrl + '&_toolkit=meta', // 获取meta数据
        type: 'GET',
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
                    type: 'GET'
                })
                .done(function(newData) {
                    // console.log(data);
                    var Company = newData.Company;
                    var tempArr;
                    var item, metaItem;
                    // var eachCompanyId;
                    var NickName;
                    // var needFixed = ['价格', '每股收益', '同比%', 'PCF' '每股净资产', '市盈率', '市净率', '市销率' '总市值', '流通市值', 'ROE%', '营业成本率%', '销售净利率%', '资产周转倍数', '资产净利率%', '权益乘数']
                    var needFixed = ['ClosePrice', 'PerShare', 'PctLR15', 'PCF', 'PerAsset', 'PeRatio', 'BookValue', 'PriceSalesRatio', 'TotalPrice', 'FreePrice', 'ROE', 'CostRate', 'ProfitRatio', 'TurnoverRatio', 'ProfitRate', 'EquityMultiplier'];
                    // console.log(allData.thData) 这是上一个 ajax获取来的 th数据，所有的 th 都是有的
                    // 在具体数据获取的时候，就按 属性名 去获取
                    for (item in Company) {
                        tempArr = [];
                        // eachCompanyId = Company[item].CompanyId;
                        eachTcode = Company[item].Tcode;
                        // 获取每个公司的 CompanyId，用来做链接的
                        for (metaItem in allData.thData) {
                            NickName = allData.thData[metaItem].NickName || '';
                            // var CompanyId = allData.thData[metaItem].CompanyId
                            // 这里包含的话就需要处理一下数据
                            if (needFixed.indexOf(NickName) > -1 && Company[item][NickName]) {
                                var tempVal = (+Company[item][NickName]);

                                if (NickName == 'PerShare') {
                                    tempArr.push(tempVal.toFixed(3));
                                } else if (NickName == 'PctLR15') { // 这里的 同比 % 需要红绿处理
                                    if (tempVal.toFixed(2) > 0) {
                                        tempArr.push('<span style="color:green">' + tempVal.toFixed(2) + '</span>')
                                    } else if (tempVal.toFixed(2) == 0) {
                                        tempArr.push(tempVal.toFixed(2));
                                    } else {
                                        tempArr.push('<span style="color:red">' + tempVal.toFixed(2) + '</span>')
                                    }
                                } else {
                                    tempArr.push(tempVal.toFixed(2));
                                }
                            } else {
                                tempArr.push(Company[item][NickName] || '');
                            }
                        }
                        // Library/WebDetailXmlPage.tkx?Source=Query/FetchData&CompanyId=202 地址在这里
                        // 这里第二个就是名称，给名称加链接
                        // var url = window.location.href;
                        // var aHref = url.substring(0, url.indexOf('cc-echart/'));

                        // 保证最后一项总计不加链接

                        if (eachTcode !== '999999') {
                            // tempArr[1] = '<a href="' + aHref + 'Library/WebDetailXmlPage.tkx?Source=Query/FetchData&CompanyId=' + eachCompanyId + '" target="_blank">' + tempArr[1] + '</a>';
                            tempArr[1] = '<a href="' + './companyInfo-base.html?Tcode=' + eachTcode + '" target="_blank">' + tempArr[1] + '</a>';
                        } else {
                            tempArr[1] = tempArr[1]
                        }

                        allData.tdData.push(tempArr);
                    }

                    // console.log(allData.tdData)

                    // alert(allData.tdData.length) // IE 兼容问题就在 allData.tdData这里，IE打开控制台后 length会变，不打开就不会变

                    // 再转化一下 columns 需要的格式,这部分已经完成了
                    var columnsData = [];
                    var tempObj = {};
                    $.each(allData.thData, function(index, val) {
                        tempObj = {};
                        tempObj.title = allData.thData[index].DisplayName || '';
                        tempObj.defaultContent = '';
                        columnsData.push(tempObj);
                    });
                    // console.log('columnsData is : ' + columnsData)
                    // 这里是处理 table 重新渲染报错的问题，解决方案 http://datatables.net/manual/tech-notes/3#destroy, 不太好用，换种方式
                    // 所有数据都齐全了开始绘制表格
                    var windowHeight = $(window).height() - 110;

                    $("#showTable").empty().append('<table id="ccTable" class="display table-nowrap"></table>');

                    // 测试 1.10.10版本
                    var ccTable = $('#ccTable').DataTable({
                        info: false,
                        paging: false,
                        searching: false,
                        scrollY: windowHeight + 'px',
                        // 头部一行固定
                        columns: columnsData, // 这里需要有列的名字, 即 th的名字
                        data: allData.tdData,

                        // 这两条确保横向滚动固定2列
                        fixedColumns: {
                            leftColumns: 2
                        },
                        scrollX: '100%',

                        //这两条确保有按钮出来
                        dom: 'Bfrtip',
                        // 需要按钮 复制和导出， 注意我在 css里写了
                        // .dt-buttons {   float: right!important; }
                        // buttons: ['copy', 'pdf'],
                        buttons: [{
                            extend: 'copy',
                            text: '复制'
                        }, {
                            extend: 'excel',
                            text: '导出'
                        }]
                    });


                    // 要不红绿色在这里搞得了, 这里直接用 red和green可以看得清楚一点，这个是可以的但是太死板了
                    $('#ccTable td').each(function() {
                        var thisVal = $(this).text();
                        if ($.isNumeric(thisVal)) {
                            if (+thisVal < 0) { // +thisVal是 js里字符串数字转数字的一种特殊写法而已
                                $(this).css('color', 'red'); // 如果数据小于0就显示红色,由于日期一定大于0所以不需要处理了
                            }
                        }
                    });

                    // // 接下来处理 同比%，同比% 的那一列，数据大于0就要显示为绿色
                    // $('#ccTable tr').each(function() {
                    //     $(this).children('td:eq(4)').each(function() {
                    //         var thisVal = $(this).text();
                    //         if ($.isNumeric(thisVal)) {
                    //             if (+thisVal > 0) {
                    //                 $(this).css('color', 'green')
                    //             }
                    //         }
                    //     })
                    // })
                })
        } else {
            $('#showTable').empty().append('<div class="alert alert-warning" style="margin-top: 100px">没有找到您输入的条件所对应的数据，请修改您的搜索条件</div>')
        }
    })
}

// 页面加载的时候就触发一次 click
// $('#searchData').trigger('click')
