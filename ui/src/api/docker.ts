export type ContainerID = string;
export type ImageID = string;
export type LogID = string;

export enum ContainerState {
    CREATED = "created",
    DEAD = "dead",
    EXITED = "exited",
    PAUSED = "paused",
    REMOVING = "removing",
    RESTARTING = "restarting",
    RUNNING = "running",
}

export type Container = {
    readonly ID: ContainerID,
    readonly Image: ImageID,
    readonly Command: string,
    readonly CreatedAt: number,
    readonly RunningFor: string,
    readonly Ports: string[],
    readonly State: ContainerState,
    readonly Status: string,
    readonly Size: string,
    readonly Names: string,
    readonly Labels: Map<string, string>,
    readonly Mounts: string[],
    readonly Networks: string[],
    readonly LocalVolumes: string[],
}

export type LogLine = {
    readonly logId: LogID,
    readonly containerId: ContainerID,
    readonly containerName: string,
    readonly message: string
    readonly timestampStr: string,
    readonly timestampInMs: number,
    readonly isStderr: boolean,
}

export const sortContainers = (containers: Container[]): void => {
    containers.sort((c1, c2) => {
        const str1 = c1.Names || c1.ID
        const str2 = c2.Names || c2.ID
        return str1.localeCompare(str2)
    });
}

export const sortLogs = (logs: LogLine[]): void => {
    logs.sort((l1, l2) => l1.timestampStr.localeCompare(l2.timestampStr));
}
