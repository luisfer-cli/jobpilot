import { Injectable } from "@angular/core";
import * as pdfMakeImport from "pdfmake/build/pdfmake";
import vfs from "pdfmake/build/vfs_fonts";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { robotoBoldBase64 } from "./roboto-bold";
import { labelsFor } from "./cv-labels";
import type { CoverLetter, GeneratedCv } from "./models";

type PdfMake = typeof pdfMakeImport;

// esbuild envuelve el bundle CommonJS (UMD) de pdfmake bajo `default`.
const pdfMake: PdfMake =
  (pdfMakeImport as { default?: PdfMake }).default ?? pdfMakeImport;

// Añade Roboto-Bold (el bundle de pdfmake solo trae Regular/Medium/Italic)
// para que los textos en negrita se vean realmente en negrita.
pdfMake.addVirtualFileSystem({ ...vfs, "Roboto-Bold.ttf": robotoBoldBase64 });
pdfMake.setFonts({
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Bold.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
});

// Paleta neutra y sobria.
const INK = "#1a1a1a";
const GRAY = "#555555";
const LINE = "#d6d6d6";

const CONTENT_WIDTH = 515;

const normalizeUrl = (url: string): string => {
  const u = url.trim();
  if (!u) return u;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};

const rule = (margin: [number, number, number, number] = [0, 0, 0, 8]): Content => ({
  canvas: [
    {
      type: "line",
      x1: 0,
      y1: 0,
      x2: CONTENT_WIDTH,
      y2: 0,
      lineWidth: 0.7,
      lineColor: LINE,
    },
  ],
  margin,
});

@Injectable({ providedIn: "root" })
export class PdfService {
  private build(doc: TDocumentDefinitions): Promise<number[]> {
    const created = pdfMake.createPdf(doc);
    return created.getBuffer().then((buf) => {
      const bytes = buf as unknown as Uint8Array;
      return Array.from(bytes);
    });
  }

