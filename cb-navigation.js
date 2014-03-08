var NavigationService = function (navigateContainer, option) {
    var _ = {
        isUndefined: function (obj) {
            return typeof (obj) === "undefined";
        },
        find: function (source, compareFunc) {
            for (var i = 0; i < source.length; i++) {
                if (compareFunc(source[i])) {
                    return source[i];
                }
            }
            return undefined;
        }
    };

    var self = this;
    var $Class = NavigationService;
    //constants
    $Class.VIEWMODELONACTIVEEVENT = "onActive";
    $Class.VIEWMODELONINACTIVEEVENT = "onInactive";
    $Class.SCRIPTVIEWMODELPROPERTY = "viewModel";
    $Class.VIEWRELATEDOPTIONPROPERTY = "viewRelatedOption";

    var OnViewInit = "OnViewInit";
    var OnViewUnload = "OnViewUnload";

    if (typeof ($Class.NavigateAnimationDelay) === "undefined") {
        $Class.NavigateAnimationDelay = 0; //millisecond
    }

    //Static Method
    $Class.attachViewModel = function (id, viewModelFunc, viewInitFunc, viewUnloadFunc) {
        if ($(id).length <= 0) {
            throw "Can NOT find " + id;
        }
        if ($(id).prop('tagName') !== "SCRIPT") {
            throw "only script element can be attached";
        }
        if (typeof (viewModelFunc) !== "function") {
            throw "viewModelFunc should be a function that return the viewModel";
        }
        var element = $(id)[0];
        element[$Class.SCRIPTVIEWMODELPROPERTY] = viewModelFunc;
        var viewRelatedOption = {};
        viewRelatedOption[OnViewInit] = viewInitFunc;
        viewRelatedOption[OnViewUnload] = viewUnloadFunc;
        element[$Class.VIEWRELATEDOPTIONPROPERTY] = viewRelatedOption;
    };

    $Class.GetAllCachedViewModels = function () {
        return self.internalViewsViewModelsCache;
    };

    $Class.FindCachedViewModel = function (isMatchFunc) {
        var all = $Class.GetAllCachedViewModels();
        for (var i = 0; i < all.length; i++) {
            if (isMatchFunc(all[i])) {
                return all[i];
            }
        }
        return undefined;
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

    //navigatedCallBack: function(bool), the parameter indicate if the naviation action is cancel or not
    var doNavigation = function (viewViewModelObj, navigatedCallBack) {
        //execute current will remove view's unload function
        var currentWillRemovViewScript = _.find(navigateContainer.find("script"), function (s) {
            return !_.isUndefined(s[$Class.SCRIPTVIEWMODELPROPERTY]);
        });
        if (currentWillRemovViewScript && currentWillRemovViewScript[$Class.VIEWRELATEDOPTIONPROPERTY] && currentWillRemovViewScript[$Class.VIEWRELATEDOPTIONPROPERTY][OnViewUnload]) {
            currentWillRemovViewScript[$Class.VIEWRELATEDOPTIONPROPERTY][OnViewUnload]();
        }


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
        try {
            tmpContainerForNew.html(contentObj.viewHtml);
        } catch (e) {
            if (!option.onParseContentHtmlException || option.onParseContentHtmlException(e)) {
                if (option.onEndNavigate) {
                    option.onEndNavigate();
                }
                if (navigatedCallBack) {
                    navigatedCallBack(false);
                }
                throw e;
            }
            if (option.onEndNavigate) {
                option.onEndNavigate();
                if (navigatedCallBack) {
                    navigatedCallBack(false);
                }
            }
            return;
        }

        var script = _.find(tmpContainerForNew.find("script"), function (s) {
            return !_.isUndefined(s[$Class.SCRIPTVIEWMODELPROPERTY]);
        });

        var viewRelatedOption = undefined;
        if (!_.isUndefined(script)) {
            var scriptViewModelProp = script[$Class.SCRIPTVIEWMODELPROPERTY];
            if (!_.isUndefined(scriptViewModelProp)) {
                if (typeof (scriptViewModelProp) !== "function") {
                    throw "SCRIPTVIEWMODELPROPERTY should be a function return viewModel";
                }
                contentObj.viewModel = scriptViewModelProp(contentObj.viewModel);
            }
            viewRelatedOption = script[$Class.VIEWRELATEDOPTIONPROPERTY];
        }
        self.currentActiveContent = contentObj;

        function afterActived() {
            if (navigateContainer.children().length > 0) {
                navigateContainer.children().each(function (index, element) {
                    ko.cleanNode(element);
                });
            }
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
            if (option.onEndNavigate) {
                option.onEndNavigate();
            }
            if (navigatedCallBack) {
                navigatedCallBack(false);
            }
            if ($Class.NavigateAnimationDelay > 0) {
                setTimeout(function () {
                    NavigationServiceAnimationManager.doNavigateFromAnimation(navigateContainer.children(), showNewContent);
                }, $Class.NavigateAnimationDelay);
            } else {
                NavigationServiceAnimationManager.doNavigateFromAnimation(navigateContainer.children(), showNewContent);
            }
        }

        if (viewRelatedOption && viewRelatedOption[OnViewInit]) {
            viewRelatedOption[OnViewInit]();
        }
        if (!_.isUndefined(self.currentActiveContent) && !_.isUndefined(self.currentActiveContent.viewModel) && !_.isUndefined(self.currentActiveContent.viewModel[$Class.VIEWMODELONACTIVEEVENT])) {
            self.currentActiveContent.viewModel[$Class.VIEWMODELONACTIVEEVENT](afterActived);
        } else {
            afterActived();
        }
    };

    //navigatedCallBack: function(bool), the parameter indicate if the naviation action is cancel or not
    var navigateToEx = function (requestObj, requestNew, viewModel, viewHtml, navigatedCallBack) {
        if (requestNew && !_.isUndefined(viewHtml)) {
            throw "When requestNew is true, can't specify viewHtml";
        }
        var vvm = _.find(self.internalViewsViewModelsCache, function (item) {
            return item.url === requestObj.url;
        });
        if (_.isUndefined(vvm)) {
            vvm = {};
        }

        var continueFunc = function (cancel) {
            if (typeof (cancel) === "boolean" && cancel) {
                if (navigatedCallBack) {
                    navigatedCallBack(true);
                }
                return;
            }
            if (option.onBeforeDoNavigate) {
                option.onBeforeDoNavigate();
            }
            if (requestNew || _.isUndefined(vvm.viewHtml)) {
                requestObj.request(function (data, textStatus, jqXHR) {
                    if (option.validateHttpResponse && !option.validateHttpResponse(data, textStatus, jqXHR)) {
                        return;
                    }
                    if (!_.isUndefined(data.status)) {
                        throw data.responseText;
                    }
                    $.extend(vvm, { url: requestObj.url, viewModel: viewModel, viewHtml: data });
                    doNavigation(vvm, navigatedCallBack);
                }, function (jqXHR, textStatus, errorThrown) {
                    if (option.onNavigationHttpRequestError) {
                        option.onNavigationHttpRequestError(jqXHR, textStatus, errorThrown);
                    } else {
                        alert('Navigate to "' + requestObj.url + '" failed');
                    }
                });
            } else {
                $.extend(vvm, { url: requestObj.url, viewModel: viewModel, viewHtml: viewHtml });
                doNavigation(vvm, navigatedCallBack);
            }
        };

        if (!_.isUndefined(self.currentActiveContent) && !_.isUndefined(self.currentActiveContent.viewModel) && !_.isUndefined(self.currentActiveContent.viewModel[$Class.VIEWMODELONINACTIVEEVENT])) {
            self.currentActiveContent.viewModel[$Class.VIEWMODELONINACTIVEEVENT](continueFunc);
        } else {
            continueFunc();
        }
    };

    //url [, viewModel, viewHtml]
    //url[, true, viewModel]
    ////url, navigatedCallBack
    self.navigateTo = function (url, requestNew, viewModel, viewHtml, navigatedCallBack) {
        if (_.isUndefined(requestNew)) {
            requestNew = false;
        }
        if ($.type(requestNew) === "function") {
            navigatedCallBack = requestNew;
            requestNew = true;
            if (typeof (viewModel) !== "undefined" || typeof (viewHtml) != "undefined") {
                throw "Incorrect method call";
            }
        }
        else if ($.type(requestNew) !== "boolean") {
            viewHtml = viewModel;
            viewModel = requestNew;
            requestNew = _.isUndefined(viewHtml);
        }

        var requestObj = url;
        if ($.type(url) === "string") {
            requestObj = {
                request: function (callBack, failcallBack) {
                    var a = $.ajax({
                        url: url
                    }).always(function (data, textStatus, jqXHR) {
                        if (option.validateHttpResponse && !option.validateHttpResponse(data, textStatus, jqXHR)) {
                            return;
                        }
                    }).done(callBack);
                    if (failcallBack) {
                        a.fail(failcallBack);
                    }
                },
                url: url
            };
        }

        navigateToEx(requestObj, requestNew, viewModel, viewHtml, navigatedCallBack);
    };

};

var NavigationServiceAnimationConst = {
    TransformAnimationAttr: "transformAnimation",
    NoTransformAnimationTag: "NoTransformAnimation"
};

var NavigationServiceAnimationManager = {
    doNavigateToAnimation: function (navToContent, finishedCallback) {
        navToContent = $(navToContent);
        if (navToContent.children().filter("[" + NavigationServiceAnimationConst.TransformAnimationAttr + "='" + NavigationServiceAnimationConst.NoTransformAnimationTag + "']").length > 0) {
            navToContent.show();
            finishedCallback();
        } else {
            NavigationServiceAnimationManager.toAnimation(navToContent, finishedCallback);
        }
    },

    doNavigateFromAnimation: function (navFromContent, finishedCallback) {
        navFromContent = $(navFromContent);
        if (navFromContent.length > 0) {
            NavigationServiceAnimationManager.fromAnimation(navFromContent, finishedCallback);
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