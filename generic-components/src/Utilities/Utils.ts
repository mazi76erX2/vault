export function shouldForwardProp(key: PropertyKey, toExcludeKeys: string[]) {
    for (const toExcludeKey of toExcludeKeys) {
        if (toExcludeKey === key) {
            return false;
        }
    }
    return true;
}
