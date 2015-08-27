/**
 * Reusable progress bar component
 * Can display several progresses on one bar. Can several display marks (points) on progess.
 *
 * Usage:
 * 1) Set up a progress bar.
 *      Instantiate a ProgressBar with the following options to start with:
 *          - startValue: the value for the most left point of a bar
 *          - endValue: the value for the most right point of a bar
 *
 *      You can use any range, ProgressBar component will automatically scale them to show in UI.
 *
 *      var myProgressBar = new ProgressBar({
 *          startValue: 0,
 *          endValue: 42
 *      });
 *
 *      At this point, if you render myProgressBar, it will be rendered as an empty block.
 *
 * 2) Add contents to progress bar. ProgressBar supports two types of content:
 *      2.1) Progress. Progress is a line between two given points with its own style.
 *           To add a progress to a Progress Bar, do the following:
 *
 *           myProgressBar.addProgress(0, 10, "blue");
 *
 *           You can add several progresses on the same bar:
 *
 *           myProgressBar.addProgress(10, 20, "yellow");
 *           myProgressBar.addProgress(20, 30, "red");
 *
 *           The third parameter - is a style of a progress. Style defines the colors, which are used for display
 *           See the supported list of styles in "progress-bar.less" file. (Add your own styles there)
 *
 *      2.2) Progress Mark. Progress Mark is a simple point on Progress Bar, its only characteristic is its value,
 *           which defines where on a Progress Bar this mark should be displayed:
 *
 *           myProgressBar.addMark(10);
 *           myProgressBar.addMark(20);
 *           myProgressBar.addMark(30);
 *
 * 3) Render a progress bar:
 *
 *          myProgressBar.render();
 *
 * 4) Append progress bar to any element in dom:
 *
 *          $(".myProgressBar").append(myProgressBar.el);
 *
 */
define(['backbone', 'underscore', 'jquery', "util/css/values"], function (Backbone, underscore, jQuery, cssValues) {
    "use strict";

    /**
     * @constructor
     * @class ProgressBar
     * @param {number} options.startValue
     * @param {number} options.endValue
     */
    var ProgressBar = Backbone.View.extend({
        className: "progressBar",
        initialize: function (options) {
            options = options || {};
            this.startValue = options.startValue || 0;
            this.endValue = options.endValue || 1;

            this.progressBars = [];
            this.progressMarks = [];
        },
        /**
         * Add progress element to a progressbar
         * @param {number} value
         * @param {String} className
         */
        addProgress: function (value, className) {
            this.progressBars.push({
                toValue: value,
                className: className
            });
        },
        /**
         * Add progress marl to a progressbar
         * @param {number} value
         */
        addMark: function (value) {
            this.progressMarks.push(value);
        },
        /**
         * Render progress bar element
         */
        render: function () {
            // create elements holder:
            var progressElementsHolder = jQuery("<div/>", {
                'class': 'progressElementsHolder'
            });

            // render progress bars:
            underscore.each(this.progressBars.reverse(), function (progressElement) {
                var width = Math.min(progressElement.toValue / (this.endValue - this.startValue) * 100, 100);
                progressElementsHolder.append(jQuery("<div/>", {
                    'class': 'progressElement ' + progressElement.className,
                    css: {
                        left: 0,
                        width: width + '%'
                    }
                }));
            }, this);

            // render progress marks:
            underscore.each(this.progressMarks.reverse(), function (progressMarkValue) {
                var left = Math.min((progressMarkValue - this.startValue) / (this.endValue - this.startValue) * 100, 100);
                progressElementsHolder.append(jQuery("<div/>", {
                    'class': 'progressMark',
                    css: {
                        left: left + '%'
                    }
                }));
            }, this);

            this.$el.append(progressElementsHolder);
            return this;
        },
        /**
         * For compatibility with Marionette
         */
        close: function () {
            this.remove();
        }
    });

    return ProgressBar;
});
