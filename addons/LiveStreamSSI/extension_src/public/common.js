function getAddonURL() {
    var matches = window.location.href.match(/.*?[?&]url=([^&]+)%2F.*$/);
    if (matches.length == 2) {
        return decodeURIComponent(matches[1]);
    } else {
        showError('Could not parse addon URL from window location', window.location.href);
        return '';
    }
}

function getJiveURL() {
    var href = getAddonURL();
    return href.substring(0, href.indexOf('/resources/add-ons'));
}

function showError(error, extra) {
    extra = extra || '';
    osapi.jive.core.container.sendNotification(
        {
            "severity" : "error",
            "message": (i18n(error) || error) + extra
        }
    );
}

function showNotification(notice, extra) {
    extra = extra || '';
    osapi.jive.core.container.sendNotification(
        {
            "severity" : "info",
            "message": (i18n(notice) || notice) + extra
        }
    );
}

function extensionID() {
    return 'ba97eae7-ce08-fde1-a57f-9e4865038228';
}

function i18n(msg) {
    var prefs = new gadgets.Prefs();
    return prefs.getMsg(msg);
}

function randomString(len, chars) {
    var a = [];
    chars = chars || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var count = chars.length;
    for (var i = 0; i < len; i++) {
        a.push(chars.charAt(Math.floor(Math.random() * count)));
    }
    return a.join("");
}