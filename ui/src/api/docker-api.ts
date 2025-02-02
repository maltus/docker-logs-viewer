import {createDockerDesktopClient} from "@docker/extension-api-client";
import {Container, LogLine} from "./docker";
import {v7 as uuidv7} from 'uuid';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const DD_CLIENT = createDockerDesktopClient();

export class DockerApi {

    public static async getAllContainers(): Promise<Container[]> {
        const args = ['--all', '--format', '"{{json .}}"'];

        const result = await DD_CLIENT.docker.cli.exec('ps', args);
        return result.parseJsonLines().map(containerJson => {
            return containerJson as Container;
        });
    }

    public static async getContainerLogs(container: Container, callback: (current: LogLine) => void): Promise<void> {
        const args = ["-ft", container.ID];

        await DD_CLIENT.docker.cli.exec("logs", args, {
            stream: {
                onOutput(data) {
                    const line = data.stdout ? data.stdout : data.stderr;

                    if (line) {
                        const [timestampStr, ...others] = line.split(" ");
                        const logMessage = {
                            logId: uuidv7(),
                            containerId: container.ID,
                            containerName: container.Names,
                            timestampStr: timestampStr.trim(),
                            timestampInMs: new Date(timestampStr.trim()).getTime(),
                            message: others.join(" ").trim(),
                            isStderr: (data.stderr != undefined)
                        } as LogLine;

                        callback(logMessage);
                    }
                },
                onError(error) {
                    DD_CLIENT.desktopUI.toast.error(`Unexpected error: ${error}`)
                    console.error(error);
                },
                onClose(exitCode) {
                    // console.log(`exit code on close: ${exitCode}`);
                },
                splitOutputLines: true,
            },
        });
    }
}
