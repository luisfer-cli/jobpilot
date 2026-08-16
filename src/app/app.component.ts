import { Component, HostListener, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { SettingsService } from "./core/settings.service";
import { I18nService } from "./core/i18n.service";
import { UpdaterService } from "./core/updater.service";
import { TranslatePipe } from "./core/translate.pipe";
import { ConfirmDialogComponent } from "./components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-root",
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    ConfirmDialogComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  constructor(
    public settings: SettingsService,
    private i18n: I18nService,
    private updater: UpdaterService,
  ) {}

  ngOnInit(): void {
    void this.settings.load();
    void this.i18n.load();
    void this.updater.checkForUpdates();
  }

  @HostListener("window:keydown", ["$event"])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      if (event.shiftKey) {
        void this.settings.toggleSidebarHidden();
      } else {
        void this.settings.toggleSidebarCollapse();
      }
    }
  }
}
