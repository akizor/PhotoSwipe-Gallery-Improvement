let initPhotoSwipeFromDOM = function(gallerySelector) {
    let parseThumbnailElements = function() {
        let all = document.querySelectorAll(gallerySelector);
        let items = [];
            let figureEl,
                linkEl,
                size,
                item;
            for(let i = 0; i < all.length; i++) {
                figureEl = all[i];
                if(figureEl.nodeType !== 1) {
                    continue;
                }
                linkEl = figureEl.children[0];
                size = linkEl.getAttribute('data-size').split('x');
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10),
                    minZoom: 3
                };
                if(figureEl.children.length > 1) {
                    item.title = figureEl.children[1].innerHTML;
                }
                if(linkEl.children.length > 0) {
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl;
                items.push(item);
            }
        return items;
    };
    let closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };
    let onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
        let eTarget = e.target || e.srcElement;
        let clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });
        if(!clickedListItem) {
            return;
        }
        let clickedGallery = clickedListItem.parentNode,
            childNodes = document.querySelectorAll(gallerySelector),
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;
        for (let i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) {
                continue;
            }
            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }
        if(index >= 0) {
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };
    let photoswipeParseHash = function() {
        let hash = window.location.hash.substring(1),
            params = {};
        if(hash.length < 5) {
            return params;
        }
        let vars = hash.split('&');
        for (let i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            let pair = vars[i].split('=');
            if(pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }
        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }
        return params;
    };

    let openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        let pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;
        items = parseThumbnailElements(galleryElement);
        options = {
            maxSpreadZoom: 5,
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),
            getThumbBoundsFn: function(index) {
                let thumbnail = items[index].el.getElementsByTagName('img')[0],
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect();
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            },
            minZoom: 3
        };
        if(fromURL) {
            if(options.galleryPIDs) {
                for(let j = 0; j < items.length; j++) {
                    if(items[j].pid === index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }
        if( isNaN(options.index) ) {
            return;
        }
        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        return gallery.init();
    };
    let galleryElements = document.querySelectorAll( gallerySelector );
    for(let i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }
    let hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};
