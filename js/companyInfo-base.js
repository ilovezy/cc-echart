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

$("#Tcode").on('change', function() {
    var thisTcode = $(this).val();

    $('#sidebarLinks').find('a').each(function(index, el) {
        var oldHref = $(this).attr('href');
        var newHref = URI(oldHref).removeSearch('Tcode').addSearch('Tcode', thisTcode);
        $(this).attr('href', newHref)
    });
});

// 区后台获取一个小的表格数据
function getCompanyInfoAndCalculate(Tcode, nowPrice) {
    $.ajax({
        url: '../accounting_platedata.c?Data=Company&Tcode=' + Tcode,
        dataType: 'jsonp',
        async: false,
        cache: false,
        jsonpCallback: "jsonpcallback"
    })
    // 成功之后的操作
    .done(function(data) {
        if(data.AR_COMPANY[0] && nowPrice) {
            if(nowPrice) {
                nowPrice = (+nowPrice);
            }

            var AR_COMPANY = data.AR_COMPANY[0];

            var LR15 = AR_COMPANY.LR15
            if(LR15 <= 0) {
                $("#PERatio").text('--');
            } else {
                $("#PERatio").text( ( nowPrice / (+LR15) ).toFixed(2) );
            }

            var ZC23 = AR_COMPANY.ZC23;
            if(ZC23 <= 0) {
                $("#PBRatio").text('--')
            } else {
                $("#PBRatio").text( ( nowPrice / (+ZC23) ).toFixed(2) )
            }

            var LR01 = AR_COMPANY.LR01;
            if(LR01 <= 0) {
                $("#PriceToSalesRatio").text('--')
            } else {
                $("#PriceToSalesRatio").text( ( nowPrice / (LR01) ).toFixed(2) )
            }

            if(AR_COMPANY.FreeStock) {
                $("#CirculationMarketValue").text( ( nowPrice * (+AR_COMPANY.FreeStock) ).toFixed(2) )
            } else {
                $("#CirculationMarketValue").text('--')
            }

            var TotalStock ;
            if(AR_COMPANY.TotalStock) {
                $("#TotalStock").text( ( nowPrice * (+AR_COMPANY.TotalStock) ).toFixed(2) )
            } else {
                $("#TotalStock").text('--')
            }

            $('#EPS').text((+AR_COMPANY.LR15).toFixed(3));
            $("#BookVal").text((+AR_COMPANY.ZC23).toFixed(3));
            $("#SalesPerShare").text((+AR_COMPANY.LR01).toFixed(3));
            $("#AreaName").text(AR_COMPANY.Area_Name);
            $("#DetailTrade").text(AR_COMPANY.DetailTrade);

        }
    });
}

