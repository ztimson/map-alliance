export interface ToolbarItem {
    name: string;
    faicon?: string;
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
