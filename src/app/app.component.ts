import { Component, HostListener, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { SettingsService } from "./core/settings.service";

@Component({
  selector: "app-root",
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  constructor(public settings: SettingsService) {}

  ngOnInit(): void {
    void this.settings.load();
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
