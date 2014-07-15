declare module $CB.Navigation {
    interface IViewModel {
        //method for navigation
        onActive?(continueCallback: () => void): void;
        onInactive?(continueCallback: () => void): void;
        OnViewInit?(): void;
        OnViewUnload?(): void;
    }

    interface INavigationService {
        init(): void;
        init(navContainer: string): void;
        init(navContainer: JQueryStatic): void;
        navigateTo(url: string, requestNew: boolean, viewModel: IViewModel, viewHtml: string, navigatedCallBack: () => void): void;
        navigateTo(url: string, viewModel?: IViewModel, viewHtml?: string): void;
        navigateTo(url: string, navigatedCallBack: () => void): void;
    }

    interface NavigationServiceAnimationConst {
        TransformAnimationAttr: string;
        NoTransformAnimationTag: string;
    }

    interface NavigationServiceAnimationManager {
        doNavigateToAnimation(navToContent, finishedCallback: () => void): void;
        doNavigateFromAnimation(navFromContent, finishedCallback: () => void): void;
        toAnimation(content, finishedCallback: () => void): void;
        fromAnimation(content, finishedCallback: () => void): void;
    }
}