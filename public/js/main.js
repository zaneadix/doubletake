'use strict';

(function ($) {

    $(document).ready(function () {

        $(document).foundation( {
            reveal : {
                animation: 'fade',
            }
        });

        var videosUrl = 'https://spreadsheets.google.com/feeds/list/1ME1H40dkCZHZ4uNKFvd209KqtC4_MgKUcB66X2gnaB8/od6/public/basic?alt=json',
            vimeoUrl = 'http://vimeo.com/api/v2/video/',
            embedUrl = '//player.vimeo.com/video/';

        var body = $('body, html'),
            header = $('header'),
            nav = $('.nav'),
            logo = $('.logo'),
            $window = $(window),
            feature = $('#feature'),
            featureVideo = $('.videoWrapper iframe'),
            loadmore = $('#loadmore'),
            portfolio = $('.portfolio-pieces'),
            overlay = $('.reveal-modal-bg'),
            scrollTargets = $('.scroll-target').toArray();

        var navTargets = {},
            videoData = [],
            portfolioIndex = 0,
            portfolioBuffer = 6;

        header.find('a').toArray().forEach(function (a) {
            var a = $(a);
            navTargets[a.attr('scrollto')] = a;
        });

        header.find('a').on('click', function (event) {
            event.preventDefault();
            scrollToSection(this);
        });

        logo.addClass('fat');

        overlay.on('click', function () {
            toggleScroll();
            $('#modal').empty().css('background-color', '');
        });

        loadmore.on('click', function () {
            videoDataChain();
        });

        $('.down, .up').on('click', function () {
            scrollToSection(this);
        });

        $.get(videosUrl, function (data) {
            var entries = data.feed.entry;
            entries.forEach(function (entry) {
                var vid = {};
                vid.title = entry.title.$t
                vid.id = entry.content.$t.replace('_cokwr: ', '');
                videoData.push(vid);
            });
        }).done(function () {
            videoDataChain();
        });


        //Navigation

        var toggleScroll = function () {
            body.toggleClass('overlay-on');
        };

        var setModalVideo = function (videoId) {
            var flex = $('<div class="flex-video widescreen vimeo"></div>');
            var embed = $(document.createElement('iframe'))
                .attr('src', embedUrl+videoId)
                .attr('frameborder', 0);
            flex.append(embed);
            $('#modal').append(flex);
        };

        var setModalMember = function (name, info, imgSource) {
            $('#modal').append('<div class="filter"><h1>' + name + '</h1>' + '<p>' + info + '</p></div>')
                       .css('background-color', '#fff')
                       .css('background-image', 'url("../images/'+imgSource+'.gif")');
        };


        var scrollToSection = function (el) {
            var element = $(el)
            var scrollTo = element.attr('scrollto')
            body.animate({scrollTop: $('#'+scrollTo).offset().top - header.height()}, 1500);
        };

        $window.resize(function () {
            setFeatureHeight();
            checkMenuWidth();
        });

        $window.scroll(function () {

            var windowPos = $window.scrollTop();
            var windowHeight = $window.height();
            var hHeight = header.height();

            if (windowPos > 1) {
                logo.removeClass('fat');
            } else {
                logo.addClass('fat');
            }

            // if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight)
            //     console.log('bottom');
            //     $(navTargets[navTargets.length-1]).addClass 'current'
            // else
            scrollTargets.forEach(function (target) {
                var target = $(target);
                var top = target.offset().top - hHeight;
                var height = target.height();

                if ((windowPos >= top-2 && windowPos <= (top + height + hHeight + 35))){
                    navTargets[target.attr('id')].addClass('current');
                } else {
                    navTargets[target.attr('id')].removeClass('current');
                }
            });
        });



        var addPortfolioItem = function (item) {
            var image = $(document.createElement('img'))
                .addClass('piece')
                .attr('src', item.image);
            var anchor = $(document.createElement('a'))
                .attr('href', '#')
                .append(image);
            var caption = $(document.createElement('figcaption'))
                .text(item.title);
            var newPiece = $(document.createElement('figure'))
                .addClass('large-6 medium-6 small-12 columns')
                .attr('id', item.id)
                .attr('data-reveal-id', 'modal')
                .append(anchor)
                .append(caption)
                .on('click', function () {
                    setModalVideo(newPiece.attr('id'));
                    toggleScroll();
                });

            portfolio.append(newPiece);
        }


        var videoDataChain = function (max) {

            var max = max || (portfolioIndex + portfolioBuffer);

            if (portfolioIndex < max && portfolioIndex < videoData.length) {
                var video = videoData[portfolioIndex];
                $.get(vimeoUrl + video.id + '.json', function (data) {
                    var entry = data[0];
                    video.description = entry.description;
                    video.mobile_url = entry.mobile_url;
                    video.image = entry.thumbnail_large;
                    video.vimeo_title = entry.title;
                    video.url = entry.url;
                    addPortfolioItem(video);
                }).then(function () {
                    portfolioIndex++;
                    videoDataChain(max);
                });
            }
        };

        $('.team-member').on('click', function () {
            $this = $(this);
            toggleScroll();
            setModalMember($this.find('.name').text(), $this.find('.info').text(), $this.find('.name').attr('shortname'));
        });

        $('.team-member img')
        .on('mouseover', function () {
            $this = $(this);
            var src = $this.attr('src').split('.');
            src = [src[0],'-anim.',src[1]].join('');
            $this.attr('src', src);
        }).on('mouseout', function () {
            $this = $(this)
            src = $this.attr('src').split('-anim');
            $this.attr('src', src[0]+src[1]);
        });


        $('.menu-toggle').on('click', function () {
            isOpen = $(this).toggleClass('open').hasClass('open');
            nav = $('.nav');
            if(isOpen) {
                nav.slideDown(400, function () {
                    nav.addClass('open').removeClass('closed');
                });
            } else {
                nav.slideUp(400, function () {
                    nav.addClass('closed').removeClass('open');
                });
            }
        });

        var checkMenuWidth = function () {
            var nav = $('.nav');

            if (window.innerWidth > 720) {
                nav.css('display', 'block');
            } else {
                if (nav.hasClass('closed')) {
                    nav.css('display', 'none');
                }
            }
        }
            


        var setFeatureHeight = function () {
            var vidHeight = featureVideo.offset().top + featureVideo.height();
            var width = window.innerWidth;

            if (width <= 700) {
                feature.height(vidHeight + 40);
            } else if (width <= 800) {
                feature.height(vidHeight + 60);
            } else {
                feature.height(vidHeight + 80);
            }
        };


        setFeatureHeight();
    });

})(jQuery)