  buildCv(cv: GeneratedCv): Promise<number[]> {
    const labels = labelsFor(cv.language);
    const content: Content[] = [];

    // Cabecera.
    content.push({ text: cv.fullName || labels.resume, style: "name" });
    if (cv.jobTitle) content.push({ text: cv.jobTitle, style: "jobTitle" });

    const contactItems: Content[] = [];
    const addPlain = (v: string) => {
      if (v) contactItems.push(v);
    };
    addPlain(cv.email);
    addPlain(cv.phone);
    addPlain(cv.location);
    if (cv.linkedin) {
      contactItems.push({ text: "LinkedIn", link: normalizeUrl(cv.linkedin), style: "link" });
    }
    if (cv.website) {
      contactItems.push({ text: labels.portfolio, link: normalizeUrl(cv.website), style: "link" });
    }

    if (contactItems.length) {
      const flat: Content[] = [];
      contactItems.forEach((item, i) => {
        if (i > 0) flat.push("   |   ");
        flat.push(item);
      });
      content.push({ text: flat, style: "contact" });
    }

    content.push(rule([0, 2, 0, 12]));

    if (cv.summary) {
      content.push({ text: labels.summary, style: "sectionHeader" });
      content.push(rule());
      content.push({ text: cv.summary, style: "body", margin: [0, 8, 0, 0] });
    }

    if (cv.experiences.length) {
      content.push({ text: labels.experience, style: "sectionHeader" });
      content.push(rule());
      for (const e of cv.experiences) {
        content.push({
          columns: [
            { text: `${e.role || labels.role} — ${e.company || labels.company}`, style: "entryTitle" },
            { text: this.dateRange(e.startDate, e.endDate, e.current, labels.current), style: "date", alignment: "right" },
          ],
          margin: [0, 8, 0, 0],
        });
        if (e.location) {
          content.push({ text: e.location, style: "meta", margin: [0, 1, 0, 0] });
        }
        for (const item of this.asList(e.description)) {
          content.push({ text: `•  ${item}`, style: "body", margin: [8, 3, 0, 0] });
        }
      }
    }

    if (cv.education.length) {
      content.push({ text: labels.education, style: "sectionHeader" });
      content.push(rule());
      for (const e of cv.education) {
        content.push({
          columns: [
            { text: `${e.degree || labels.degree} — ${e.institution || labels.institution}`, style: "entryTitle" },
            { text: this.dateRange(e.startDate, e.endDate, false, labels.current), style: "date", alignment: "right" },
          ],
          margin: [0, 8, 0, 0],
        });
        if (e.field) {
          content.push({ text: e.field, style: "meta", margin: [0, 1, 0, 0] });
        }
      }
    }

    if (cv.skills.length) {
      content.push({ text: labels.skills, style: "sectionHeader" });
      content.push(rule());
      content.push({ text: cv.skills.join(", "), style: "body", margin: [0, 8, 0, 0] });
    }

    if (cv.languages.length) {
      content.push({ text: labels.languages, style: "sectionHeader" });
      content.push(rule());
      content.push({
        text: cv.languages
          .map((l) => (typeof l === "string" ? l : l.level ? `${l.name} (${l.level})` : l.name))
          .join(", "),
        style: "body",
        margin: [0, 8, 0, 0],
      });
    }

    if (cv.certifications.length) {
      content.push({ text: labels.certifications, style: "sectionHeader" });
      content.push(rule());
      content.push({
        text: cv.certifications
          .map((c) => {
            if (typeof c === "string") return c;
            const meta = [c.issuer, c.date].filter(Boolean).join(", ");
            return meta ? `${c.name} (${meta})` : c.name;
          })
          .join(", "),
        style: "body",
        margin: [0, 8, 0, 0],
      });
    }

    if (cv.projects.length) {
      content.push({ text: labels.projects, style: "sectionHeader" });
      content.push(rule());
      for (const p of cv.projects) {
        content.push({ text: p.name, style: "entryTitle", margin: [0, 8, 0, 0] });
        if (p.description) {
          content.push({ text: p.description, style: "body", margin: [0, 4, 0, 0] });
        }
      }
    }

    return this.build({
      pageSize: "A4",
      pageMargins: [40, 44, 40, 44],
      defaultStyle: { font: "Roboto", fontSize: 9.5, color: INK, lineHeight: 1.28 },
      content,
      styles: {
        name: { fontSize: 22, bold: true, color: "#000000", margin: [0, 0, 0, 2] },
        jobTitle: { fontSize: 12, color: GRAY, margin: [0, 0, 0, 6] },
        contact: { fontSize: 8.5, color: GRAY, margin: [0, 0, 0, 6] },
        link: { color: GRAY, decoration: "underline" },
        sectionHeader: { fontSize: 10, bold: true, color: INK, characterSpacing: 1.5, margin: [0, 16, 0, 3] },
        body: { fontSize: 9.5, color: INK },
        meta: { fontSize: 8.5, color: GRAY },
        date: { fontSize: 8.5, color: GRAY },
        entryTitle: { fontSize: 10, bold: true, color: INK },
      },
    });
  }

  buildCoverLetter(letter: CoverLetter): Promise<number[]> {
    const content: Content[] = [];
    if (letter.subject) content.push({ text: letter.subject, style: "name" });
    if (letter.greeting) content.push({ text: letter.greeting, style: "body", margin: [0, 18, 0, 0] });

    for (const para of letter.body.split("\n\n").map((p) => p.trim()).filter(Boolean)) {
      content.push({ text: para, style: "body", margin: [0, 10, 0, 0] });
    }

    if (letter.closing) content.push({ text: letter.closing, style: "body", margin: [0, 18, 0, 0] });

    return this.build({
      pageSize: "A4",
      pageMargins: [50, 50, 50, 50],
      defaultStyle: { font: "Roboto", fontSize: 11, color: INK, lineHeight: 1.45 },
      content,
      styles: {
        name: { fontSize: 18, bold: true, color: INK },
        body: { fontSize: 11, color: INK },
      },
    });
  }

  private dateRange(start: string, end: string, current: boolean, currentLabel: string): string {
    const e = current ? currentLabel : end;
    if (!start && !e) return "";
    if (!start) return e;
    if (!e) return start;
    return `${start} – ${e}`;
  }

  private asList(desc: string | string[]): string[] {
    if (Array.isArray(desc)) return desc;
    if (desc && desc.trim()) return [desc];
    return [];
  }
}
