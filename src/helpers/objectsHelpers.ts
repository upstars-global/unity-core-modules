export const getAllPaths = (() => {
    // @ts-expect-error -- TS7023: 'iterate' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.; TS7006: Parameter 'path' implicitly has an 'any' type.; TS7006:
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

                // @ts-expect-error -- TS2345: Argument of type 'any[]' is not assignable to parameter of type 'never[]'.
                ...iterateObject(value, currentPath),
            ];
        }

        return [
            ...current,
            currentPath.join("."),
        ];
    }

    // @ts-expect-error -- TS7023: 'iterateObject' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.; TS7006: Parameter 'obj' implicitly has an 'any' type.
    function iterateObject(obj, path = []) {
        return Object.entries(obj).reduce(
            iterate.bind(null, path, Array.isArray(obj)),
            [],
        );
    }

    return iterateObject;
})();

// @ts-expect-error -- TS7006: Parameter 'values' implicitly has an 'any' type.
export const concatValues = (values) => Object.values(values).join("");
