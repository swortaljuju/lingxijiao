export function getPostCountToLoad(isInitialLoad: boolean): number {
    if (isInitialLoad) {
        return 30;
    } else {
        return 10;
    }
}
