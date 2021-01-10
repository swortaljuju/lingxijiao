export function getPostCountToLoad(): number {
    const postPerRow = Number(getComputedStyle(document.documentElement)
        .getPropertyValue('--number-posts-per-row'));
    const visiblePostRows = Number(getComputedStyle(document.documentElement)
        .getPropertyValue('--number-visible-post-rows'));
    return Math.max(10, Math.ceil(postPerRow * visiblePostRows));
}
