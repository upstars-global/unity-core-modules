// @ts-expect-error -- TS7006: Parameter 'val' implicitly has an 'any' type.
export default function (val) {
    return val
        .replace(/,/g, ".") // меняем точки на запятые
        .replace(/\.(?=.*\.)/g, "") // убираем все точки, кроме последней
        .replace(/[^0-9.]/g, "") // убираем все символы, кроме цифр и точек
        .replace(/^0+(?=\d)/, ""); // убираем нули в начале строки
}
