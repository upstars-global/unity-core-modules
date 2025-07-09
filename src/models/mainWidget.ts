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

export default {};
