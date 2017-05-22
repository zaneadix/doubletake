'use strict';

(function ($) {

    $(document).ready(function () {

        $(document).foundation( {
            reveal : {
                animation: 'fade',
            }
        });

        var vimeoUrl = 'http://vimeo.com/api/v2/video/',
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
            emailForm = $('#email_form'),
            scrollTargets = $('.scroll-target').toArray();

        var navTargets = {},
            videoData = $('#portfolio').attr('data-videos'),
            portfolioIndex = 0,
            portfolioBuffer = 6;

        if (videoData) {
            videoData = JSON.parse(videoData);
        } else {
            videoData = [];
        }
 
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
            videoDataChain(true);
        });

        function submitForm () {
            var name = emailForm.find('[name="name"]').val();
            var email = emailForm.find('[name="email"]').val();
            var phone = emailForm.find('[name="phone"]').val();
            var message = emailForm.find('[name="message"]').val();
            $.ajax({
                type: "POST",
                url: '/api/contact/enquiry',
                data: {
                    name: emailForm.find('[name="name"]').val(),
                    email: emailForm.find('[name="email"]').val(),
                    phone: emailForm.find('[name="phone"]').val(),
                    message: emailForm.find('[name="message"]').val()
                },
                dataType: 'application/json',
                complete: function (response) {
                    if (response.status == 200) {
                        emailForm.addClass('hide');
                        $('#contact .success-message').removeClass('hide'); 
                    }
                }
            });

        };

        emailForm.validate({
            submitHandler: submitForm
        });

        $('.down, .up').on('click', function () {
            scrollToSection(this);
        });

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

        var toggleLoadingVideos = function () {
            loadmore.toggleClass('loading');
            loadmore.prop('disabled', function (i, prop) { return !prop; });
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

        var createPortfolioItem = function (item) {
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
                .attr('id', item.vimeoId)
                .attr('data-reveal-id', 'modal')
                .append(anchor)
                .append(caption)
                .on('click', function () {
                    setModalVideo(newPiece.attr('id'));
                    toggleScroll();
                });
            return newPiece;
        }

        var videoDataChain = function () {

            var max = (portfolioIndex + portfolioBuffer);
            max = (max > videoData.length) ? videoData.length : max;

            var container;
            var row;

            var requestVideoData = function () {
                var video = videoData[portfolioIndex];
                $.get(vimeoUrl + video.vimeoId + '.json', function (data) {
                    var entry = data[0];
                    video.description = entry.description;
                    video.mobile_url = entry.mobile_url;
                    video.image = entry.thumbnail_large;
                    video.vimeo_title = entry.title;
                    video.url = entry.url;
                }).then(function () {
                    var portfolioItem = createPortfolioItem(video);
                    if (!(portfolioIndex % 2)) {
                        row = $(document.createElement('div')).addClass('row');
                    } 
                    row.append(portfolioItem);
                    if ((portfolioIndex % 2) || portfolioIndex == max-1) {
                        console.log('appending Row');
                        container.append(row)
                    }
                    portfolioIndex++;
                    if (portfolioIndex < max) {
                        requestVideoData();
                    } else {
                        console.log('rendering container');
                        portfolio.append(container);
                        setTimeout(function () {
                            container.addClass('open');
                        },100)
                        toggleLoadingVideos();
                    }
                });
            }

            if (portfolioIndex < max) {
                toggleLoadingVideos();
                container = $(document.createElement('div')).addClass('video-container');
                requestVideoData();
            }
        }

        $('.team-member').on('click', function () {
            var $this = $(this);
            toggleScroll();
            setModalMember($this.find('.name').text(), $this.find('.info').text(), $this.find('.name').attr('shortname'));
        });

        $('.team-member img')
        .on('mouseover', function () {
            var $this = $(this);
            var src = $this.attr('src').split('.');
            var src = [src[0],'-anim.',src[1]].join('');
            $this.attr('src', src);
        }).on('mouseout', function () {
            var $this = $(this)
            var src = $this.attr('src').split('-anim');
            $this.attr('src', src[0]+src[1]);
        });


        $('.menu-toggle').on('click', function () {
            var isOpen = $(this).toggleClass('open').hasClass('open');
            var nav = $('.nav');
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
        videoDataChain();
    });

})(jQuery)