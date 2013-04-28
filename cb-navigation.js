//Dependency: Jquery, Underscore
//Define the NavigationService class
var NavigationService = function (navigateContainer) {
    var _ = {
        isUndefined: function (obj) {
            return typeof (obj) === "undefined";
        }
    };

    var self = this;
    var $Class = NavigationService;
    //constants
    $Class.VIEWMODELONACTIVEEVENT = "onActive";
    $Class.VIEWMODELONINACTIVEEVENT = "onInactive";
    $Class.SCRIPTVIEWMODELPROPERTY = "viewModel";

    //Static Method
    $Class.attachViewModel = function (id, viewModel) {
        if ($(id).length <= 0) {
            throw "Can NOT find " + id;
        }
        if ($(id).prop('tagName') !== "SCRIPT") {
            throw "only script element can be attached";
        }
        $(id)[0][$Class.SCRIPTVIEWMODELPROPERTY] = viewModel;
    };

    //Private Fields
    self.internalViewsViewModelsCache = new Array(); //{url:***, viewModel:***, viewHtml:***}
    self.currentActiveContent = undefined;

    self.init = function (navContainer) {
        if (!_.isUndefined(navContainer)) {
            navigateContainer = $(navContainer);
        }
        if (!_.isUndefined(navigateContainer)) {
            navigateContainer = $(navigateContainer);
        }
        self.internalViewsViewModelsCache = new Array();
        self.currentActiveContent = undefined;
    };

    self.init(navigateContainer);

    var doNavigation = function (viewViewModelObj) {
        var continueFunc = function () {
            //navigateContainer.empty();

            var contentObj = _.find(self.internalViewsViewModelsCache, function (item) {
                return item.url === viewViewModelObj.url;
            });
            if (_.isUndefined(contentObj)) {
                contentObj = viewViewModelObj;
                self.internalViewsViewModelsCache.push(contentObj);
            } else {
                $.extend(contentObj, viewViewModelObj);
            }

            //navigateContainer.html(contentObj.viewHtml);
            var tmpContainerForNew = $("<div/>");
            navigateContainer.after(tmpContainerForNew);
            tmpContainerForNew.hide();
            tmpContainerForNew.html(contentObj.viewHtml);
            if (_.isUndefined(contentObj.viewModel)) {
                var script = _.find(tmpContainerForNew.children("script"), function (s) {
                    return !_.isUndefined(s[$Class.SCRIPTVIEWMODELPROPERTY]);
                });
                if (!_.isUndefined(script)) {
                    contentObj.viewModel = script[$Class.SCRIPTVIEWMODELPROPERTY];
                }
            }
            self.currentActiveContent = contentObj;

            function afterActived() {
                ko.applyBindings(contentObj.viewModel, tmpContainerForNew[0]);

                function showNewContent() {
                    navigateContainer.empty();
                    //tmpContainerForNew.show();
                    navigateContainer.append(tmpContainerForNew);

                    function afterAnimation() {
                        //forec to refresh, because I don't know why somt time, the content is not auto refreshed.
                        if (ko.$helper && ko.$helper.browser.isIE && ko.$helper.browser.version == 10) {
                            setTimeout(function () {
                                navigateContainer.focus();
                                var tmpHeight = navigateContainer.height();
                                navigateContainer.height(tmpHeight + 1);
                                navigateContainer.height(tmpHeight);
                                navigateContainer.height("auto");
                            }, 500);
                        }
                    }

                    NavigationServiceAnimationManager.doNavigateToAnimation(tmpContainerForNew, afterAnimation);
                }

                NavigationServiceAnimationManager.doNavigateFromAnimation(navigateContainer.children(), showNewContent);
            }


            if (!_.isUndefined(self.currentActiveContent) && !_.isUndefined(self.currentActiveContent.viewModel) && !_.isUndefined(self.currentActiveContent.viewModel[$Class.VIEWMODELONACTIVEEVENT])) {
                self.currentActiveContent.viewModel[$Class.VIEWMODELONACTIVEEVENT](afterActived);
            } else {
                afterActived();
            }
        };


        if (!_.isUndefined(self.currentActiveContent) && !_.isUndefined(self.currentActiveContent.viewModel) && !_.isUndefined(self.currentActiveContent.viewModel[$Class.VIEWMODELONINACTIVEEVENT])) {
            self.currentActiveContent.viewModel[$Class.VIEWMODELONINACTIVEEVENT](continueFunc);
        } else {
            continueFunc();
        }
    };

    var navigateToEx = function (requestObj, requestNew, viewModel, viewHtml) {
        if (requestNew && !_.isUndefined(viewHtml)) {
            throw "When requestNew is true, can't specify viewHtml";
        }
        var vvm = _.find(self.internalViewsViewModelsCache, function (item) {
            return item.url === requestObj.url;
        });
        if (_.isUndefined(vvm)) {
            vvm = {};
        }

        if (requestNew || _.isUndefined(vvm.viewHtml)) {
            requestObj.request(function (data) {
                if (!_.isUndefined(data.status)) {
                    throw data.responseText;
                }
                $.extend(vvm, { url: requestObj.url, viewModel: viewModel, viewHtml: data });
                doNavigation(vvm);
            });
        } else {
            $.extend(vvm, { url: requestObj.url, viewModel: viewModel, viewHtml: viewHtml });
            doNavigation(vvm);
        }
    };

    //url [, viewModel, viewHtml]
    //url[, true, viewModel]
    self.navigateTo = function (url, requestNew, viewModel, viewHtml) {
        if (_.isUndefined(requestNew)) {
            requestNew = false;
        }

        if ($.type(requestNew) !== "boolean") {
            viewHtml = viewModel;
            viewModel = requestNew;
            requestNew = _.isUndefined(viewHtml);
        }

        var requestObj = url;
        if ($.type(url) === "string") {
            requestObj = {
                request: function (callBack) {
                    $.ajax({
                        url: url
                    }).done(callBack).fail(callBack);
                },
                url: url
            };
        }

        navigateToEx(requestObj, requestNew, viewModel, viewHtml);
    };

};

var NavigationServiceAnimationConst = {
    TransformAnimationAttr: "transformAnimation",
    NoTransformAnimationTag: "NoTransformAnimation"
};

var NavigationServiceAnimationManager = {
    doNavigateToAnimation: function (navToContent, finishedCallback) {
        navToContent = $(navToContent);
        if (navToContent.filter("[" + NavigationServiceAnimationConst.TransformAnimationAttr + "='" + NavigationServiceAnimationConst.NoTransformAnimationTag + "']").length > 0) {
            navToContent.show();
            finishedCallback();
        } else {
            NavigationServiceAnimationManager.toAnimation(navToContent, finishedCallback);
        }
    },

    doNavigateFromAnimation: function (navFromContent, finishedCallback) {
        navFromContent = $(navFromContent);
        if (navFromContent.length > 0) {
            NavigationServiceAnimationManager.toAnimation(navFromContent, finishedCallback);
        } else {
            finishedCallback();
        }
    },

    toAnimation: function (content, finishedCallback) {
        content.slideDown(finishedCallback);
    },

    fromAnimation: function (content, finishedCallback) {
        content.slideUp(finishedCallback);
    }
};