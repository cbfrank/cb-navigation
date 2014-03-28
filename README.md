cb-navigation
=============
This framework provide a common navigation frame with the MVVM pattern
It depends on Jquery
To used it:

1. Inlude JQuery

2. Include cb-ko-helper.js and knockout js

3. Include cb-navigation.js

4. Create the mamin view (html/mvc ... and so on)
   in this view, you should init the navigation service as below:
   var navigationService = new NavigationService();
   navigationService.init('#mainContentContainer');

5. Create the one view for the navigation, for example, the new view url is http://***.**.com/views/view1
   in this view, you should create a script block like below:

   <script type="text/javascript" id="homeMainViewScript">
   
		(function () {
		
			**** some js code ***
			NavigationService.attachViewModel("#homeMainViewScript", function(existingViewModel) {
                return existingViewModel ? existingViewModel : new HomeMainViewModel(new Backbone.Model({}));
                
            });
            
		})();
		
   </script>
   
   1): the script should have a id
   
   2): in the code, you should call the menthod NavigationService.attachViewModel, this method will let the navigation find you viewmodel when it navigate to the view. 
   the first parameter is the script selector and the second parament is a function which accept an paramente of existing view Model and return the updated or new created view model

6. If you need to navigate to the the view you created in steps 5, use the code below:
   navigationService.navigateTo('http://***.**.com/views/view1')
  
7. if you want to delay the navigation animation, set NavigationService.NavigateAnimationDelay to a value more than 0 (millisecond)

 Methods:
 
 navigateTo: (url, [requestNew,] [viewModel,] [viewHtml], [navigatedCallBack])
 
 the url is the key of each view, and navigate servie us it to find the view. for the default, requestNew is false, viewModel and viewHtml are both empty
 when the navigate service find the request is true or can't find the view from cache, it will try to call this url to get the view html and then evalate the html to get the viewModel (if viewModel is empty)
 then use ko to apply the binding to the view and then show the view with default animation.

 if you want to manually navigate to an existing view, then specify the viewHtml with the html.
 if you want change the default animation of view transform, you can overwrite NavigationServiceAnimationManager.toAnimation and fromAnimation

 You can install it through Nuget https://nuget.org/packages/JQueryMVVMNavigationFramework/ 

//Dependency: Jquery, Underscore
//Define the NavigationService class
//if user want to delay the navigation animation, set NavigationService.NavigateAnimationDelay to a value more than 0 (millisecond)
//option:
//  validateHttpResponse: function(responseData, textStatus, jqXHR), this function is uused to check if the server response data is the validate, in some case, for example, the session time out, the request
//                          will be finally navigated to the login page, not the requestd page, so use this function to check
//                          this function should return true or false to indicate the request result is correct or not
//  onParseContentHtmlException: function(exception), will be called when parse content html error, if return true, then will throw the exception again
//  onBeforeDoNavigate: function() will be call when the navigation actual begins (before ajax call)
//  onEndNavigate:  function(bool) will be called after the navigate is done (won't wait until animation finish), parameter is indicate if the navigate continue or cancelled (true continue, false cancelled)
//  onNavigationHttpRequestError: function(jqXHR, textStatus, errorThrown) this functuion will be called when try to ajax call the navigate url and failed