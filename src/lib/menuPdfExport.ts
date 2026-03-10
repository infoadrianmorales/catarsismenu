import jsPDF from 'jspdf';

interface PdfProduct {
  id: string;
  nombre: string;
  descripcion_corta: string | null;
  precio_usd: number;
  categoria: string;
  imagen_url: string | null;
  activo: boolean | null;
  orden: number | null;
}

interface PdfCategory {
  slug: string;
  nombre: string;
  orden: number;
}

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;
const COL_COUNT = 2;
const COL_GAP = 8;
const COL_W = (CONTENT_W - COL_GAP) / COL_COUNT;
const CARD_H = 52; // height per product card
const IMG_SIZE = 38;

async function loadImageAsDataUrl(url: string, maxSize = 120): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(blob);
    });
  } catch {
    return null;
  }
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const logoModule = await import('@/assets/logo-catarsis.png');
    return loadImageAsDataUrl(logoModule.default, 200);
  } catch {
    return null;
  }
}

function addCoverPage(doc: jsPDF, logo: string | null) {
  // Dark background
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Logo
  if (logo) {
    const logoW = 60;
    const logoH = 60;
    doc.addImage(logo, 'PNG', (PAGE_W - logoW) / 2, 60, logoW, logoH);
  }

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('Menú Catarsis', PAGE_W / 2, logo ? 140 : 120, { align: 'center' });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 161, 170); // zinc-400
  doc.text('Catálogo completo de productos', PAGE_W / 2, logo ? 152 : 135, { align: 'center' });

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(11);
  doc.text(`Generado el ${dateStr}`, PAGE_W / 2, PAGE_H - 30, { align: 'center' });
}

function addPageHeader(doc: jsPDF) {
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, PAGE_W, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Menú Catarsis', MARGIN, 8);
  doc.text(`Página ${doc.getNumberOfPages()}`, PAGE_W - MARGIN, 8, { align: 'right' });
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    addPageHeader(doc);
    return 20;
  }
  return y;
}

function drawProductCard(
  doc: jsPDF,
  product: PdfProduct,
  x: number,
  y: number,
  imageDataUrl: string | null
) {
  // Card background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(x, y, COL_W, CARD_H - 4, 2, 2, 'FD');

  // Image
  const imgX = x + 3;
  const imgY = y + 3;
  const imgS = IMG_SIZE - 6;

  if (imageDataUrl) {
    try {
      doc.addImage(imageDataUrl, 'JPEG', imgX, imgY, imgS, imgS);
    } catch {
      doc.setFillColor(240, 240, 240);
      doc.rect(imgX, imgY, imgS, imgS, 'F');
    }
  } else {
    doc.setFillColor(240, 240, 240);
    doc.rect(imgX, imgY, imgS, imgS, 'F');
    doc.setFontSize(6);
    doc.setTextColor(160, 160, 160);
    doc.text('Sin imagen', imgX + imgS / 2, imgY + imgS / 2, { align: 'center' });
  }

  // Text area
  const textX = imgX + imgS + 4;
  const textW = COL_W - imgS - 14;

  // Name
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  const nameLines = doc.splitTextToSize(product.nombre, textW);
  doc.text(nameLines.slice(0, 2), textX, y + 8);

  // Description
  if (product.descripcion_corta) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const descLines = doc.splitTextToSize(product.descripcion_corta, textW);
    doc.text(descLines.slice(0, 3), textX, y + 8 + nameLines.slice(0, 2).length * 4 + 2);
  }

  // Price
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74); // green-600
  doc.text(`$${product.precio_usd.toFixed(2)}`, textX, y + CARD_H - 10);

  // Inactive badge
  if (!product.activo) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(239, 68, 68); // red-500
    doc.text('INACTIVO', x + COL_W - 5, y + 6, { align: 'right' });
  }
}

export async function generateMenuPdf(
  products: PdfProduct[],
  categories: PdfCategory[],
  onProgress?: (msg: string) => void
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Load logo
  onProgress?.('Cargando logo...');
  const logo = await loadLogoDataUrl();

  // Cover page
  addCoverPage(doc, logo);

  // Pre-load all product images
  onProgress?.('Cargando imágenes de productos...');
  const imageMap = new Map<string, string | null>();
  const imagePromises = products.map(async (p) => {
    if (p.imagen_url) {
      const dataUrl = await loadImageAsDataUrl(p.imagen_url);
      imageMap.set(p.id, dataUrl);
    }
  });
  await Promise.all(imagePromises);

  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => a.orden - b.orden);
  const categoryMap = new Map(sortedCategories.map(c => [c.slug, c]));

  // Group products by category
  const grouped = new Map<string, PdfProduct[]>();
  for (const product of products) {
    const key = product.categoria;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(product);
  }

  // Sort products within each group
  for (const [, prods] of grouped) {
    prods.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  }

  // Build ordered category keys
  const orderedKeys: string[] = [];
  for (const cat of sortedCategories) {
    if (grouped.has(cat.slug)) orderedKeys.push(cat.slug);
  }
  // Add uncategorized
  for (const key of grouped.keys()) {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  }

  // Render categories
  for (const catKey of orderedKeys) {
    const catProducts = grouped.get(catKey) || [];
    if (catProducts.length === 0) continue;

    const catInfo = categoryMap.get(catKey);
    const catName = catInfo?.nombre || catKey;

    onProgress?.(`Generando sección: ${catName}...`);

    // New page for each category
    doc.addPage();
    addPageHeader(doc);

    // Category header
    let y = 20;
    doc.setFillColor(24, 24, 27);
    doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(catName.toUpperCase(), MARGIN + 6, y + 8.5);

    // Product count
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(`${catProducts.length} producto${catProducts.length !== 1 ? 's' : ''}`, PAGE_W - MARGIN - 6, y + 8.5, { align: 'right' });

    y += 18;

    // Render products in 2-column grid
    for (let i = 0; i < catProducts.length; i += COL_COUNT) {
      y = ensureSpace(doc, y, CARD_H);

      for (let col = 0; col < COL_COUNT; col++) {
        const idx = i + col;
        if (idx >= catProducts.length) break;

        const product = catProducts[idx];
        const x = MARGIN + col * (COL_W + COL_GAP);
        drawProductCard(doc, product, x, y, imageMap.get(product.id) || null);
      }

      y += CARD_H;
    }
  }

  // Save
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`menu-catarsis-${dateStr}.pdf`);

  return {
    totalProducts: products.length,
    totalCategories: orderedKeys.length,
    failedImages: products.filter(p => p.imagen_url && !imageMap.get(p.id)).length,
  };
}
