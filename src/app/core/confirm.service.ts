import { Injectable, signal } from "@angular/core";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: "root" })
export class ConfirmService {
  readonly options = signal<ConfirmOptions | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this.options.set(options);
    });
  }

  resolve(value: boolean): void {
    this.options.set(null);
    if (this.resolver) {
      const r = this.resolver;
      this.resolver = null;
      r(value);
    }
  }
}
