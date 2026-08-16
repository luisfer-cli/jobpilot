import { Injectable, signal } from "@angular/core";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdaterStatus =
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "installed"
  | "error";

@Injectable({ providedIn: "root" })
export class UpdaterService {
  readonly status = signal<UpdaterStatus>("idle");
  readonly checking = signal(false);
  readonly downloading = signal(false);
  readonly progress = signal(0);
  readonly availableVersion = signal("");

  private pending: Update | null = null;
  private contentLength = 0;
  private downloaded = 0;

  async checkForUpdates(): Promise<void> {
    if (this.checking() || this.downloading()) return;
    this.checking.set(true);
    this.status.set("checking");
    try {
      const update = await check();
      this.pending = update ?? null;
      if (update) {
        this.availableVersion.set(update.version);
        this.status.set("available");
      } else {
        this.status.set("up-to-date");
      }
    } catch {
      this.status.set("error");
    } finally {
      this.checking.set(false);
    }
  }

  async downloadAndInstall(): Promise<void> {
    if (!this.pending || this.downloading()) return;
    this.downloading.set(true);
    this.status.set("downloading");
    this.contentLength = 0;
    this.downloaded = 0;
    this.progress.set(0);
    try {
      await this.pending.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            this.contentLength = event.data.contentLength ?? 0;
            this.progress.set(0);
            break;
          case "Progress":
            this.downloaded += event.data.chunkLength ?? 0;
            if (this.contentLength > 0) {
              this.progress.set(
                Math.min(99, Math.round((this.downloaded / this.contentLength) * 100)),
              );
            }
            break;
          case "Finished":
            this.progress.set(100);
            break;
        }
      });
      this.status.set("installed");
      await relaunch();
    } catch {
      this.status.set("error");
    } finally {
      this.downloading.set(false);
    }
  }
}
