const blockIcon = '<div> 💣 </div>'
const hakai_mp4 = chrome.extension.getURL('hakai.mp4');
var DEBUGMODE = false;
var globalmenu = false;
var screen_name;
var debugging = function() {};
if (DEBUGMODE) debugging = console.log.bind(console, '%c %s', 'background: red; color: white', "Blocking: ");

$(document).ready(function() {
    $(document).on('DOMNodeInserted', injectBlockButtons);
    setTimeout(
        function() {
            globalmenu = true;
            $(document).find("main div[data-testid='caret']:first").trigger("click");
        }, 3000);
});

function injectBlockButtons(event) {
    var tweets = $(event.target).find('article')

    if (tweets.length) {
        tweets.each((index, element) => {
            checkingDom(element)
        })
    } else {
        checkingDom(event.target)
    }
}


function checkingDom(content) {
    if ($(content).html().includes('tweet')) {
        inject(content)
    }
}

function inject(target) {
    var tweet = $(target).closest('article');

    if (tweet.find('div[role="group"] div.blockicon').length) {
        return
    }

    var iconpos = tweet.find('div[role="group"] div:nth-child(3)'); //icon pos
    var icons = tweet.find('div[role="group"] div:nth-child(3)');
    icons.after(icons.clone());

    icons.attr('class', icons.prev().attr('class'));
    var dom = icons.next();
    var currentcolor = $("body").css("background-color");
    var iconcolor = "rgb(101, 119, 134)";
    if (currentcolor === 'rgb(0, 0, 0)') { // black background-color: rgb(0, 0, 0)
        iconcolor = "rgb(110, 118, 125)";
    } else if (currentcolor === 'rgb(16, 23, 30)' || currentcolor === 'rgb(21, 32, 43)') {
        iconcolor = "rgb(136, 153, 166)";
    } else { //white background-color: rgb(255, 255, 255)
        iconcolor = "rgb(101, 119, 134)";
    }
    customicon(dom, iconcolor);
}

function customicon(dom, iconcolor) {
    dom.children('div:first-child').addClass('blockicon');
    dom.children('div:first-child').attr('title', 'Block');
    dom.children('div:first-child').attr('data-testid', 'block');
    dom.children('div:first-child').attr('aria-label', 'Block');
    dom.find('svg').parent().html(blockIcon);
    dom.find('svg').parent().css({
        "color": iconcolor,
        "fill": "currentColor"
    });
    dom.find('svg').parent().prepend('<div id="blockhover" style="transition-duration: 0.2s;transition-property: background-color, box-shadow;color:' + iconcolor + ' ;fill: currentColor;top: 0px; right: 0px; left: 0px; bottom: 0px; display: inline-flex; position: absolute; margin-bottom: -8px ; margin-left: -8px; margin-right: -8px; margin-top: -8px; border-bottom-left-radius: 9999px; border-bottom-right-radius: 9999px; border-top-left-radius: 9999px; border-top-right-radius: 9999px;"></div>');
    dom.find('svg').parent().hover(function(e) {
        dom.find('#blockhover').css("background-color", e.type === "mouseenter" ? "rgba(224, 36, 94, 0.1)" : "rgba(0, 0, 0, 0)");
        dom.find('#blockhover').css("transition-property", e.type === "mouseenter" ? "background-color, box-shadow" : "none");
        dom.find('svg').css("color", e.type === "mouseenter" ? "rgb(224, 36, 94)" : iconcolor);
    })

    dom.children('div:first-child').find('div:nth-child(2)').css('display', 'none');
}

$(document).on('DOMNodeInserted', 'div[role="menu"]', function(event) {
    debugging(globalmenu);
    if (globalmenu) {
        $("div[role='menu']").hide();
        $("div[role='menu']").css('display', 'none');
        $("div[role='menu']").css('visibility', 'hidden');
        globalmenu = false;
    }
});

$(document).on('click', '.blockicon', function(event) {

    if ($(this).parents("#react-root").length > 0) {
        $(this).closest("article").find("div[data-testid='caret']").trigger("click");
        globalmenu = true;
        $("div[role='menu']").hide();
        $("div[role='menu']").css('display', 'none');
        $("div[role='menu']").css('visibility', 'hidden');
        debugging($("div[role='menu']").is(":hidden"));

        if ($("div[role='menu']").is(":hidden")) {
            if ($(document).find("div[data-testid='block']").length > 0 && $(document).find("div[data-testid='block']").is(":contains('Unblock')") == false) {
                screen_name = $(this).parent().parent().parent().parent().parent().find("a[role='link']").attr('href').replace("/", "");
                debugging(screen_name);
                $(document).find("div[role='menu']").find("div[data-testid='block']").trigger("click");
                $(document).find("div[data-testid='confirmationSheetConfirm']").trigger("click");
                $(document).find("div[data-testid='confirmationSheetCancel']").trigger("click");
                $(document).find("div[role='alertdialog']").hide();
                


                var hakai = $('<div id="hakai">');

var videoCSS = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9900; width: 80%; height: 80%; object-fit: cover;';
// var blockedTextCSS = 'position: fixed; top: 51%; left: 50%; transform: translate(-50%, -50%); font-size: 256px; color: black; background: linear-gradient(45deg, red, orange, yellow, green, blue, purple); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; z-index: 9999;';
hakai.append('<video autoplay style="' + videoCSS + '"> <source src="' + hakai_mp4 + '" type="video/mp4" controls autoplay> </video>');
hakai.appendTo($('body')).fadeIn(300).delay(1000).fadeOut(500);

                if (screen_name) {
                    message(screen_name, "has been removed.");
                }

            } else { // already blocked user
                screen_name = $(document).find("div[role='menu']").find("span:contains('Unblock @')").text();
                screen_name = screen_name.replace("Unblock @","");
                debugging(screen_name);
                message(screen_name, "already blocked.");
            }
        } //:hidden
    }
});

function message(screen_name, msg) {
    try {
        var message = $('<div  class="msg error-message" style="display: none;">');
        message.append('User <a  class="link" href="https://twitter.com/' + screen_name + '">@' + screen_name + '</a> ' + msg);
        message.appendTo($('body')).fadeIn(300).delay(3000).fadeOut(500);
    } catch (e) {
        debugging(e)
    }
}
