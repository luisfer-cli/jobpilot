import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import type { Certification, GeneratedCv, Language } from "../../core/models";

export interface ContactItem {
  text?: string;
  label?: string;
  link?: string;
}

@Component({
  selector: "app-cv-preview",
  imports: [CommonModule],
  templateUrl: "./cv-preview.component.html",
  styleUrl: "./cv-preview.component.css",
})
export class CvPreviewComponent {
  @Input() cv!: GeneratedCv;

  get contactItems(): ContactItem[] {
    const items: ContactItem[] = [];
    if (this.cv.email) items.push({ text: this.cv.email });
    if (this.cv.phone) items.push({ text: this.cv.phone });
    if (this.cv.location) items.push({ text: this.cv.location });
    if (this.cv.linkedin) items.push({ label: "LinkedIn", link: this.normalizeUrl(this.cv.linkedin) });
    if (this.cv.website) items.push({ label: "Portafolio", link: this.normalizeUrl(this.cv.website) });
    return items;
  }

  normalizeUrl(url: string): string {
    const u = url.trim();
    if (!u) return u;
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  }

  asList(desc: string | string[]): string[] {
    if (Array.isArray(desc)) return desc;
    if (desc && desc.trim()) return [desc];
    return [];
  }

  dateRange(start: string, end: string, current: boolean): string {
    const e = current ? "Actualidad" : end;
    if (!start && !e) return "";
    if (!start) return e;
    if (!e) return start;
    return `${start} – ${e}`;
  }

  formatLanguages(langs: (Language | string)[]): string {
    return langs
      .map((l) => (typeof l === "string" ? l : l.level ? `${l.name} (${l.level})` : l.name))
      .join(", ");
  }

  formatCertifications(certs: (Certification | string)[]): string {
    return certs
      .map((c) => {
        if (typeof c === "string") return c;
        const meta = [c.issuer, c.date].filter(Boolean).join(", ");
        return meta ? `${c.name} (${meta})` : c.name;
      })
      .join(", ");
  }
}
