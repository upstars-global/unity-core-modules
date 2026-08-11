export const getAllPaths = (() => {
    function iterate(
        path: string[],
        isArray: boolean,
        current: string[],
        [ key, value ]: [string, unknown],
    ): string[] {
        const currentPath = [ ...path ];
        if (isArray) {
            currentPath.push(`${currentPath.pop()}[${key}]`);
        } else {
            currentPath.push(key);
        }
        if (typeof value === "object" && value !== null) {
            return [
                ...current,
                ...iterateObject(value, currentPath),
            ];
        }

        return [
            ...current,
            currentPath.join("."),
        ];
    }

    function iterateObject(obj: object, path: string[] = []): string[] {
        return Object.entries(obj).reduce(
            iterate.bind(null, path, Array.isArray(obj)),
            [] as string[],
        );
    }

    return iterateObject;
})();

export const concatValues = (values: object) => Object.values(values).join("");
