export const getAllPaths = (() => {
    function iterate(path, isArray: boolean, current, [ key, value ]) {
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

    function iterateObject(obj, path = []) {
        return Object.entries(obj).reduce(
            iterate.bind(null, path, Array.isArray(obj)),
            [],
        );
    }

    return iterateObject;
})();

export const concatValues = (values) => Object.values(values).join("");
