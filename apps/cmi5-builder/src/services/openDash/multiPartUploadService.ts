import io, { Socket } from "socket.io-client";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";

export enum AllowedNamespaces {
  UPLOADS = "uploads",
  COURSES = "courses",
}

export interface UploadServiceDeps {
  baseUrl: string;
  token: string;
}

export class UploadService {
  private baseUrl: string;
  private token: string;
  private socket!: Socket;
  private reauthInterval: NodeJS.Timeout | null = null;

  constructor({ baseUrl, token }: UploadServiceDeps) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async getToken(): Promise<string> {
    // In the future, insert refresh logic if needed
    return this.token;
  }

  private connectSocket(namespace: AllowedNamespaces) {
    this.socket = io(`${this.baseUrl}/${namespace}`, {
      path: "/service-arch-ws/websocket",
      auth: { token: this.token },
      timeout: 60000,
      transports: ["websocket"],
      reconnection: true,
      autoConnect: false,
      rejectUnauthorized:
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] === "0" ? false : true,
    });

    this.socket.on("error", console.error);
    this.socket.on("connect_error", console.error);

    this.reauthInterval = setInterval(async () => {
      if (this.socket.connected) {
        this.socket.emit("auth", await this.getToken());
      }
    }, 30000);

    this.socket.connect();
  }

  private disconnectSocket() {
    if (this.reauthInterval) clearInterval(this.reauthInterval);
    if (this.socket) this.socket.close();
  }

  public async upload({
    namespace = AllowedNamespaces.UPLOADS,
    labId = null,
    filePaths,
  }: {
    namespace?: AllowedNamespaces;
    labId?: string | null;
    filePaths: string[];
  }): Promise<{ dirpath: string; filename: string }[]> {
    this.connectSocket(namespace);

    const results: { dirpath: string; filename: string }[] = [];

    for (const filepath of filePaths) {
      console.log(`Uploading file: ${filepath}`);
      const { dirpath, filename } = await this.startFileUpload(
        filepath,
        path.parse(filepath).base,
        labId
      );
      results.push({ dirpath, filename });
    }

    this.disconnectSocket();
    return results;
  }

  private async startFileUpload(
    filepath: string,
    filename: string,
    labID: string | null
  ): Promise<{ dirpath: string; filename: string }> {
    const chunksize = 900000;
    const filesize = fs.statSync(filepath).size;

    console.log(`File size: ${humanFileSize(filesize)}`);
    const hash = this.generateChecksum(filepath, chunksize, filesize);
    console.log(`Checksum: ${hash}`);

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "uploadRequest",
        { filename, courseId: labID },
        hash,
        async (dirpath: string, exists: boolean) => {
          if (exists) {
            console.log("File already exists on server.");
            return resolve({ dirpath, filename });
          }

          const coveredChunks = await new Promise<number[][]>((res) =>
            this.socket.emit("queryRange", dirpath, 0, filesize, (_: any, cov: number[][]) => res(cov))
          );

          const missingChunks = [...Array(Math.ceil(filesize / chunksize)).keys()]
            .map((x) => x * chunksize)
            .filter((x) =>
              !isRangeCovered([x, Math.min(x + chunksize, filesize)], coveredChunks)
            );

          const fd = fs.openSync(filepath, "r+");
          let buf = Buffer.alloc(chunksize);
          try {
            for (let i = 0; i < missingChunks.length; i++) {
              const offset = missingChunks[i];
              if (filesize - offset < chunksize)
                buf = Buffer.alloc(filesize - offset);

              fs.readSync(fd, buf, 0, buf.byteLength, offset);
              await new Promise((res) =>
                this.socket.emit("uploadChunk", dirpath, buf, offset, res)
              );

              if (i % 5 === 0) {
                const percent = ((offset + buf.byteLength) / filesize) * 100;
                process.stdout.write(`Progress: ${percent.toFixed(1)}%\x1b[0G`);
              }
            }
          } catch (err) {
            return reject(err);
          } finally {
            fs.closeSync(fd);
          }

          await new Promise((r) => setTimeout(r, 100));

          this.socket.emit("uploadComplete", dirpath, filename, (errComplete: any) => {
            if (errComplete) return reject(new Error(errComplete));
            console.log(`Upload complete for ${filename}`);
            resolve({ dirpath, filename });
          });
        }
      );
    });
  }

  private generateChecksum(filepath: string, chunksize: number, filesize: number): string {
    const hashSum = createHash("sha256");
    const fd = fs.openSync(filepath, "r+");
    let buf = Buffer.alloc(chunksize);

    try {
      for (let offset = 0; offset < filesize; offset += chunksize) {
        if (filesize - offset < chunksize)
          buf = Buffer.alloc(filesize - offset);
        fs.readSync(fd, buf, 0, buf.byteLength, offset);
        hashSum.update(buf);
      }
    } finally {
      fs.closeSync(fd);
    }

    return hashSum.digest("hex");
  }
}

// Helpers
function isRangeCovered(a: number[], b: number[][]): boolean {
  return b.some((bx) => {
    const ix = getSimpleIntersection(a, bx);
    return ix[0] === a[0] && ix[1] === a[1];
  });
}

function getSimpleIntersection(a: number[], b: number[]): number[] {
  const startMax = Math.max(a[0], b[0]);
  const endMin = Math.min(a[1], b[1]);
  return startMax < endMin ? [startMax, endMin] : [];
}

function humanFileSize(size: number): string {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}
