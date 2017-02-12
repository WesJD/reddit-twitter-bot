'use strict';

module.exports = (validSites) => {

    function isValidSite(url) {
        for(const site of validSites) if(url.indexOf(site) > -1) return true;
        return false;
    }

    return {

        getImageState: (url) => {
            const rawImage = (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
            const validSite = (rawImage ? true : isValidSite(url));
            return {
                isRawImage: () => {
                    return rawImage;
                },
                isValidSite: () => {
                    return validSite;
                },
                isAcceptable: () => {
                    return validSite || rawImage;
                }
            }
        }

    }

};