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
			**** same js code ***
			NavigationService.attachViewModel("#homeMainViewScript", new HomeMainViewModel(new Backbone.Model({})));
		})();
   </script>
   1): the script should have a id
   2): in the code, you should call the menthod NavigationService.attachViewModel, this method will let the navigation find you viewmodel when it navigate to the view. the first parameter is the script selector and the second parament is the viewmmodel instance

6. If you need to navigate to the the view you created in steps 5, use the code below:
   navigationService.navigateTo('http://***.**.com/views/view1')

 Methods:
 navigateTo: (url, [requestNew,] [viewModel,] [viewHtml])
 the url is the key of each view, and navigate servie us it to find the view. for the default, requestNew is false, viewModel and viewHtml are both empty
 when the navigate service find the request is true or can't find the view from cache, it will try to call this url to get the view html and then evalate the html to get the viewModel (if viewModel is empty)
 then use ko to apply the binding to the view and then show the view with default animation.

 if you want to manually navigate to an existing view, then specify the viewHtml with the html.
 if you want change the default animation of view transform, you can overwrite NavigationServiceAnimationManager.toAnimation and fromAnimation