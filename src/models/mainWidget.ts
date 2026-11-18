export enum Widgets {
    rocketMart = "rocketMart",
    adventures = "adventures",
    lootBox = "lootBox",
    quest = "quest",
    activityHub = "activityHub"
}

export interface MainWidgetItem {
    name: string;
    image: string;
    type: Widgets;
    counter?: number;
    isNew?: boolean;
    frontend_identifier?: string; // used if a quest is shown in the widget
    isActivePage?: boolean;
    hidden?: boolean;
}

export interface IMainWidgetConfigItem {
    name: string;
    type: string;
    image: string;
    previewImage?: string;
    isNew?: boolean;
    hidden?: boolean;
}

export interface IMainWidgetConfig {
    preview?: string[];
    widgets: IMainWidgetConfigItem[];
}

export default {};
