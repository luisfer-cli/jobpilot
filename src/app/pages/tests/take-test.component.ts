import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DbService } from "../../core/db.service";
import { QUESTION_TYPE_LABELS, parseTechnicalTest } from "../../core/test-utils";
import type { TechnicalTest, TestQuestion } from "../../core/models";

@Component({
  selector: "app-take-test",
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./take-test.component.html",
  styleUrl: "./take-test.component.css",
})
export class TakeTestComponent implements OnInit {
  test: TechnicalTest | null = null;
  typeLabels = QUESTION_TYPE_LABELS;

  answers: Record<number, string | string[]> = {};
  revealed: Record<number, boolean> = {};
  hints: Record<number, boolean> = {};
  allRevealed = false;

  constructor(
    private route: ActivatedRoute,
    private db: DbService,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    const stored = await this.db.getTechnicalTest(id);
    if (stored) {
      this.test = parseTechnicalTest(stored.content);
      this.test.id = stored.id;
    }
  }

  isChoice(q: TestQuestion): boolean {
    return q.questionType === "single_choice" || q.questionType === "true_false";
  }

  isAutoGraded(q: TestQuestion): boolean {
    return (
      q.questionType === "single_choice" ||
      q.questionType === "multiple_choice" ||
      q.questionType === "true_false"
    );
  }

  selectSingle(i: number, opt: string): void {
    this.answers[i] = opt;
  }

  toggleMultiple(i: number, opt: string): void {
    const cur = Array.isArray(this.answers[i]) ? [...(this.answers[i] as string[])] : [];
    const idx = cur.indexOf(opt);
    if (idx >= 0) cur.splice(idx, 1);
    else cur.push(opt);
    this.answers[i] = cur;
  }

  isSelected(i: number, opt: string): boolean {
    const a = this.answers[i];
    return Array.isArray(a) ? a.includes(opt) : a === opt;
  }

  answered(i: number): boolean {
    const a = this.answers[i];
    if (a == null) return false;
    if (Array.isArray(a)) return a.length > 0;
    return String(a).trim().length > 0;
  }

  reveal(i: number): void {
    this.revealed[i] = true;
  }

  toggleHint(i: number): void {
    this.hints[i] = !this.hints[i];
  }

  isCorrect(i: number): boolean {
    if (!this.test) return false;
    const q = this.test.questions[i];
    if (!this.isAutoGraded(q)) return false;
    const correct = q.correctAnswers.map((s) => s.trim()).filter(Boolean);
    const a = this.answers[i];
    if (Array.isArray(a)) {
      const sel = a.map((s) => s.trim()).filter(Boolean).sort();
      return JSON.stringify(sel) === JSON.stringify([...correct].sort());
    }
    return correct.includes(String(a ?? "").trim());
  }

  isOptionCorrect(i: number, opt: string): boolean {
    if (!this.test) return false;
    return this.test.questions[i].correctAnswers.map((s) => s.trim()).includes(opt.trim());
  }

  revealAll(): void {
    if (!this.test) return;
    for (let i = 0; i < this.test.questions.length; i++) this.revealed[i] = true;
    this.allRevealed = true;
  }

  reset(): void {
    this.answers = {};
    this.revealed = {};
    this.hints = {};
    this.allRevealed = false;
  }

  get answeredCount(): number {
    if (!this.test) return 0;
    return this.test.questions.filter((_, i) => this.answered(i)).length;
  }

  get total(): number {
    return this.test ? this.test.questions.length : 0;
  }

  get score(): number {
    if (!this.test) return 0;
    let correct = 0;
    let totalAuto = 0;
    this.test.questions.forEach((q, i) => {
      if (this.isAutoGraded(q)) {
        totalAuto++;
        if (this.isCorrect(i)) correct++;
      }
    });
    return totalAuto ? Math.round((correct / totalAuto) * 100) : 0;
  }

  get correctCount(): number {
    if (!this.test) return 0;
    let c = 0;
    this.test.questions.forEach((q, i) => {
      if (this.isAutoGraded(q) && this.isCorrect(i)) c++;
    });
    return c;
  }

  get autoCount(): number {
    if (!this.test) return 0;
    return this.test.questions.filter((q) => this.isAutoGraded(q)).length;
  }
}
