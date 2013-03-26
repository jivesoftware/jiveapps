( function( $ ) {

    $.jiveurl = function(relativepath) {
        var location = document.location.href;
        var index = location.indexOf("url=");
        location = location.substring(index + 4);
        index = location.indexOf("&");
        if (index >= 0) {
            location = location.substring(0, index);
        }
        location = unescape(location.replace(/\+/g, " "));
        index = location.lastIndexOf("/");
        if (index >= 0) {
            location = location.substring(0, index);
        }
        return location+"/"+relativepath;
    };

    $.jiveproxyurl = function(relativepath) {
        return gadgets.io.getProxyUrl($.jiveurl(relativepath));
    };

    $.jiveAbsoluteLink = function(relativePath) {
        var parentHost = opensocial.getEnvironment().jiveUrl;
        if (parentHost) {
            if (parentHost.substr(parentHost.length - 1) === '/') {
                parentHost = parentHost.substring(0, parentHost.length - 1);
            }
            if (relativePath.indexOf('/') !== 0) {
                relativePath = '/' + relativePath;
            }
            return parentHost + relativePath;
        }
        return relativePath;
    };

}( jQuery ) );