 /**
         *  Since we know the min and max variables from the rangeSlider, we can now use
         *  this to construct the checked and unchecked arrays, but we need to also know types
         * @param minMax [min, max]
         * @param idx [i, idx]- position identifier to opbtained the column information [0] original idex [1] - adjusted
         * @param type  String - condition for non iteger filters
         * @param type  dom - location of ErrMsg element
         */
        var rangeSliderDataManager = function ( minMax, i, $errMsg ) {

            // Making sure the the ID is correct fot the column and zeroes, well they are just my zero string - bite me.
            var idx = me.sortedColumns[ i[ 1 ] ] ? i[ 1 ] : i[ 0 ], zeroes = '00000000', errorFree = true;

            // We check here against the actual column, and not the data set, this is why it is i[ 0 ]
            if ( !me.sortHeaders[ i[ 0 ] ].column.rangeSlider ) return false;

            var column = me.sortHeaders[ i[ 0 ] ].column,

            // dataSet of keys and arrays { '$120,300' : ['list,of,classes,to,filter']}
                dataSet = me.sortedColumns[ idx ],
                negative;

            var commaRegex = function ( x ) {
                var parts = x.toString().split(".");
                parts[ 0 ] = parts[ 0 ].replace( /\B(?=(\d{3})+(?!\d))/g, "," );
                return parts.join(".");
            };

            // Keyset gets us all of the keys in the nice array as string, so we are not done with it yet.
            var keySet = _.keys( dataSet ), firstKey = null, j = 0;

            // we need to have a reference to know what is the structure of this key, like $ or %
            while ( keySet[ j ] ) {
                firstKey = keySet[ j ];
                if ( firstKey ) break;
                j+=1;
            }

            // testing for variations, another alternative is to split it by symbol
            // TODO if you are extending this filtering mechanics, i highly recommend doing something about this. Its ugly.
            var isDecimal = function ( val ) { if ( val == 0 ) { return false; } var key = val || firstKey; return (''+key).search( /\./gi ) !== -1  ? true : false; },
                isDollar  = function () { return firstKey.search( /\$/gi ) !== -1  ? true : false; },
                isComma   = function ( val ) { var key = val || firstKey; return ( key.search( /\,/gi ) !== -1 || isDollar() )  ? true : false; },
                isDate    = function () { return firstKey.search( /\//gi ) !== -1  ? true : false; },
                isNegative   = function ( val ) { var key = val || firstKey; return ( ('' + key).search(/\(/gi) !== -1 || ('' + key).search(/\-/gi) !== -1 ) ? true : false; },
                isPercentage = function () { return firstKey.search( /\%/gi ) !== -1  ? true : false; };

            // Now we need to sort keySet, and to do that we need to turn that string array into numbers, this means removing special characters
            //sortedKeySet = Shar.Utils.insertionSort( Shar.Utils.dataTransformer( keySet, isDecimal(), isDollar(), isDate(), isPercentage(), isNegative, isComma() ) );
            var sortedKeySet = Shar.Utils.dataTransformer( keySet, isDecimal(), isDollar(), isDate(), isPercentage(), isNegative, isComma() ) ;

            // Configuring column for range sets
            column[ 'origSliderMinMax' ] =  column[ 'origSliderMinMax' ] || column[ 'minMax' ]; //[  sortedKeySet[ 0 ], sortedKeySet[ sortedKeySet.length -1 ] ];
            column[ 'sliderMinMax' ] = column[ 'minMax' ]; //[ sortedKeySet[ 0 ], sortedKeySet[ sortedKeySet.length -1 ] ];


            // mutatingData to original Data formater. We need to acess data by hash.
            var origRender = function ( data ) {
                return _.map( data, function ( val ) {
                    return  column.renderer(val);
                });
            };

            var transformIt = function ( val ) {
                var key = val;

                if ( isDate() ) {
                    if ( !isDecimal() && ('' + key).search( /\./gi ) !== -1) { key = parseFloat( key.split( '.' )[ 0 ] ); }
                    return Shar.Utils.dateRenderer ( new Date( +key ) );
                }

                if ( !isDecimal() && typeof key !== 'number' ) { key = key.split( '.' )[ 0 ]; }
                if ( !isDecimal( key ) && isDecimal() ) { key =  key + '.0'; }
                if ( isDecimal( key ) && isDecimal() && !isNaN( key ) ) {
                    var decLen = ( column.format ) ? column.format.split( '.' )[ 1 ].length : firstKey.split( '.' )[ 1 ].length,
                        keyLen = ( '' + key ).split( '.' )[ 1 ].length;
                    while ( decLen !== 0 && keyLen < decLen ) { key += '0'; decLen -= 1;}
                }
                if ( isDecimal() && column.format && !isNaN( key )) {
                    key = ( '' + key ).split( '.' );
                    var zeroLen = column.format.split( '.' )[ 1 ].length;

                    // the issue here is that we lose a 0 when we transform string to float, so to restore zeroes we need some slice magic
                    if ( key[ 1 ].length < zeroLen ) {
                        key = key[ 0 ] + '.' + key[ 1 ] +  zeroes.slice( 0, ( zeroLen - key[ 1 ].length ) ) ;
                    } else {
                        key = key.join('.');
                    }
                }

                if ( isComma() ) { key = commaRegex( key ); }
                if ( isDollar() ) { key = '$' + key; }
                if ( isPercentage() && !isNegative( key ) ) { key = key + '%'; }
                if ( isNegative ( key ) ) {
                    key = ( isPercentage() ) ? '(' + -1 * key + ')%' : ('(' + key).replace('-','') + ')' ;
                }
                return key;
            };

            // we need to match our integer to original string value of the firstKey
            var returnToOrigState = function ( val ) {
                return _.map( val, function ( v ) {
                    return transformIt( v );
                });
            };

            // Get data and find first obj
            var tempMinMaxOrig = returnToOrigState( minMax );
            var tempMinMax = null;

            // Sort minMax into formateed number so that we can do nice slicing, and formating on it
            if ( !isDate() ) {
                tempMinMax = Shar.Utils.dataTransformer( minMax, isDecimal(), isDollar(), isDate(), isPercentage(), isNegative, isComma( minMax[ 1 ] ) ) ;
            } else {
                tempMinMax = Shar.Utils.dataTransformer( minMax, isDecimal(), isDollar(), isDate(), isPercentage(), isNegative, isComma() ) ;
            }

            //console.log( 'tempMinMax ', tempMinMax, "column[ 'minMax' ]", column[ 'minMax' ], minMax );
            column[ 'minMax' ] =  tempMinMax;

            if ( me.pageSize ) {  return false; }

            //console.log('Tester', column['filterActive'], tempMinMax, minMax, column[ 'origSliderMinMax' ],'\n\n',me.sortedColumns, '\n\n',sortedKeySet);
            // if equal break - investage this in case you get unexpected errors in the messaging
            if ( !column[ 'filterActive' ] && tempMinMax[ 0 ] === column[ 'origSliderMinMax' ][ 0 ] && tempMinMax[ 1 ] === column[ 'origSliderMinMax' ][ 1 ] ) {
                return false;
            } else if ( column[ 'filterActive' ] && tempMinMax[ 0 ] === column[ 'sliderMinMax' ][ 0 ] && tempMinMax[ 1 ] === column[ 'sliderMinMax' ][ 1 ] ) {
                return false;
            }

            var checkedSet = _.filter( sortedKeySet, function ( value ) {
                return tempMinMax[ 0 ] <= value && tempMinMax[ 1 ] >= value;
            });

            var uncheckedSet = _.difference( sortedKeySet, checkedSet );

            // Convert back lists to their origincal state so that we can use them as kes to get lists
            var checkedSetOrig = returnToOrigState( checkedSet );
            var uncheckedSetOrig = returnToOrigState( uncheckedSet );

            var visibleRowArr = [], hiddenRowArr = [], tempvisibleRowArr = [];

            // Here we use the hash data architecture to extract the classes matching the value.
            hiddenRowArr = _.reduce( uncheckedSetOrig, function ( arr, val ) {
                return arr.concat( dataSet[ val ] );
            }, [] );

            if ( !me.aFilterActive ) {
                visibleRowArr = _.reduce( checkedSetOrig, function ( arr, val ) {
                    return dataSet[ val ] ? arr.concat( dataSet[ val ] ) : arr;
                }, [] );
            } else if ( me.aFilterActive ) {
                tempvisibleRowArr = _.reduce( checkedSetOrig, function ( arr, val ) {
                    return dataSet[ val ] ? arr.concat( dataSet[ val ] ) : arr;
                }, [] );
            }

            if ( tempvisibleRowArr.length > 0  && me.aFilterActive ) {

                // extracting the difference between current and previous checked list
                hiddenRowArr = _.uniq ( hiddenRowArr.concat ( _.difference ( visibleRowArr, tempvisibleRowArr ) )).sort();
                visibleRowArr   = _.difference ( tempvisibleRowArr, hiddenRowArr );
            }

            //Messaging mechanic, may want to turn this into method
            var errMsg = function () {
                $errMsg.dom.innerHTML = 'Selected range is empty!'
                var timeOut = setTimeout( function () {
                    $errMsg.dom.innerHTML = '';
                    clearTimeout( timeOut );
                }, 2500 );
                return false;
            };


            //console.log('!!tempMinMax',tempMinMax, "column[ 'origSliderMinMax' ]",column[ 'origSliderMinMax' ], '\n', visibleRowArr.length);
            // simple solution for showing the err, before it was over complicated - not sure why, but this is mad simple
            if ( tempMinMax[ 0 ] !== column[ 'origSliderMinMax' ][ 0 ] || tempMinMax[ 1 ] !== column[ 'origSliderMinMax' ][ 1 ]  ) {
                if ( visibleRowArr.length === 0 ) {
                    errorFree =  errMsg();
                }
            }

            me.visibleRowArr = visibleRowArr;
            me.hiddenRowArr = hiddenRowArr;

            // based on this state we need to know should we filter the slider or not
            return errorFree;
        };
