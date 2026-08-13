// @ts-expect-error -- TS7006: Parameter 'item' implicitly has an 'any' type.
export const getGameImagePath = (item) => {
    return `/some-bucket/i/s3/${ item }.png`;
};
