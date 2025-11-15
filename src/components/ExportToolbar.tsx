import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, Download, FileJson } from "lucide-react";

type Modifier = {
  id: string;
  name: string;
  price: number;
  max_selections?: number;
  required?: boolean;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  modifiers?: Modifier[];
  dietary_preferences?: string[];
  seasonal?: boolean;
  chef_special?: boolean;
};

interface ExportToolbarProps {
  items: MenuItem[];
  fileBaseName?: string;
}

/**
 * Admin-only export/print controls for the menu.
 * - Print uses the browser print dialog (works for PDF via "Save as PDF").
 * - CSV exports a flat table of core fields, with modifiers and dietary preferences serialized.
 * - JSON exports the raw item objects for portability.
 */
const ExportToolbar: React.FC<ExportToolbarProps> = ({ items, fileBaseName = "menu" }) => {
  const handlePrint = () => {
    // Defer to ensure any UI state settles before print
    setTimeout(() => window.print(), 100);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const headers = [
      "id",
      "name",
      "category",
      "price",
      "available",
      "description",
      "dietary_preferences",
      "modifiers",
      "seasonal",
      "chef_special",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      // Escape quotes and wrap if needed
      const needsWrap = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsWrap ? `"${escaped}"` : escaped;
    };

    const rows = items.map((item) => {
      const modifiersSerialized = JSON.stringify(item.modifiers || []);
      const diet = (item.dietary_preferences || []).join("; ");
      return [
        item.id,
        item.name,
        item.category,
        item.price,
        item.available,
        item.description || "",
        diet,
        modifiersSerialized,
        item.seasonal ? "true" : "false",
        item.chef_special ? "true" : "false",
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${fileBaseName}.csv`);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `${fileBaseName}.json`);
  };

  return (
    <Card className="border-border bg-card no-print">
      <CardHeader>
        <CardTitle>Export / Print Menu</CardTitle>
        <CardDescription>
          Admin tools to print the menu or download as CSV/JSON. Use the browser's "Save as PDF" in the print dialog for PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Menu
          </Button>
          <Button variant="outline" onClick={handleDownloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Button variant="outline" onClick={handleDownloadJSON}>
            <FileJson className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportToolbar;