'use strict';

module.exports = function(validSites) {

    function isValidSite(url) {
        for(const site of validSites) if(url.indexOf(site) > -1) return true;
        return false;
    }

    return {

        getImageState: function(url) {
            const rawImage = (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
            const validSite = (rawImage ? true : isValidSite(url));
            return {
                isRawImage: function() {
                    return rawImage;
                },
                isValidSite: function() {
                    return validSite;
                },
                isAcceptable: function() {
                    return validSite || rawImage;
                }
            }
        }

    }

};
