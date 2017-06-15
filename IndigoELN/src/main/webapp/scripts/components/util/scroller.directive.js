angular.module('indigoeln')
    .directive('myTabScroller', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, iElement) {
                $timeout(function () {
                    var $element = $(iElement);
                    var create = function() {

                        $element.mCustomScrollbar({
                            axis: 'x',
                            theme: 'indigo',
                            scrollInertia: 100
                        });

                    }
                    create()
                    var onTabsChanged = scope.$watchCollection('tabs', function () {
                        $element.mCustomScrollbar("destroy"); 
                        create()
                    })
                    var onTabChanged = scope.$watch('activeTab', function () {
                        console.log(2)
                        $element.mCustomScrollbar('update');
                        $timeout(function () {
                            var l = $element.find('.active').position().left;
                            $element.mCustomScrollbar('scrollTo', l, {
                                scrollInertia: 300
                            });
                        }, 100);
                    })
                    scope.$on('$destroy', function () {
                        onTabChanged()
                        onTabsChanged()
                    })
                }, 0, false);
            }
        };
    })
    .directive('myScroller', function (EntitiesBrowser) {
        var scrollCache = {}
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                if (scope.myId && EntitiesBrowser.activeTab) {
                    var key = EntitiesBrowser.activeTab.$$title + scope.myId, val = scrollCache[key];
                    setTimeout(function() { 
                        $element.mCustomScrollbar('scrollTo', val || [0,0], { callbacks:false, scrollInertia : 0 })
                    }, 500)
                }
               
                var $element = $(iElement);
                $element.addClass('my-scroller-axis-' + iAttrs.myScroller);
                var prev = [];
                $element.mCustomScrollbar({
                    axis: iAttrs.myScroller,
                    theme: iAttrs.myScrollerTheme || 'indigo',
                    scrollInertia: 300, 
                    callbacks : {
                        onScroll : function(e) {
                            if (!key) return;
                            if (prev && prev[0] ==  this.mcs.top && prev[1] ==  this.mcs.left) return;
                            prev[0] =  this.mcs.top;
                            prev[1] =  this.mcs.left
                            scrollCache[key] = [this.mcs.top, this.mcs.left];
                            iElement.trigger('click') //// will close some popups EPMLSOPELN-437
                        }
                     }
                });
            }
        };
    }).directive('indelnScroll', function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var scrollToTop = function () {
                    var h = $(window).height();
                    $(document).mousemove(function(e) {
                        var mousePosition = e.pageY - $(window).scrollTop();
                        var topRegion = 220;
                        var bottomRegion = h - 220;
                        if(e.which == 1 && (mousePosition < topRegion || mousePosition > bottomRegion)){    // e.wich = 1 => click down !
                            var distance = e.clientY - h / 2;
                            distance = distance * 0.1; // <- velocity
                            $('#entities-content-id').scrollTop( distance + $(document).scrollTop()) ;
                        }else{
                            $('#entities-content-id').unbind('mousemove');
                        }
                    });
                };
               if(iAttrs.dragulaModel){
                   scope.$on(iAttrs.dragulaModel + '.drag', function(el, source) {
                       scrollToTop();
                   });
               }
            }
        };
    });