
export function getDefaultPostCountToLoad(): number {
    return Math.max(10, getNumberOfPostPerRow() * 2);
}

export function getNumberOfPostPerRow(): number {
    return Number(getComputedStyle(document.documentElement)
        .getPropertyValue('--number-posts-per-row'));
}
