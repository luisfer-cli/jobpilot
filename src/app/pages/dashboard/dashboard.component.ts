import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DbService } from "../../core/db.service";
import type { JobOffer, OfferStatus } from "../../core/models";

const COLUMNS: OfferStatus[] = ["guardada", "aplicada", "entrevista", "oferta", "rechazada"];
const STATUS_LABELS: Record<OfferStatus, string> = {
  guardada: "Guardada",
  aplicada: "Aplicada",
  entrevista: "Entrevista",
  oferta: "Oferta",
  rechazada: "Rechazada",
};

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, RouterLink],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  columns = COLUMNS;
  statusLabels = STATUS_LABELS;
  offers: JobOffer[] = [];
  dragId: number | null = null;
  dragOverColumn: OfferStatus | null = null;

  constructor(private db: DbService) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.offers = await this.db.listOffers();
  }

  offersBy(status: OfferStatus): JobOffer[] {
    return this.offers.filter((o) => o.status === status);
  }

  onDragStart(event: DragEvent, id: number): void {
    this.dragId = id;
    event.dataTransfer?.setData("text/plain", String(id));
  }

  onDragOver(event: DragEvent, status: OfferStatus): void {
    event.preventDefault();
    this.dragOverColumn = status;
  }

  onDragLeave(): void {
    this.dragOverColumn = null;
  }

  async onDrop(event: DragEvent, status: OfferStatus): Promise<void> {
    event.preventDefault();
    const id = this.dragId ?? Number(event.dataTransfer?.getData("text/plain"));
    this.dragId = null;
    this.dragOverColumn = null;
    if (!id) return;
    await this.db.updateOfferStatus(id, status);
    await this.load();
  }
}
