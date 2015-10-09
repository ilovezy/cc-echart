// 去后台获取数据绘制表格，现在改成用 iframe 链接到已经做好的表格上去
// function getMainSingleDataAndDraw(TcodeLong) {
//     if (TcodeLong) {
//         // console.log(TcodeLong)
//         // 先去获取 meta 数据
//         var mainSingleMetaUrl = 'http://www.mituyun.com/AccountMgr/list' + '/query_FetchDataKData.c?TCode=' + TcodeLong.substring(2) + '&_toolkit=meta';
//         $.ajax({
//             url: mainSingleMetaUrl,
//             dataType: 'jsonp',
//             async: false,
//             jsonpCallback: "jsonpcallback"
//         })
//         // 成功之后的操作
//         .done(function(data) {
//             console.log('meta success')
//             if (data) {
//                console.log(data)
//             }
//         })

//         获取具体数据
//         var mainSingleDataUrl = 'http://www.mituyun.com/AccountMgr/Library' + '/query_FetchDataKData.c?TCode=' + TcodeLong.substring(2);

//         $.ajax({
//             url: mainSingleDataUrl,
//             dataType: 'jsonp',
//             async: false,
//             jsonpCallback: "jsonpcallback"
//         })
//         // 成功之后的操作
//         .done(function(data) {
//             if (data) {
//                 // 先把股票名和 id 给上
//                 var AR_COMPANY = data.AR_COMPANY[0];
//                 $('#stockName').text(AR_COMPANY.Tname);
//                 $("#stockId").text(AR_COMPANY.Tcode);

//                 var AR_FETCH_DATA = data.AR_FETCH_DATA;
//                 console.log(AR_COMPANY)
//                 console.log(AR_FETCH_DATA)

//                 // 渲染表
//                 // $('#mainSingleTable').DataTable({
//                 //     data: [],
//                 //     columns: []
//                 // })
//             }
//         })
//         .fail(function () {
//             $('#showError').empty().append('<div class="alert alert-warning">没有该公司的资料</div>')
//         })
//     }
// }
