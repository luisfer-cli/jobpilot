import { CommonModule } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import { ConfirmService } from "../../core/confirm.service";
import { TranslatePipe } from "../../core/translate.pipe";

@Component({
  selector: "app-confirm-dialog",
  imports: [CommonModule, TranslatePipe],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.css",
})
export class ConfirmDialogComponent {
  constructor(public confirmService: ConfirmService) {}

  get options() {
    return this.confirmService.options;
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.confirmService.resolve(false);
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.confirmService.resolve(false);
  }
}
