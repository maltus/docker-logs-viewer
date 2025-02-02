import {Container, LogLine} from "../api/docker";

export interface Column {
    id: 'sys' | 'timestamp' | 'container' | 'message';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
}

export const columns: readonly Column[] = [
    {id: 'sys', label: '', minWidth: 40},
    {
        id: 'timestamp',
        label: 'Timestamp',
        minWidth: 220,
        format: (value: number) => new Date(value).toISOString().replaceAll('T', ' ').replaceAll('Z', '')
    },
    {id: 'container', label: 'Container', minWidth: 120},
    {id: 'message', label: 'Message'},
];

// container settings
export interface ContainerSettings {
    readonly container: Container
    followOutput: boolean
    showStdout: boolean
    showStderr: boolean
    showTimestamp: boolean
}

export const CONTAINER_AGGR = {
    ID: '___CONTAINER_AGGR_ID___',
    Names: '[ all ]',
} as Container

export function initContainerSettings(c: Readonly<Container>) {
    return {
        container: c,
        followOutput: true,
        showStdout: true,
        showStderr: true,
        showTimestamp: true,
    } as ContainerSettings;
}

export const initContainerSettingsList = (): ContainerSettings[] => {
    return [initContainerSettings(CONTAINER_AGGR)]
}

export const logFilterPredicate = (logLine: Readonly<LogLine>, cs: Readonly<ContainerSettings>) => {
    const matchesContainer = CONTAINER_AGGR.ID === cs.container.ID || logLine.containerId === cs.container.ID
    const matchesStdOut = cs.showStdout && !logLine.isStderr
    const matchesStdErr = cs.showStderr && logLine.isStderr

    return matchesContainer && (matchesStdOut || matchesStdErr || undefined);
}


export const truncate = (str: string, n: number = 30) => {
    if (!str || str.length <= n)
        return str;

    const subString = str.slice(0, n - 1); // the original check
    return subString.slice(0, subString.lastIndexOf(" ")) + "...";
}
