// 获取 url 里的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

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
    $('#Tcode').val(TcodeVal.substring(2))
    getSinaBaseDataAndShow(TcodeVal)
}

// 改变下 Tcode 形式
function getTcodeAndTransform() {
    var TcodeVal = $('#Tcode').val();
    if (TcodeVal.charAt(0) === 6) {
        TcodeVal = 'sh' + TcodeVal;
    } else {
        TcodeVal = 'sz' + TcodeVal;
    }
    window.Tcode = TcodeVal;
}

// 通过 Tcode来获取新浪的数据和 k线图
function getSinaBaseDataAndShow(Tcode) {
    var Tcode = Tcode;
    // 从新浪获取数据和 K线图
    $.ajax({
        cache: true,
        url: "http://hq.sinajs.cn/list=" + Tcode,
        type: "GET",
        async: false,
        dataType: "script",
        success: function() {
            var tempStr = 'hq_str_' + Tcode;
            var TcodeArr = window[tempStr].split(",");
            $('#stockName').text(TcodeArr[0]); // 股票名
            $('#todayOpen').text(TcodeArr[1]); // 今日开盘价
            $('#yestodayClose').text(TcodeArr[2]); // 昨日收盘价
            // $('#nowPrice').text(TcodeArr[3]); // 当前价格
            if (TcodeArr[3] > TcodeArr[2]) {
                $('#nowPrice').addClass('text-danger').html(TcodeArr[3] + '<span class="glyphicon glyphicon-arrow-up" style="font-size: 20px"></span>')
            } else {
                $('#nowPrice').addClass('text-success').html(TcodeArr[3] + '<span class="glyphicon glyphicon-arrow-down" style="font-size: 20px"></span>')
            }

            $('#stockId').text(Tcode);
            $('#highestPrice').text(TcodeArr[4]); // 今日最高价
            $('#lowestPrice').text(TcodeArr[5]); // 今日最低价
            $('#volume').text((TcodeArr[8] / 1000000).toFixed(2) + ' 万手'); // 成交量
            $('#amount').text((TcodeArr[9] / 100000000).toFixed(2) + ' 亿元') // 成交金额

            // 计算涨幅和跌幅
            // var UpStop = (TcodeArr[2] * 1.1).toFixed(2);
            // $('#upStop').text(UpStop);
            // var downStop = (TcodeArr[2] * 0.9).toFixed(2);
            // $("#downStop").text(downStop);
            var sinaKStr = '<object type="application/x-shockwave-flash" data="http://finance.sina.com.cn/flash/cn.swf?" width="600" height="500" id="flash" style="visibility: visible;"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"><param name="flashvars" value="symbol=' + Tcode + '&amp;code=iddg64geja6fea4eafh9jbj7c5j4ie5d&amp;s=3"></object>'

            $('#sina-K-show').empty().html(sinaKStr)
        }
    });

    // 从后台获取主要财务指标数据，这个是固定了url了，实际要用URI获取host
    var mainSingleDataUrl = 'http://www.mituyun.com/AccountMgr/query_FetchDataKData.c?TCode=' + Tcode.substring(2);
    $.ajax({
        url: mainSingleDataUrl,
        dataType: 'jsonp',
        async: false,
        jsonpCallback: "jsonpcallback"
    })
    // 成功之后的操作
    .done(function(data) {
        if (data) {
            // 先把股票名和 id 给上
            var AR_COMPANY = data.AR_COMPANY[0];
            $('#stockName').text(AR_COMPANY.Tname);
            $("#stockId").text(AR_COMPANY.Tcode);

            var AR_FETCH_DATA = data.AR_FETCH_DATA;
            var tempArFetchData = [];
            var tempArr = [];
            var tempObj = {};
            $.each(AR_FETCH_DATA, function(index, val) {
                tempObj = {};
                tempObj.ReportDate = val.ReportDate;
                tempObj.PerShare = val.PerShare;
                tempArFetchData.push(tempObj);

                console.log(val.ReportDate + ' 年份 ' + val.ReportDate.substring(0, 4) + ' 月份 ' + val.ReportDate.substring(4) + ' 每股收益 ' + val.PerShare)
            });
            console.log(tempArFetchData)
        }
    })
    .fail(function() {
        $('#showError').append('<div class="alert alert-warning">没有该公司的资料</div>')
    })
}

// 点击查询新浪数据
$('#btn-companyInfo-search').click(function() {
    // 这里要处理一下 sz 和 sh 的问题
    // 6开头是 sh, 其他的 sz, Tcode 只有 6位的
    var TcodeVal = $('#Tcode').val();
    if (TcodeVal.charAt(0) === 6) {
        TcodeVal = 'sh' + TcodeVal;
    } else {
        TcodeVal = 'sz' + TcodeVal;
    }

    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        var newHref = URI(oldHref).removeSearch('Tcode').addSearch('Tcode', TcodeVal);
        $(this).attr('href', newHref)
    });

    getSinaBaseDataAndShow(TcodeVal);
});

// 这里给页面加个参数 Tcode 的值
var Tcode = getUrlParam('Tcode') || '';
if (Tcode !== '') {
    var Tcode = getUrlParam('Tcode') || '';
}

$("#Tcode").on('change', function() {
    var thisTcode = $(this).val();
    if (thisTcode.charAt(0) === 6) {
        thisTcode = 'sh' + thisTcode;
    } else {
        thisTcode = 'sz' + thisTcode;
    }

    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        var newHref = URI(oldHref).removeSearch('Tcode').addSearch('Tcode', thisTcode);
        $(this).attr('href', newHref)
    });
});
