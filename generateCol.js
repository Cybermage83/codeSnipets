/**
     * Sort data into columns instead of rows for filter
     * @data converted data that is used for template
     */
    generateColumns : function ( data, column ) {
        var me = this, title, aa = [], temp = [], noExport = false, noPages = true;
        if ( me.page && me.page.pageCount === 1 || !me.page) {
            if ( data.length !== 0 && me.dataCt.sortedRecords.length !== 0 ) {
                data = data;
            } else {
                //data = me.convertAndFilterRecords( noExport, noPages, me.dataCt.filteredRecords ).data;
            }
        } else if ( me.page && me.page.pageCount > 1 && !me.aFilterActive ) {
            data = me.convertAndFilterRecords( noExport, noPages ).data;
        } else if ( me.aFilterActive) {
            if ( me.dataCt.filteredRecords.length > data.length && me.dataCt.filteredRecords.length > me.dataCt.sortedRecords.length
                 && me.dataCt.sortedRecords.length > data.length || ( me.dataCt.sortedRecords.length > me.dataCt.filteredRecords.length )) {
                data = me.convertAndFilterRecords( noExport, noPages, me.dataCt.sortedRecords ).data;
            } else {
                data = me.convertAndFilterRecords( noExport, noPages, me.dataCt.filteredRecords ).data;
            }
        }
        if ( me.dataCt.filteredRecords.length  < me.dataCt.sortedRecords.length ) {
            me.dataCt.filteredRecords = me.dataCt.sortedRecords;
        } else {
            me.origSortedRecord = me.dataCt.filteredRecords;
        }

       var columns = this.columns;

        // the active column that we passed through
        if ( column ) {
            _.forEach( data, function ( objData ) {
                var zz = {
                    'animCls' : objData.animCls,
                    'recRowIdx' : objData.recRowIdx,
                    'rowCls' : objData.rowCls,
                    'rowIdx' : objData.rowIdx,
                    'rowStyle' : objData.rowStyle
                };

                zz[ ''+column.idx ] = objData[ column.idx];
                temp.push( zz );
            });
            data = temp;
        }

        if ( !me.sortedColumns ) {
            me.sortedColumns = [];
            me.origSortedColumns = []
            for ( var z = 0; z < me.sortHeaders.length; z += 1 ) {
                me.sortedColumns.push( null );
                me.origSortedColumns.push( null );
            }
        }
        var min = null, max = null, tt, negative = null,
            stripData = function ( val ) {
                 if ( !column.ifDate ) {

                     //if ( val === 'Empty' || !val ) return 0;
                     negative = false;
                     if ( val.search(/\(/gi) !== -1 ) { negative = true; }

                     val = parseFloat(val.replace(/[^\d.-]/g, ''));

                     //val = type === 'percent' ? val / 100 : val;
                     return ( negative ) ? -val : val;

                 } else { return new Date(val).getTime(); }

            };

        //Sorting data to generate a data set for entire comlumn from rows
        _.map( data, function ( obj, idx ) {

            //Ext.Object.each( obj, function (   key, value  ) {
            // now you are asking why am i doning this?
            // A: Performance, I went from from 1-2sec on 14k data to 0.325 ms  - not bad.
            var keys = _.keys( obj );
            var values = _.values( obj );

            // Making sure that the we get the correct rows. but it causes error to show null values
            if ( obj.rowStyle !== 'display:none' ) {
                _.map(keys, function ( val, ind ) {
                    if ( !isNaN( + keys[ind] ) ) {

                        // isNaN on val makes sure that we don;t parse any extra data
                        if (typeof values[ind].title !== 'undefined' && !isNaN(+val) && typeof values[ ind ].v !== 'undefined'
                            && !columns[keys[ind]].virtual ) {

                            // To get rows and titles, forcing them into object hash keys, this was a solution before slider add.
                            //title = ( typeof value.title === 'undefined' ) ? 'Empty' : '' + value.title;
                            // This is a bug where a title may have text added, keep an eye on this for other grids

                            if ( columns[keys[ind]].rangeSlider && values[ ind ].v !== 'N/A' && typeof values[ ind ].v !== 'undefined') {

                                // we need to determine which to use, either v or title
                                if ( (columns[keys[ind]].ifInt && !columns[keys[ind]].ifMoney) || columns[keys[ind]].ifPercentage || columns[keys[ind]].ifDecimal ) {
                                    title = '' + values[ind].v;
                                } else {
                                    title = '' + values[ind].title;
                                }

                                tt = stripData( title );
                                min = ( !min ) ? tt : min < tt ? min : tt;
                                max = ( !max ) ? tt : max > tt ? max : tt;

                            } else {
                                title = '' + values[ind].title;
                            }
                            column[ 'minMax' ] = [ min, max ];

                            // i got tired of formating this, the auto styling in IntelliJ resets my correct style
                            aa[keys[ind]] = aa[keys[ind]] || {};
                            aa[keys[ind]][title] = aa[keys[ind]][title] || [];
                            aa[keys[ind]][title].push(obj['recRowIdx']);
                        }
                    }
                });
            }
        });

        // Issue with invisible columns
        //me.columnAdjustment = _.filter( aa, function (arr) { return typeof arr === 'undefined'; }).length
        //me.sortedColumnCache[ this.module ] = data;
        if ( column ) {

            aa = _.filter( aa , function ( arr ) { return (arr); });

            me.sortedColumns[ column.idx ] = aa[ 0 ];
            me.origSortedColumns[ column.idx ] = me.origSortedColumns || aa [ 0 ];
        } else {
            me.sortedColumns = aa;
            me.origSortedColumns = me.origSortedColumns || aa;
        }

        return aa;
    },
