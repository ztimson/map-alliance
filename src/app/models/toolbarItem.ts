export interface ToolbarItem {
    name: string;
    icon?: string;
    hidden?: boolean;
    toggle?: boolean;
    individualToggle?: boolean;
    click?: () => void;
    enabled?: boolean;
    onEnabled?: () => void;
    onDisabled?: () => void;
    subMenu?: ToolbarItem[];
}
