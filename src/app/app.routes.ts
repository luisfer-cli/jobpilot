import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then((m) => m.DashboardComponent),
  },
  {
    path: "cv",
    loadComponent: () => import("./pages/cv/cv.component").then((m) => m.CvComponent),
  },
  {
    path: "offers",
    loadComponent: () => import("./pages/offers/offers.component").then((m) => m.OffersComponent),
  },
  {
    path: "offers/:id",
    loadComponent: () =>
      import("./pages/offer-detail/offer-detail.component").then((m) => m.OfferDetailComponent),
  },
  {
    path: "tests",
    loadComponent: () => import("./pages/tests/tests.component").then((m) => m.TestsComponent),
  },
  {
    path: "tests/:id",
    loadComponent: () =>
      import("./pages/tests/take-test.component").then((m) => m.TakeTestComponent),
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./pages/settings/settings.component").then((m) => m.SettingsComponent),
  },
];
