export type TemplateType = object | string | undefined;

export interface IParams {
    template: TemplateType;
    replaceString: string;
    replaceValue: string;
}

export default ({ template, replaceString, replaceValue }: IParams): TemplateType => {
    const regExp = new RegExp(replaceString, "g");

    if (typeof template === "object") {
        return JSON.parse(JSON.stringify(template).replace(regExp, replaceValue));
    } else if (typeof template === "string") {
        return template.replace(regExp, replaceValue);
    }

    return template;
};
