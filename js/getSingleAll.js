
$(document).ready(function () {
    var windowHeight = $(window).height() - 180;
    var table = $('#example').DataTable({
        // "dom": 'Rlfrtip',
        "ordering": false,
        "info": false,
        responsive: true,
        fixedHeader: true,
        paging: false,
        scrollY: windowHeight + 'px',
        scrollX: '100%',
        searching: false,
        // 这三句是到处按钮
        "dom": 'T<"toolbar"><"clear">lfrtip',
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
    new $.fn.dataTable.ColReorder(table);
    new $.fn.dataTable.FixedColumns(table);

    $('#hiddenToolbar').removeClass('hide');
})
