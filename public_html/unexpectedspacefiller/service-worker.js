"use strict";var precacheConfig=[["/index.html","dd8c9b3255d584e4b05d3de8754c2a16"],["/static/css/main.7bf3e02d.css","b76bebc862db0eedc96dcc9c70a3873b"],["/static/js/main.be2e0577.js","0f4231a01b9fe7acfca73d2b6e8624bb"],["/static/media/Mack.662fe9be.png","662fe9bef2af63ca9c35b467a999a4e3"],["/static/media/bgNodes.1b51875a.png","1b51875af9d176c3d9ed8b3652b86c60"],["/static/media/crowdstrike.94232422.svg","942324226332b3f51e7a10fbaf374ef6"],["/static/media/illusive.aa6051f4.svg","aa6051f4c4cc58a02fb6f505f3b4645d"],["/static/media/person1.ed89841e.png","ed89841e2274ad3ca6127245a9e350d2"],["/static/media/person2.f19a5625.png","f19a562511242852574184dec179c1e8"],["/static/media/person3.de15ac08.png","de15ac08d87d61f6ac12456cd75a7a2f"],["/static/media/person4.22639d2b.png","22639d2b854e145519266c8565e1339d"],["/static/media/person5.f311bd89.png","f311bd89102869b991140aff6c052efe"],["/static/media/person6.6f33404e.png","6f33404e591486d4e84eeb730f1056ee"],["/static/media/person7.6f85f86f.png","6f85f86f516f1cb318315bc053f6c6c7"],["/static/media/person8.a33f871b.png","a33f871bce024f8bf39fe2c232c1bf4c"],["/static/media/svg_china.9ee526b1.svg","9ee526b1d46e368a9906561e033cbd2f"],["/static/media/svg_india.cce1bbea.svg","cce1bbea033e7bba50dd29af08a91b7d"],["/static/media/svg_indonesia.f281789a.svg","f281789aa89f6c2bd34181c40d0ceb5a"],["/static/media/svg_iran.56df69c6.svg","56df69c627c71c7453ea1674190b107d"],["/static/media/svg_lebanon.9f18e766.svg","9f18e76689b29dd644a2c7f95c2c6052"],["/static/media/svg_n_korea.6c95124a.svg","6c95124a287a7239c7fe191f0b159f11"],["/static/media/svg_pakistan.0ec8800e.svg","0ec8800ec1c2a0594785b8c668ac55a6"],["/static/media/svg_palestine.e8d65dfb.svg","e8d65dfba12f02350713b7180cad40f0"],["/static/media/svg_russia.ea931fb0.svg","ea931fb0e45e6c561386c16e958d0254"],["/static/media/svg_syria.79562622.svg","79562622c582b0aa0c784c2cf8c9fad5"],["/static/media/svg_tunisia.a8492fb0.svg","a8492fb0ff793557f2e567772b080ccc"],["/static/media/svg_turkey.f775a852.svg","f775a85244f24a7f301aa4213269d5e6"],["/static/media/svg_uae.1eae2889.svg","1eae2889ec05ec8bc95623d94519bc40"],["/static/media/svg_ukraine.821b1f3e.svg","821b1f3ecb22ac28b8b0e2fdb8f48def"],["/static/media/svg_usa.ab4ad33d.svg","ab4ad33da635b179b55c091f5d0e0669"],["/static/media/svg_venezuela.80ff335a.svg","80ff335ae229909452115a1c04adc627"],["/static/media/svg_vietnam.528275eb.svg","528275eb03d166341e72bc94c9302d0e"],["/static/media/weylanYutani.aa6051f4.svg","aa6051f4c4cc58a02fb6f505f3b4645d"],["/static/media/worldLarge.ffaa6a28.png","ffaa6a28e431eaab74744400f13c32d7"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=a),t.toString()},cleanResponse=function(a){return a.redirected?("body"in a?Promise.resolve(a.body):a.blob()).then(function(e){return new Response(e,{headers:a.headers,status:a.status,statusText:a.statusText})}):Promise.resolve(a)},createCacheKey=function(e,a,t,c){var n=new URL(e);return c&&n.pathname.match(c)||(n.search+=(n.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(t)),n.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var t=new URL(a).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,t){var a=new URL(e);return a.hash="",a.search=a.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(a){return t.every(function(e){return!e.test(a[0])})}).map(function(e){return e.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],t=e[1],c=new URL(a,self.location),n=createCacheKey(c,hashParamName,t,/\.\w{8}\./);return[c.toString(),n]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(c){return setOfCachedUrls(c).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(a){if(!t.has(a)){var e=new Request(a,{credentials:"same-origin"});return fetch(e).then(function(e){if(!e.ok)throw new Error("Request for "+a+" returned a response with status "+e.status);return cleanResponse(e).then(function(e){return c.put(a,e)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(a){return a.keys().then(function(e){return Promise.all(e.map(function(e){if(!t.has(e.url))return a.delete(e)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(a){if("GET"===a.request.method){var e,t=stripIgnoredUrlParameters(a.request.url,ignoreUrlParametersMatching),c="index.html";(e=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,c),e=urlsToCacheKeys.has(t));var n="/index.html";!e&&"navigate"===a.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],a.request.url)&&(t=new URL(n,self.location).toString(),e=urlsToCacheKeys.has(t)),e&&a.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(e){return console.warn('Couldn\'t serve response for "%s" from cache: %O',a.request.url,e),fetch(a.request)}))}});