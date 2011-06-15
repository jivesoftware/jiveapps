/*
 * Copyright 2011 Jive Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var objects = {
    "bessie": {
        key: "bessie",
        id: "urn:activtiyTest:animal/101",
        title: "Bessie the cow",
        image: "http://venaglia-z800:8000/bessie.jpg",
        mediaLink: {
            mediaType: "photo",
            url: "http://venaglia-z800:8000/bessie.jpg"
        },
        objectType: "urn:activityTest:animal",
        summary: "All about <i>${object.title}</i><br/><a style=\"color:#ff0; font-size:32px; font-weight:bold;\" href=\"http://www.lipsum.com/\" onclick=\"alert('pwnzd');\">Lorem ipsum</a> dolor sit amit..."
    },
    "lucky": {
        key: "lucky",
        id: "urn:activtiyTest:animal/102",
        title: "Lucky the goat",
        image: "http://venaglia-z800:8000/lucky.jpg",
        mediaLink: {
            mediaType: "blog",
            url: "http://venaglia-z800:8080/people/admin/blog/2010/11/03/lucky-the-goat"
        },
        objectType: "urn:activityTest:animal",
        summary: "All about <i>${object.title}</i><br/><a style=\"color:#ff0; font-size:32px; font-weight:bold;\" href=\"http://www.lipsum.com/\" onclick=\"alert('pwnzd');\">Lorem ipsum</a> dolor sit amit..."
    },
    "molly": {
        key: "molly",
        id: "urn:activtiyTest:animal/103",
        title: "Molly the pig",
        image: "http://venaglia-z800:8000/molly.jpg",
        mediaLink: {
            mediaType: "video",
            url: "http://www.youtube.com/watch?v=F26H5n7tRFw"
        },
        objectType: "urn:activityTest:animal",
        summary: "All about <i>${object.title}</i><br/><a style=\"color:#ff0; font-size:32px; font-weight:bold;\" href=\"http://www.lipsum.com/\" onclick=\"alert('pwnzd');\">Lorem ipsum</a> dolor sit amit..."
    },
    "rex": {
        key: "rex",
        id: "urn:activtiyTest:animal/104",
        title: "Rex the chicken",
        image: "http://venaglia-z800:8000/rex.jpg",
        mediaLink: {
            mediaType: "document",
            url: "http://venaglia-z800:8000/chicken-pot-pie.pdf"
        },
        objectType: "urn:activityTest:animal",
        summary: "All about <i><a href=\'jive:app://canvas.rex?params={\"chicken\":\"1234\"}\'>${object.title}</a></i><br/><a style=\"color:#ff0; font-size:32px; font-weight:bold;\" href=\"http://www.lipsum.com/\" onclick=\"alert('pwnzd');\">Lorem ipsum</a> dolor sit amit..."
    }
};

var verbs = {
    "feed": {
        key: "feed",
        uri: "urn:activityTest:feed",
        label: "fed",
        icon: "http://venaglia-z800:8000/feed.16x16.png",
        jiveDisplay: "grouped",
        actionLinks: [
            {title:"corn",url:"http://venaglia-z800:8000/food/corn"},
            {title:"alfalfa",url:"http://venaglia-z800:8000/food/alfalfa"},
            {title:"ignore"}
        ]
    },
    "groom": {
        key: "groom",
        uri: "urn:activityTest:groom",
        label: "groomed",
        icon: "http://venaglia-z800:8000/brush.16x16.png",
        jiveDisplay: "grouped",
        actionLinks: [
            {title:"brush",url:"http://venaglia-z800:8000/washrack/brush"},
            {title:"bathe",url:"http://venaglia-z800:8000/washrack/bathe"},
            {title:"ignore"}
        ]
    },
    "buy": {
        key: "buy",
        uri: "urn:activityTest:buy",
        label: "bought",
        icon: "http://venaglia-z800:8000/money.16x16.png",
        jiveDisplay: "update",
        actionLinks: [
            {title:"approve",url:"http://venaglia-z800:8000/auction/buy"},
            {title:"reject",url:"http://venaglia-z800:8000/auction/pass"}
        ]
    },
    "sell": {
        key: "sell",
        uri: "urn:activityTest:sell",
        label: "sold",
        icon: "http://venaglia-z800:8000/money.16x16.png",
        jiveDisplay: "update",
        actionLinks: [
            {title:"approve",url:"http://venaglia-z800:8000/auction/sell"},
            {title:"reject",url:"http://venaglia-z800:8000/auction/pass"}
        ]
    }
};

var targets = {
    "neighbor": {
        id: "urn:activtiyTest:person/201",
        title: "a neighbor",
        objectType: "urn:activityTest:person"
    },
    "friend": {
        id: "urn:activtiyTest:person/202",
        title: "a friend",
        objectType: "urn:activityTest:person"
    },
    "flintstone": {
        id: "urn:jiveObject:user/2002",
        title: "Fred Flintstone",
        objectType: "urn:activityTest:person"
    }
};

