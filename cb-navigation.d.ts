declare module $CB.Navigation {
    interface IViewModel {
        //method for navigation
        onActive? (continueCallback: () => void): void;
        onInactive? (continueCallback: () => void): void;
        OnViewInit? (): void;
        OnViewUnload? (): void;
    }

    interface INavigationService {
        init(): void;
        init(navContainer: string): void;
        init(navContainer: JQueryStatic): void;
        navigateTo(url: string, requestNew: boolean, viewModel: IViewModel, viewHtml: string, navigatedCallBack: () => void): void;
        navigateTo(url: string, viewModel?: IViewModel, viewHtml?: string): void;
        navigateTo(url: string, navigatedCallBack: () => void): void;
    }

    interface INavigationServiceAnimationConst {
        TransformAnimationAttr: string;
        NoTransformAnimationTag: string;
    }

    interface INavigationServiceAnimationManager {
        doNavigateToAnimation(navToContent, finishedCallback: () => void): void;
        doNavigateFromAnimation(navFromContent, finishedCallback: () => void): void;
        toAnimation(content, finishedCallback: () => void): void;
        fromAnimation(content, finishedCallback: () => void): void;
    }

    interface INavigationOption {
        onParseContentHtmlException? (exception): void;
        onBeforeDoNavigate? (): void;
        onEndNavigate? (continueActive: boolean): void;
        validateHttpResponse? (data, textStatus, jqXHR: JQueryXHR): void;
        onNavigationHttpRequestError? (jqXHR: JQueryXHR, textStatus, errorThrown): void;
    }
}

declare class NavigationService implements $CB.Navigation.INavigationService {
    init(): void;
    init(navContainer: string): void;
    init(navContainer: JQueryStatic): void;
    navigateTo(url: string, requestNew: boolean, viewModel: $CB.Navigation.IViewModel, viewHtml: string, navigatedCallBack: () => void): void;
    navigateTo(url: string, viewModel?: $CB.Navigation.IViewModel, viewHtml?: string): void;
    navigateTo(url: string, navigatedCallBack: () => void): void;

    constructor(navigateContainer: string, option?: $CB.Navigation.INavigationOption);
    constructor(navigateContainer: JQueryStatic, option?: $CB.Navigation.INavigationOption);
    //public static 
}

declare var NavigationServiceAnimationManager: $CB.Navigation.INavigationServiceAnimationManager;
declare var NavigationServiceAnimationConst: $CB.Navigation.INavigationServiceAnimationConst;