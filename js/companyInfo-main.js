// 获取 url 里的参数,如果有的话就执行对于的函数，顺便把菜单链接的 a的 href 加上 ?Tcode=******;
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

var url = window.location.href;
var TcodeVal = getUrlParam('Tcode');
if (TcodeVal) {
    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        if (URI(oldHref).search()) {
            oldHref = URI(oldHref).removeSearch('Tcode')
        }
        var newHref = oldHref + '?Tcode=' + TcodeVal;
        $(this) .attr('href', newHref);
    });
    $('#Tcode').val(TcodeVal.substring(2))
    getMainSingleDataAndDraw(TcodeVal);
}

// 这里要处理一下 sz 和 sh 的问题
// 6开头是 sh, 其他的 sz, Tcode 只有 6位的
function getTcodeAndTransform() {
    var TcodeVal = $('#Tcode').val();
     if (TcodeVal.charAt(0) === 6) {
        TcodeVal = 'sh' + TcodeVal;
    } else {
        TcodeVal = 'sz' + TcodeVal;
    }
    window.Tcode = TcodeVal;
}

$('#btn-companyInfo-search').click(function () {
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

    getMainSingleDataAndDraw(TcodeVal);
});

function getMainSingleDataAndDraw(TcodeLong) {
    if (TcodeLong) {
        // console.log(TcodeLong)
        // 先去获取 meta 数据
        // var mainSingleMetaUrl = 'http://www.mituyun.com/AccountMgr/list' + '/query_FetchDataKData.c?TCode=' + TcodeLong.substring(2) + '&_toolkit=meta';
        // $.ajax({
        //     url: mainSingleMetaUrl,
        //     dataType: 'jsonp',
        //     async: false,
        //     jsonpCallback: "jsonpcallback"
        // })
        // // 成功之后的操作
        // .done(function(data) {
        //     console.log('meta success')
        //     if (data) {
        //        console.log(data)
        //     }
        // })

        // 获取具体数据
        // var mainSingleDataUrl = 'http://www.mituyun.com/AccountMgr/Library' + '/query_FetchDataKData.c?TCode=' + TcodeLong.substring(2);

        // $.ajax({
        //     url: mainSingleDataUrl,
        //     dataType: 'jsonp',
        //     async: false,
        //     jsonpCallback: "jsonpcallback"
        // })
        // // 成功之后的操作
        // .done(function(data) {
        //     if (data) {
        //         // 先把股票名和 id 给上
        //         var AR_COMPANY = data.AR_COMPANY[0];
        //         $('#stockName').text(AR_COMPANY.Tname);
        //         $("#stockId").text(AR_COMPANY.Tcode);

        //         var AR_FETCH_DATA = data.AR_FETCH_DATA;
        //         console.log(AR_COMPANY)
        //         console.log(AR_FETCH_DATA)

        //         // 渲染表
        //         // $('#mainSingleTable').DataTable({
        //         //     data: [],
        //         //     columns: []
        //         // })
        //     }
        // })
        // .fail(function () {
        //     $('#showError').empty().append('<div class="alert alert-warning">没有该公司的资料</div>')
        // })
    }
}

// Tcode改变时的操作
var Tcode = '';
$("#Tcode").on('change', function() {
    var thisTcode = $(this).val();

    if (thisTcode.charAt(0) === 6) {
        thisTcode = 'sh' + thisTcode;
    } else {
        thisTcode = 'sz' + thisTcode;
    }

    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        var newHref = URI(oldHref).removeSearch('Tcode').addSearch('Tcode', TcodeVal);
        $(this).attr('href', newHref)
    });

    var Tcode = getUrlParam('Tcode') || '';
    if (Tcode !== '') {
        var Tcode = getUrlParam('Tcode') || '';
    }
});
