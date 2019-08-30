export interface ToolbarItem {
    name: string;
    faicon?: string;
    icon?: string;
    hidden?: boolean;
    toggle?: boolean;
    individualToggle?: boolean;
    click?: (item?: ToolbarItem) => void;
    enabled?: boolean;
    onEnabled?: (item?: ToolbarItem) => void;
    onDisabled?: (item?: ToolbarItem) => void;
    subMenu?: ToolbarItem[];
}