// 通过 Tcode来获取新浪的数据和 k线图，注意给定的参数没有前缀的
function getSinaBaseDataAndShow(Tcode) {
    // 但是后台不一定有数据, 后台没有数据就不去从新浪获取数据了
    var BackEndHasData = false;
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
        // 因为后台即使没有返回数据也会返回一个页面的，需要先判断是否有数据
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
                        tempArr.push(finalEmptyArr[i]);
                        count++;
                    } else {
                        // 注意这里的超级大坑，如果 count等于四的时候，依然要把第四个放到 tempArr里面去的，不然每组总是会少一个元素的
                        tempArr.push(finalEmptyArr[i]);
                        finalArr.push(tempArr);
                        count = 0;
                        tempArr = [];
                    }
                }

                // 再把 uniqueYearArr 里的年数，放到对应的数组第一位中去
                for (var i = 0; i < finalArr.length; i++) {
                    finalArr[i].unshift(uniqueYearArr[i]);
                }

                // console.log(finalArr) 这里再处理一次，求出同比增长率
                var singleUpRateArr = []
                $.each(finalArr, function(index, val) {
                    var tempArr = [];
                    tempArr[0] = val[0];
                    $.each(val, function(monthIndex, thisYearMonthVal) {
                        if(monthIndex > 0) {
                            thisYearMonthVal = (+thisYearMonthVal)
                            if(thisYearMonthVal !== ''
                                && thisYearMonthVal !== 0
                                && finalArr[index+1]
                                && finalArr[index+1][monthIndex] !== ''
                                && +(finalArr[index+1][monthIndex]) !== 0) {

                                var lastYearMonthVal = finalArr[index+1][monthIndex]
                                var upRate = ((thisYearMonthVal - lastYearMonthVal) / lastYearMonthVal * 100).toFixed(1)
                                tempArr.push(upRate)
                            } else {
                                tempArr.push('');
                            }
                        }
                    });
                    singleUpRateArr.push(tempArr)
                });

                // 到这里为止已经获取了 finalArr和 singleUpRateArr了，根据需求需要做两个不同的表格, 一个是标准的，一个是累计的

                // 每股收益表格
                var singleTrStr = ''
                $.each(finalArr, function(index, PerShareArr) {
                    var tdStr = ''
                    var thisYearUpRateArr = singleUpRateArr[index]
                    $.each(PerShareArr, function(j, PerShare) {
                        if(j == 0) { // 第一列是年数就不用求了
                            tdStr += "<td>" + PerShare + '</td>'
                        } else if (PerShare !== '') {
                            var thisMonthUpRateArr = thisYearUpRateArr[j];
                            if(thisMonthUpRateArr !== '' && thisMonthUpRateArr > 0) {
                                tdStr += "<td>" + (+PerShare).toFixed(3) + '</td>' + '<td class="text-danger"><i>' + thisMonthUpRateArr + '%</i></td>';
                            } else if(thisMonthUpRateArr !== '' && thisMonthUpRateArr < 0) {
                                tdStr += "<td>" + (+PerShare).toFixed(3) + '</td>' + '<td class="text-success"><i>' + thisMonthUpRateArr + '%</i></td>';
                            } else {
                                tdStr += "<td>" + PerShare + '</td>' + '<td></td>';
                            }
                        } else {
                            tdStr += "<td>" + PerShare + '</td>' + '<td></td>';
                        }
                    });

                    singleTrStr += '<tr>' + tdStr + '</tr>'
                });
                $('#mainSingleTable tbody').empty().append(singleTrStr); // 先清空原有的数据

                // 累计收益表格，注意大坑 array是引用类型，所以需要重新赋值的
                var countArr = [];
                for (var i = 0, count = 0, tempArr = []; i < finalEmptyArr.length; i++) {
                    if (count < 3) {
                        tempArr.push(finalEmptyArr[i])
                        count++
                    } else {
                        tempArr.push(finalEmptyArr[i])
                        countArr.push(tempArr)
                        count = 0
                        tempArr = []
                    }
                }

                // 处理下这个 countArr
                $.each(countArr, function(index, item) {
                    // 这里的 icon做个标记，元素第一次为 ‘’ 的元素的位置
                    var icon;
                    $.each(item, function(index, val) {
                        if(val == '') {
                            icon = index
                        }
                    });

                    if(icon >= 0) {
                        // 把icon之后的都改成空
                        for(var i = icon; i < item.length; i++) {
                            item[icon] = ''
                            icon++
                        }
                    }

                    // 进行累加
                    $.each(item, function(index, val) {
                        if(val !== '' && index > 0) {
                            item[index] = (+item[index]) + (+item[index - 1])
                        }
                    });
                });

                // 再把 uniqueYearArr 里的年数，放到对应的数组第一位中去
                for (var i = 0; i < countArr.length; i++) {
                    countArr[i].unshift(uniqueYearArr[i])
                }

                // console.log(countArr) 这里再处理一次，求出同比增长率
                var countUpRateArr = []
                $.each(countArr, function(index, val) {
                    var tempArr = [];
                    tempArr[0] = val[0];
                    $.each(val, function(monthIndex, thisYearMonthVal) {
                        if(monthIndex > 0) {
                            thisYearMonthVal = (+thisYearMonthVal)
                            if(thisYearMonthVal !== ''
                                && thisYearMonthVal !== 0
                                && countArr[index+1]
                                && countArr[index+1][monthIndex] !== ''
                                && +(countArr[index+1][monthIndex]) !== 0) {

                                var lastYearMonthVal = countArr[index+1][monthIndex]
                                var upRate = ((thisYearMonthVal - lastYearMonthVal) / lastYearMonthVal * 100).toFixed(1)
                                tempArr.push(upRate)
                            } else {
                                tempArr.push('');
                            }
                        }
                    });
                    countUpRateArr.push(tempArr)
                });
                // 拼接字符串 countTrStr
                var countTrStr = ''
                $.each(countArr, function(index, PerShareArr) {
                    var tdStr = ''
                    var thisYearUpRateArr = countUpRateArr[index]
                    $.each(PerShareArr, function(j, PerShare) {
                        if(j == 0) {
                            tdStr += "<td>" + PerShare + '</td>'
                        } else if (PerShare !== '') {
                            var thisMonthUpRateArr = thisYearUpRateArr[j]
                            if(thisMonthUpRateArr !== '' && thisMonthUpRateArr > 0) {
                                tdStr += "<td>" + (+PerShare).toFixed(3) + '</td>' + '<td class="text-danger"><i>' + thisMonthUpRateArr + '%</i></td>';
                            } else if(thisMonthUpRateArr !== '' && thisMonthUpRateArr < 0) {
                                tdStr += "<td>" + (+PerShare).toFixed(3) + '</td>' + '<td class="text-success"><i>' + thisMonthUpRateArr + '%</i></td>';
                            } else {
                                tdStr += "<td>" + PerShare + '</td>' + '<td></td>';
                            }
                        } else {
                            tdStr += "<td>" + PerShare + '</td>' + '<td></td>';
                        }
                    });

                    countTrStr += '<tr>' + tdStr + '</tr>'
                });

                $('#mainCountTable tbody').empty().append(countTrStr); // 先清空原有的数据

                // 需要把table显示，因为默认是隐藏的
                $("#showPershareTable").removeClass('hide');

                // 后台已经返回了正确的数据，可以去查询新浪数据了
                BackEndHasData = true;
                // 从新浪获取数据时这里要处理一下 sz 和 sh 的问题，6开头是 sh, 其他的 sz, Tcode 只有 6位的
                if(BackEndHasData) {
                    var SinaTcode = '';

                    if (Tcode.charAt(0) == '6') {
                        SinaTcode = 'sh' + Tcode;
                    } else {
                        SinaTcode = 'sz' + Tcode;
                    }

                    // 601727  停牌了 返回值最后一位是 03, 600000 没停牌 最后一位是 00
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
                                // console.log(window[tempStr])
                                var TcodeArr = window[tempStr].split(",");
                                $('#sinaData').removeClass('hide'); // 先把头部显示
                                $("#sina-K-show").removeClass('hide');

                                $('#stockName').text(TcodeArr[0]); // 股票名
                                $('#stockId').text(Tcode); // 股票id 不需要前缀

                                // 这里需要做修改的等找到规律了的话
                                // 今日开盘价为 0 的话 ，当前价格这里就显示停牌
                                if (TcodeArr[1] == 0 || TcodeArr[1] == '' || !TcodeArr[1]) {
                                    $("#todayOpen").text('--')
                                    $('#nowPrice').addClass('text-danger').text('停牌')
                                } else {
                                    $('#todayOpen').text(TcodeArr[1]); // 今日开盘价

                                    var changeCount = (TcodeArr[3] - TcodeArr[2]).toFixed(2); // 变化量
                                    var changeRate = ((changeCount / TcodeArr[2]) * 100).toFixed(2) + '%'; // 变化率

                                    if (TcodeArr[3] >= TcodeArr[2]) {
                                        $('#nowPrice').removeClass().addClass('text-danger').html(
                                            TcodeArr[3] + '<span class="glyphicon glyphicon-arrow-up" style="font-size: 28px"></span>' + '<span style="overflow: hidden;font-size: 11px"><span style="position: absolute; top: -8px; padding-left: 3px"> +' + changeCount + '</span><span style=""> +' + changeRate + '</span>'
                                        )
                                    } else {
                                        $('#nowPrice').removeClass().addClass('text-success').html(
                                            TcodeArr[3] + '<span class="glyphicon glyphicon-arrow-down" style="font-size: 28px"></span>' + '<span style="overflow: hidden; font-size: 11px"><span style="position: absolute; top: -8px; padding-left: 3px">' + changeCount + '</span><span"> ' + changeRate + '</span>'
                                        )
                                    }
                                    var nowPrice = TcodeArr[3];
                                    // 去绘制那个小表格

                                    getCompanyInfoAndCalculate(Tcode, nowPrice);
                                    $("#showBackTable").removeClass('hide')
                                }

                                // 这里如果数据是 0 的话 就显示 --，类似新浪显示方法
                                if (TcodeArr[2] == 0 || TcodeArr[2] == '' || !TcodeArr[2]) {
                                    $("#yestodayClose").text('--')
                                } else {
                                    $('#yestodayClose').text(TcodeArr[2]); // 昨日收盘价
                                }

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
                                var sinaKStr = '<object type="application/x-shockwave-flash" data="http://finance.sina.com.cn/flash/cn.swf?" width="920" height="920" id="flash" style="visibility: visible;"><param name="allowFullScreen" value="true"><param name="allowScriptAccess" value="always"><param name="wmode" value="transparent"><param name="flashvars" value="symbol=' + SinaTcode + '&amp;code=iddg64geja6fea4eafh9jbj7c5j4ie5d&amp;s=3"></object>';

                                $('#sina-K-show').html(sinaKStr).removeClass('hide');
                            }
                        }
                    });
                }

            } else {
                $('#mainSingleTable tbody').empty();
                // alert('错误1, 没有 uniqueYearArr，即后台返回的数据没有需要的内容')
                showErrorMessage('没有找到该公司数据')
            }
        }else {
            // alert('错误2， 后台根本没有返回数据')
            showErrorMessage('没有找到该公司数据')
        }
    })
    .fail(function () {
        showErrorMessage('没有找到该公司数据')
    })
}

// 点击查询新浪数据, 每次点击的时候都把数据清空一次
$('#btn-companyInfo-search').click(function() {
    var newTcodeVal = $('#Tcode').val();

    // 清空所有已有的数据,不需要处理 sinaData的详细内容，因为后面有数据的话就会重新填充了
    $("#sinaData, #showPershareTable, #showBackTable, #sina-K-show").addClass('hide')
    $('#mainSingleTable tbody').empty()

    if (newTcodeVal.length == 0) {
        showErrorMessage('股票id长度不能为0')
    } else if(newTcodeVal.length !== 6) {
        showErrorMessage('股票id长度不等于6了')
    } else {
        $("#showErrorMessage").addClass('hide');
        getSinaBaseDataAndShow(newTcodeVal);
    }
});

function showErrorMessage (str) {
    $("#showErrorMessage").removeClass('hide').find('div').text(str)
}

