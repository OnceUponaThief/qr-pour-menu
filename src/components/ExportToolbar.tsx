import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, Download, FileJson, FileDown } from "lucide-react";
import jsPDF from "jspdf";

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
  brandName?: string;
  logoUrl?: string | null;
}

/**
 * Admin-only export/print controls for the menu.
 * - Print uses the browser print dialog (works for PDF via "Save as PDF").
 * - CSV exports a flat table of core fields, with modifiers and dietary preferences serialized.
 * - JSON exports the raw item objects for portability.
 */
const ExportToolbar: React.FC<ExportToolbarProps> = ({ items, fileBaseName = "menu", brandName = "Menu", logoUrl }) => {
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

  const loadImageDataUrl = async (url?: string | null): Promise<string | undefined> => {
    if (!url) return undefined;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(blob);
      });
    } catch {
      return undefined;
    }
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header background (brand bar)
    doc.setFillColor(0, 17, 34); // dark brand bar
    doc.rect(0, 0, pageWidth, 80, "F");

    // Optional logo
    const logoDataUrl = await loadImageDataUrl(logoUrl || undefined);
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", 24, 16, 48, 48);
      } catch {}
    }

    // Brand title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(`${brandName} — Menu`, 90, 45);

    // Small generated date in header
    doc.setFontSize(10);
    doc.text(new Date().toLocaleString(), pageWidth - 160, 24);

    let y = 100;
    const lineHeight = 18;
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);

    // Group items by category for nicer layout
    const groups: Record<string, MenuItem[]> = {};
    items.forEach((it) => {
      const key = (it.category || "").toString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(it);
    });

    const categories = Object.keys(groups).sort();

    const addFooter = (pageNum: number) => {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${pageNum}`, pageWidth - 60, pageHeight - 20);
    };

    let pageNum = 1;
    addFooter(pageNum);

    for (const cat of categories) {
      // Category heading
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 255); // brand blue
      doc.text(cat.toUpperCase(), 24, y);
      y += lineHeight;
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(12);

      for (const item of groups[cat]) {
        const name = item.name || "Unnamed";
        const price = typeof item.price === "number" ? `₹${item.price.toFixed(2)}` : "";
        const seasonal = item.seasonal ? " • Seasonal" : "";
        const chef = item.chef_special ? " • Chef Special" : "";
        const line = `${name} ${price}${seasonal}${chef}`;
        doc.text(line, 32, y);
        y += lineHeight;

        // If near bottom, add page
        if (y > pageHeight - 60) {
          doc.addPage();
          pageNum += 1;
          addFooter(pageNum);
          // repaint header bar on new page for consistency
          doc.setFillColor(0, 17, 34);
          doc.rect(0, 0, pageWidth, 80, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(20);
          doc.text(`${brandName} — Menu`, 24, 45);
          doc.setFontSize(12);
          doc.setTextColor(20, 20, 20);
          y = 100;
        }
      }

      y += 8; // slight spacing between categories
    }

    doc.save(`${fileBaseName}.pdf`);
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
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportToolbar;