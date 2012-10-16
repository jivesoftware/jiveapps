/*
 * Copyright 2012, Jive Software Inc.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*
OK. This code is pretty messy and was hacked together here and there over the course
of a few days. Any TLC that you want to give it would be great. I've thrown ideas in the TODO List.
 There are also other clean up areas in the code.
 */

//TODO: Add user prefs for "chatty Kathy" i.e. posting to the activity stream when the user does something
//TODO: Add user pref to change the directory of where the slide index file is read from
//TODO: Add !App to add a slide into a document
//TODO  Add ability to create a document
//TODO: Once you add a document, record the fact you've done this so you can look it up later
//TODO: Change to proxy URLs for the images

//TODO: Structure the  code better. Incorporate backbone.


//TODO: Post an event to the activity stream when someone likes a slide
var osDataContext = opensocial.data.getDataContext();
var SSC = SSC || {}; // Namespace for the controller

SSC.fetchAppData = function (){
    //use all thr group user ids here
    var aListOfFriends = osDataContext.getDataSet("friendsLoaded");
    var userIds = [];
    _.each(aListOfFriends.list, function(value, key, theList){
     userIds.push(value.person.id);
    });

    //start with current slide, then add the likesdislikesqueustions
    //osapi.appdata.get({userId: 2124, keys: ['currentSlide']}).execute(SSC.refreshModels);
    osapi.appdata.get({userId: userIds, keys: ['newSlideInfo'], escapeType: opensocial.EscapeType.NONE}).execute(SSC.refreshFriendSlideInfo);
};

//TODO:Maybe refactor this to take in an information object for like/dislike/question
SSC.setCurrentSlideInfo = function(slideInfo) {
    osapi.appdata.update({userId: '@me', data: {"newSlideInfo":slideInfo}, escapeType: opensocial.EscapeType.NONE }
    ).execute(function() {
            console.log("app data updated" + slideInfo);
            console.log(slideInfo);
        });
};

SSC.setLocalSlideInfo = function(slideInfo){
    osDataContext.putDataSet(slideInfo.slideNumber,slideInfo);
};


SSC.getCurrentSlide = function(){
        // Get currently selected item from the carousel
    var item = $('#myCarousel .carousel-inner .item.active')
    // Index is 1-based, use this to activate the nav link based on slide
    var index = item.index() + 1;
    console.log("The current slide is: " + index);
    return index;
};

SSC.slideChanged = function(event){
    var localSlideInfo = osDataContext.getDataSet(SSC.getCurrentSlide());

    if (localSlideInfo == undefined){
      localSlideInfo = {"slideNumber" : SSC.getCurrentSlide(), "likeAction": null };
    };

    SSC.updateCurrentSlide(localSlideInfo);

};

SSC.updateCurrentSlide = function(slideInfo) {
// OK we need a structure, e.g. the like/dislike, & slide number.
// we also need to store this locally so we can initialize our own slide state when we change slides
// since app data is only ONE slide
    SSC.setCurrentSlideInfo(slideInfo);
    SSC.setLocalSlideInfo(slideInfo);
    //update the buttons to reflect your like/dislike
    SSC.toggleLikeButtonsFromHistory(slideInfo);
};

SSC.updateLikeDislikeQuestion = function(event){
    //refactor to be constants
    //could get fancy and factor out the case statement to take a function
    var aLikeAction;
    switch (event.target.id) {
        case "likeButton" :
            aLikeAction = "like";
            break;
        case "dislikeButton" :
            aLikeAction = "dislike";
            break;
        case "questionButton" :
            aLikeAction = "question";
            break;
    };
    var slideInfo = {"slideNumber" : SSC.getCurrentSlide(), "likeAction": aLikeAction };
    SSC.updateCurrentSlide(slideInfo);
};



SSC.buildCarouselDivs = function(key) {
    var innerCarouselDiv = $("#innerCarousel");
    var slides = (osDataContext.getDataSet(key[0]));
    var itemTemplate = "<div class='item'><img src='^url^'/></div>";
    for (var i = 0; i < slides.length; i++) {
        var obj = slides[i];
        var itemDiv = $("<div></div>").addClass("item");
        var imgTag = $("<img></img>").attr("src",obj.slideImageUrl);
        if (i == 0) {
            itemDiv.addClass("active");
            //Need to also update the app data so the current slide is refreshed.
        };

        imgTag.appendTo(itemDiv);
        itemDiv.appendTo(innerCarouselDiv);
    };

    var leftNav   = $('<a class="carousel-control left" href="#myCarousel" data-slide="prev">&lsaquo;</a>');
    var rightNav = $('<a class="carousel-control right" href="#myCarousel" data-slide="next">&rsaquo;</a>');
    $('#myCarousel').append(leftNav);
    $('#myCarousel').append(rightNav);

    SSC.initializeCarousel();
};


SSC.initializeCarousel = function() {
    //setup the carousel and the event listeners
    $('#myCarousel').carousel(
        {interval:false, pause:"hover"}
    );
    $('#myCarousel').bind('slid', SSC.slideChanged);
    gadgets.window.adjustHeight(800);
    SSC.slideChanged();

};


SSC.buildSlideInfoBadges = function(aKey) {
    var aListOfFriends = osDataContext.getDataSet("friendsLoaded");
    var friendsSlideInfoData = osDataContext.getDataSet(aKey[0]);
    _.each(aListOfFriends.list, function(value, key, list) {
        var newSlideInfoString = friendsSlideInfoData[value.person.id].newSlideInfo;
        if (newSlideInfoString !== undefined) {
            var friendsSlideInfo = gadgets.json.parse(newSlideInfoString);
            SSC.buildSlideNumberBadge(value, friendsSlideInfo);
            SSC.buildLikeDislikeIcon(value, friendsSlideInfo);
        }
    });
};

SSC.buildSlideNumberBadge = function (anObject, friendsSlideInfo) {
    var slideNumberDisplay = ((friendsSlideInfo.slideNumber) == -1)?("-"):(friendsSlideInfo.slideNumber);
    $("#" + anObject.person.id + "_currentSlideBadge").html(slideNumberDisplay);
};


SSC.buildLikeDislikeIcon = function(anObject, friendsSlideInfo) {
//TODO: Refactor icon names to be constants.

    //select the right icon class here
    //set the class
    var anElement = $("#" + anObject.person.id + "_likesDislikesTag");
    $(anElement).removeClass();
    $(anElement).addClass(SSC.getIconClassForAction(friendsSlideInfo.likeAction));

};

SSC.toggleLikeButtonsFromHistory = function(slideInfo) {
    $("button").removeClass("active");
    switch (slideInfo.likeAction) {
        case "like" :
            if ($("#likeButton").hasClass("btn-success")) {
                $("#likeButton").removeClass("btn-success");
            }
            else {
                $("#likeButton").addClass("active btn-success");
                $("#dislikeButton").removeClass("btn-danger");
                $("#questionButton").removeClass("btn-info");
            };
            break;
        case "dislike" :
            if ($("#dislikeButton").hasClass("btn-danger")) {
                $("#dislikeButton").removeClass("btn-danger");
            }
            else {
                $("#likeButton").removeClass("btn-success");
                $("#dislikeButton").addClass("active btn-danger");
                $("#questionButton").removeClass("btn-info");
            };
            break;
        case "question" :
            if ($("#questionButton").hasClass("btn-info")) {
                $("#questionButton").removeClass("btn-info");
            }
            else {
                $("#likeButton").removeClass("btn-success");
                $("#dislikeButton").removeClass("btn-danger");
                $("#questionButton").addClass("active btn-info");
            };
            break;
    };

    /*
     if (slideInfo.likeAction == "like") {
     $("#likeButton").addClass("active btn-success");
     } else {
     $("#likeButton").removeClass("active btn-success")
     };

     if (slideInfo.likeAction == "dislike") {
     $("#dislikeButton").addClass("active btn-danger");
     } else {
     $("#dislikeButton").removeClass("active btn-danger")
     };

     if (slideInfo.likeAction == "question") {
     $("#questionButton").addClass("active btn-info");
     } else {
     $("#questionButton").removeClass("active btn-info")
     };
     */
};



SSC.getIconClassForAction = function(aLikeAction){
    var iconClass;
    switch (aLikeAction) {
        case "like":
            iconClass = "icon-thumbs-up";
            break;
        case "dislike":
            iconClass = "icon-thumbs-down";
            break;
        case "question":
            iconClass = "icon-hand-up";
            break;
        default:
            iconClass = "icon-minus";
    };
    return iconClass;
};


SSC.refreshFriendSlideInfo = function(data){
    osDataContext.putDataSet("friendsSlideInfo", data);
};



SSC.reset = function(){
    //app is closed
    SSC.updateCurrentSlide({"slideNumber" : -1, "likeAction": null });
};

SSC.startRetrievingFriendSlideInfo = function (aKey){
     //Responding to a listener for "friendsLoaded" that has the group in it. We can start
     // retrieving the app data for the members. Set the timer in the listener

     /*setup the interval to fetch the app data. We'll do this every 3 seconds by default
     * set the timer only after the initial set of friends has been chosen
     */
    //kick this off the first one manual then kick off the timer
    SSC.fetchAppData();
    window.myInterval = setInterval(SSC.fetchAppData, 3000);
};


SSC.thumbnailTemplate = function(){
    return  '<li class="span1"><a href="#" id="^userId^" class="thumbnail"><img src="^avatarUrl^" alt=""><span id="^currentSlideBadge^" class="badge">-</span><span><i id="^likesDislikesTag^" class="icon-minus"></i></span></a></li>'
};

SSC.buildPersonThumbnail = function(aPerson){
        var thumbnailTemplate = SSC.thumbnailTemplate();
        var avatarUrl = aPerson.resources.html.ref + "/avatar";
        var htmlString = thumbnailTemplate.replace("^avatarUrl^", avatarUrl);
        htmlString = htmlString.replace("^userId^", aPerson.id);
        htmlString = htmlString.replace("^currentSlideBadge^", aPerson.id + "_currentSlideBadge");
        htmlString = htmlString.replace("^likesDislikesTag^", aPerson.id + "_likesDislikesTag");
        $("#friendsList").append($(htmlString));
};

SSC.resetFriendsList = function(){
    $('#friendsList').html("");
};

SSC.loadFriendsFromGroup = function(data){
   SSC.resetFriendsList();
    _.each(data.list, function(aGroup){
        SSC.buildPersonThumbnail(aGroup.person) } );
    osDataContext.putDataSet("friendsLoaded",data);
};


SSC.handleFriendGroupSelection = function(event){
    console.log(event);
    //TODO: Add the name of the selected group somewhere
    var socialGroups = osDataContext.getDataSet("viewersSocialGroups").list;
    var selectedGroup = _.find(socialGroups, function(aSocialGroup){return aSocialGroup.id == event.target.id});
    selectedGroup.getMembers().execute(SSC.loadFriends);
};


SSC.placePickerResponse = function(selectedGroup){
    selectedGroup.getMembers().execute(SSC.loadFriendsFromGroup);
};

SSC.chooseGroupFromPicker = function(event){
      var params = {
        type : "group",
        success : SSC.placePickerResponse,
        error : function(data){console.log("error picking place" + data)}  };
    osapi.jive.corev3.places.requestPicker(params);
};

SSC.loadFriends = function(data) {
    SSC.resetFriendsList();
    if (data.hasOwnProperty("content")) {
        _.each(data.content.list, SSC.buildPersonThumbnail);
    }
    else {
        SSC.buildPersonThumbnail(data)
    };
};


SSC.chooseFriendsFromPicker = function(event){
       var params = {
        multiple : true,
        success : SSC.loadFriends,
        error : function(data){console.log("error picking people" + data)} };
    osapi.jive.corev3.people.requestPicker(params);
};


SSC.loadSlideIndex = function() {

    var prefs = new gadgets.Prefs();
    var presentationIndex = prefs.getString("presentationIndex");
    osapi.http.get({"href":presentationIndex}).execute(function(data) {
        var slides = (gadgets.json.parse(data.content)).slides;
        osDataContext.putDataSet("slideShowIndex", slides);
    });

};

SSC.initializeFriendsList = function(key){
    var friends = osDataContext.getDataSet(key[0]);
    _.each(friends.list, function(aFriend){
        var avatarUrl = aFriend.thumbnailUrl;
        var badgeTemplate = SSC.thumbnailTemplate();
        var htmlString = badgeTemplate.replace("^avatarUrl^", aFriend.thumbnailUrl);
        htmlString = htmlString.replace("^userId^", aFriend.id);
        htmlString = htmlString.replace("^currentSlideBadge^", aFriend.id + "_currentSlideBadge");
        htmlString = htmlString.replace("^likesDislikesTag^", aFriend.id + "_likesDislikesTag");
        $("#friendsList").append($(htmlString));
    });
};


//initialize the application
gadgets.util.registerOnLoadHandler(function() {

   //Clean up app data upon entry: currentSlide
   osapi.appdata.delete({keys: ['currentSlide','currentSlideInfo']}).execute(function(data){console.log("app data clean")});

    //The controller kicks off the process. See SSC.slideShowController constructor
    osDataContext.registerListener('slideShowIndex', SSC.buildCarouselDivs);
    osDataContext.registerListener('friendsLoaded', SSC.startRetrievingFriendSlideInfo);
    osDataContext.registerListener('friendsSlideInfo', SSC.buildSlideInfoBadges);
    osDataContext.registerListener('viewerFriends', SSC.initializeFriendsList);



    //Register Button Handlers
     $("#likeButton").on("click", SSC.updateLikeDislikeQuestion);
     $("#dislikeButton").on("click", SSC.updateLikeDislikeQuestion);
     $("#questionButton").on("click", SSC.updateLikeDislikeQuestion);
     $("#placePickerButton").on("click", SSC.chooseGroupFromPicker);
     $("#friendSelectionButton").on("click", SSC.chooseFriendsFromPicker);


    SSC.loadSlideIndex();

});


window.onbeforeunload = SSC.reset;


