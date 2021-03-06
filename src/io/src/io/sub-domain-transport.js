/**
 * @ignore
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Event = require('event/dom'),
        Uri = require('uri'),
        Dom = require('dom'),
        XhrTransportBase = require('./xhr-transport-base');
    var logger = S.getLogger('s/io');
    var PROXY_PAGE = '/sub_domain_proxy.html',
        doc = S.Env.host.document,
    // hostname:{iframe: , ready:}
        iframeMap = {};

    function SubDomainTransport(io) {
        var self = this,
            c = io.config;
        self.io = io;
        c.crossDomain = false;
        logger.info('use SubDomainTransport for: ' + c.url);
    }

    S.augment(SubDomainTransport, XhrTransportBase.proto, {
        // get nativeXhr from iframe document
        // not from current document directly like XhrTransport
        send: function () {
            var self = this,
                c = self.io.config,
                uri = c.uri,
                hostname = uri.getHostname(),
                iframe,
                iframeUri,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c.xdr && c.xdr.subDomain && c.xdr.subDomain.proxy) {
                proxy = c.xdr.subDomain.proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
                if (self.nativeXhr) {
                    self.sendInternal();
                } else {
                    S.error('document.domain not set correctly!');
                }
                return;
            }

            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = doc.createElement('iframe');
                Dom.css(iframe, {
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px'
                });
                Dom.prepend(iframe, doc.body || doc.documentElement);
                iframeUri = new Uri();
                iframeUri.setScheme(uri.getScheme());
                iframeUri.setPort(uri.getPort());
                iframeUri.setHostname(hostname);
                iframeUri.setPath(proxy);
                iframe.src = iframeUri.toString();
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, 'load', _onLoad, self);

        }
    });

    function _onLoad() {
        var self = this,
            c = self.io.config,
            uri = c.uri,
            hostname = uri.getHostname(),
            iframeDesc = iframeMap[hostname];
        iframeDesc.ready = 1;
        Event.detach(iframeDesc.iframe, 'load', _onLoad, self);
        self.send();
    }

    return SubDomainTransport;
});