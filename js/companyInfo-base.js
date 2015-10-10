// 获取 url 里的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

// 如果链接中存在 Tcode 就执行一次 getSinaBaseDataAndShow
var url = window.location.href
var TcodeVal = getUrlParam('Tcode')
if (TcodeVal) {
    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        if (URI(oldHref).search()) {
            oldHref = URI(oldHref).removeSearch('Tcode')
        }
        var newHref = oldHref + '?Tcode=' + TcodeVal;
        $(this).attr('href', newHref);
    });
    $('#Tcode').val(TcodeVal);
    getSinaBaseDataAndShow(TcodeVal);
}

// 通过 Tcode来获取新浪的数据和 k线图，注意给定的参数没有前缀的
function getSinaBaseDataAndShow(Tcode) {
    $("#showError").addClass('hide');
    $('#sinaData').addClass('hide');
    // 从新浪获取数据时这里要处理一下 sz 和 sh 的问题，6开头是 sh, 其他的 sz, Tcode 只有 6位的
    var SinaTcode = '';

    if (Tcode.charAt(0) === '6') {
        SinaTcode = 'sh' + Tcode;
    } else {
        SinaTcode = 'sz' + Tcode;
    }

    // 从新浪获取数据和 K线,注意新浪是一定有数据的
    $.ajax({
        cache: true, // 这里必须为 true 不能为false
        url: "http://hq.sinajs.cn/list=" + SinaTcode,
        type: "GET",
        async: false,
        dataType: "script",
        success: function() {
            var tempStr = 'hq_str_' + SinaTcode;
            if (window[tempStr] || window[tempStr] !== '') {

                var TcodeArr = window[tempStr].split(",");
                $('#sinaData').removeClass('hide'); // 先把头部显示
                $("#sina-K-show").removeClass('hide');
                $('#stockName').text(TcodeArr[0]); // 股票名
                $('#stockId').text(Tcode); // 股票id 不需要前缀

                // 今日开盘价为 0 的话 ，当前价格这里就显示停牌
                if (TcodeArr[1] == 0 || TcodeArr[1] == '' || !TcodeArr[1]) {
                    $("#todayOpen").text('--')
                    $('#nowPrice').addClass('text-danger').text('停牌')
                } else {
                    $('#todayOpen').text(TcodeArr[1]); // 今日开盘价
                    // $('#nowPrice').text(TcodeArr[3]); // 当前价格

                    var changeCount = (TcodeArr[3] - TcodeArr[2]).toFixed(2); // 变化量
                    var changeRate = ((changeCount / TcodeArr[2]) * 100).toFixed(2) + '%'; // 变化率

                    if (TcodeArr[3] >= TcodeArr[2]) {
                        $('#nowPrice').removeClass().addClass('text-danger').html(
                            TcodeArr[3] + '<span class="glyphicon glyphicon-arrow-up" style="font-size: 28px"></span>' + '<span style="overflow: hidden"><span style="font-size: 11px; position: absolute; top: -8px; padding-left: 3px">' + changeCount + '</span><span style="font-size: 11px"> +' + changeRate + '</span>'
                        )
                    } else {
                        $('#nowPrice').removeClass().addClass('text-success').html(
                            TcodeArr[3] + '<span class="glyphicon glyphicon-arrow-down" style="font-size: 28px"></span>' + '<span style="overflow: hidden"><span style="font-size: 11px; position: absolute; top: -8px; padding-left: 3px">' + changeCount + '</span><span style="font-size: 11px"> ' + changeRate + '</span>'
                        )
                    }
                }

                if (TcodeArr[2] == 0 || TcodeArr[2] == '' || !TcodeArr[2]) {
                    $("#yestodayClose").text('--')
                } else {
                    $('#yestodayClose').text(TcodeArr[2]); // 昨日收盘价
                }


                // 这里如果数据是 0 的话 就显示 --，类似新浪显示方法
                if (TcodeArr[4] == 0 || TcodeArr[4] == '' || !TcodeArr[4]) {
                    $('#highestPrice').text('--');
                } else {
                    $('#highestPrice').text(TcodeArr[4]); // 今日最高价
                }

                if (TcodeArr[5] == 0 || TcodeArr[5] == '' || !TcodeArr[5]) {
                    $("#lowestPrice").text('--');
                } else {
                    $('#lowestPrice').text(TcodeArr[5]); // 今日最低价
                }

                if (TcodeArr[8] == 0 || TcodeArr[8] == '' || !TcodeArr[8]) {
                    $("#volume").text('--')
                } else {
                    $('#volume').text((TcodeArr[8] / 1000000).toFixed(2) + ' 万手'); // 成交量
                }
                if (TcodeArr[9] == 0 || TcodeArr[9] == '' || !TcodeArr[9]) {
                    $("#amount").text('--')
                } else {
                    $('#amount').text((TcodeArr[9] / 100000000).toFixed(2) + ' 亿元') // 成交金额
                }

                // 用完就清空
                window[tempStr] = '';

                var sinaKStr = '<object type="application/x-shockwave-flash" data="http://finance.sina.com.cn/flash/cn.swf?" width="600" height="500" id="flash" style="visibility: visible;"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"><param name="flashvars" value="symbol=' + SinaTcode + '&amp;code=iddg64geja6fea4eafh9jbj7c5j4ie5d&amp;s=3"></object>'

                $('#sina-K-show').html(sinaKStr).removeClass('hide');
            } else {
                $("#sinaData").addClass('hide');
                $('#sina-K-show').empty().addClass('hide');
                // alert('新浪数据为空啊')
                $('#showAllError').empty().append('<div class="alert alert-danger">没有查询到该公司的每股收益数据,是不是你的股票代码输入有误啊</div>');
            }
        },
        fail: function() {
            $("#sinaData").addClass('hide');
            $('#sina-K-show').empty().addClass('hide');
            // alert('新浪数据为空啊')
            $('#showAllError').empty().append('<div class="alert alert-danger">没有查询到该公司的每股收益数据,是不是你的股票代码输入有误啊</div>');
        }
    });


    // 但是后台不一定有数据
    // 从后台获取主要财务指标数据，这个是固定了url了，实际要用URI获取host
    // var mainSingleDataUrl = 'http://localhost/AccountMgr/query_FetchDataKData.c?Tcode=' + Tcode.substring(2);
    var mainSingleDataUrl = '../query_FetchDataKData.c?Tcode=' + Tcode;
    $.ajax({
        url: mainSingleDataUrl,
        dataType: 'jsonp',
        async: false,
        cache: false,
        jsonpCallback: "jsonpcallback"
    })
    // 成功之后的操作
    .done(function(data) {
        if (data) {
            // 先把股票名和 id 给上
            var AR_COMPANY = data.AR_COMPANY[0];
            $('#stockName').text(AR_COMPANY.Tname);
            $("#stockId").text(Tcode); // 这里不用后台传来的 Tcode，后台的是简短版本的

            var AR_FETCH_DATA = data.AR_FETCH_DATA || [];
            var tempCollection = [];
            var uniqueYearArr = [];
            $.each(AR_FETCH_DATA, function(index, val) {
                var tempObj = {};
                var ReportDate = val.ReportDate;
                var year = ReportDate.substring(0, 4);
                tempObj.ReportDate = ReportDate;
                tempObj.year = year;
                tempObj.month = ReportDate.substring(4);
                tempObj.PerShare = val.PerShare;
                tempCollection.push(tempObj);
                if (uniqueYearArr.length == 0) {
                    uniqueYearArr.push(year)
                } else {
                    if (!($.inArray(year, uniqueYearArr) > -1)) {
                        uniqueYearArr.push(year)
                    }
                }
            });

            // 这里如果后台返回没有年数的话就不执行后面的了，不然由于ajax缓存问题会导致之前的每股利润还是存在
            if (uniqueYearArr.length > 0) {
                var finalEmptyArr = []
                for (var i = 0; i < uniqueYearArr.length; i++) {
                    var k = 3;
                    for (var j = 0; j < 4; j++) {
                        if (j < 3) {
                            finalEmptyArr.push((('' + uniqueYearArr[i]) + '0') + k)
                        } else {
                            finalEmptyArr.push(('' + uniqueYearArr[i]) + k)
                        }
                        k = k + 3;
                    }
                }

                // 获取了空的数组了，只有日期的,剩下的就是一一匹配了
                $.each(tempCollection, function(index, val) {
                    // console.log(val.ReportDate + val.PerShare)
                    var pos = $.inArray(val.ReportDate, finalEmptyArr);
                    if (pos > -1) {
                        finalEmptyArr[pos] = val.PerShare
                    }
                });

                // 这里做个弊，因为每股利率基本都不会大于1，而年数一般都在 1900以上了
                $.each(finalEmptyArr, function(index, val) {
                    if (val > 1000) {
                        finalEmptyArr[index] = ''
                    }
                })

                var finalArr = []
                for (var i = 0, count = 0, tempArr = []; i < finalEmptyArr.length; i++) {
                    if (count < 3) {
                        tempArr.push(finalEmptyArr[i])
                        count++
                    } else {
                        // 注意这里的超级大坑，如果 count等于四的时候，依然要把第四个放到 tempArr里面去的，不然每组总是会少一个元素的
                        tempArr.push(finalEmptyArr[i])
                        finalArr.push(tempArr)
                        count = 0
                        tempArr = []
                    }
                }

                var trStr = ''
                // 再把 uniqueYearArr 里的年数，放到对应的数组第一位中去
                for (var i = 0; i < finalArr.length; i++) {
                    finalArr[i].unshift(uniqueYearArr[i])
                }
                $.each(finalArr, function(index, PerShareArr) {
                    var tdStr = ''
                    $.each(PerShareArr, function(index, PerShare) {
                        if (PerShare !== '' && PerShare < 1000) {
                            tdStr += "<td>" + (+PerShare).toFixed(3) + '</td>'
                        } else {
                            tdStr += "<td>" + PerShare + '</td>'
                        }
                    });
                    trStr += '<tr>' + tdStr + '</tr>'
                });
                // 这里要先清空原有的数据
                $("#mainSingleTable").removeClass('hide');
                $('#mainSingleTable tbody').empty().append(trStr);
                $('#showPershareTable').removeClass('hide');
            } else {
                // alert('错误1, 没有 uniqueYearArr，即后台返回的数据没有需要的内容')
                $('#showError').removeClass('hide');
                $('#mainSingleTable tbody').empty();
                $('#mainSingleTable').addClass('hide');
                $('#showPershareTable').removeClass('hide');
            }
        }else {
            alert('错误2， 后台根本没有返回数据，路径错了还是咋的')
            $('#showError').removeClass('hide');
            $('#mainSingleTable tbody').empty();
            $('#mainSingleTable').addClass('hide');
            $('#showPershareTable').removeClass('hide');
        }
    })
    .fail(function() {
        // alert('错误3，直接的 ajax fail了')
        $('#showError').removeClass('hide');
        $('#mainSingleTable tbody').empty();
        $('#mainSingleTable').addClass('hide');
        $('#showPershareTable').removeClass('hide');
    })
}

// 点击查询新浪数据
$('#btn-companyInfo-search').click(function() {
    var newTcodeVal = $('#Tcode').val();

    if (newTcodeVal.length == 0) {
        $('#mainSingleTable tbody').empty();
        $('#mainSingleTable thead').hide();
    } else if(newTcodeVal.length !== 6) {
        alert('股票id长度不等于6了')
        $('#sinaData, #showPershareTable, #sina-K-show, #showAllError').addClass('hide')
        $('#showAllError').removeClass('hide');
    } else {
        $('#showAllError').addClass('hide');
        getSinaBaseDataAndShow(newTcodeVal);
    }
});

$("#Tcode").on('change', function() {
    var thisTcode = $(this).val();

    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        var newHref = URI(oldHref).removeSearch('Tcode').addSearch('Tcode', thisTcode);
        $(this).attr('href', newHref)
    });
});
