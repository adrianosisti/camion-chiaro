from __future__ import annotations

import html
import re
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
LEGAL_DIR = ROOT / "docs" / "legal"
OUT_DIR = LEGAL_DIR / "finali"
LOGO = ROOT / "public" / "brand" / "vygo-logo-horizontal.png"

CYAN = colors.HexColor("#13C7DF")
NAVY = colors.HexColor("#12232C")
CHARCOAL = colors.HexColor("#46555D")
TEXT = colors.HexColor("#1C262C")
LIGHT_CYAN = colors.HexColor("#E8FBFE")
LIGHT_GRAY = colors.HexColor("#F4F6F8")
MID_GRAY = colors.HexColor("#D9E1E7")

SOURCE_FILES = [
    "01-contratto-saas-b2b-vygo.md",
    "02-condizioni-generali-vygo.md",
    "03-dpa-vygo.md",
    "04-ordine-commerciale-vygo.md",
    "05-accordo-pilota-vygo.md",
    "06-checklist-legale-vygo.md",
]


def parse_markdown(md_text: str):
    blocks = []
    paragraph = []

    def flush():
        nonlocal paragraph
        if paragraph:
            blocks.append(("p", " ".join(paragraph)))
            paragraph = []

    for raw in md_text.splitlines():
        line = raw.strip()
        if not line:
            flush()
            continue
        if line.startswith("#"):
            flush()
            level = len(line) - len(line.lstrip("#"))
            blocks.append((f"h{level}", line[level:].strip()))
        elif line.startswith("- [ ]"):
            flush()
            blocks.append(("check", line[5:].strip()))
        elif line.startswith("- "):
            flush()
            blocks.append(("bullet", line[2:].strip()))
        else:
            paragraph.append(line)
    flush()
    return blocks


def rich(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"(\[[^\]]+\])", r"<i><font color='#46555D'>\1</font></i>", escaped)
    return escaped


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            "VygoTitle",
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=25,
            textColor=NAVY,
            alignment=TA_CENTER,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoSubtitle",
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=13,
            textColor=CHARCOAL,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoH1",
            fontName="Helvetica-Bold",
            fontSize=14.5,
            leading=18,
            textColor=NAVY,
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoH2",
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=CHARCOAL,
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoBody",
            fontName="Helvetica",
            fontSize=9.8,
            leading=12.2,
            textColor=TEXT,
            alignment=TA_LEFT,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoSmall",
            fontName="Helvetica",
            fontSize=8.2,
            leading=10.5,
            textColor=CHARCOAL,
            spaceAfter=2,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoCallout",
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=NAVY,
            spaceAfter=0,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoMetaLabel",
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=8,
            textColor=CHARCOAL,
            alignment=TA_CENTER,
        )
    )
    styles.add(
        ParagraphStyle(
            "VygoMetaValue",
            fontName="Helvetica-Bold",
            fontSize=8.2,
            leading=10,
            textColor=NAVY,
            alignment=TA_CENTER,
        )
    )
    return styles


def header_footer(canvas, doc, title: str):
    canvas.saveState()
    width, height = A4
    if LOGO.exists():
        canvas.drawImage(str(LOGO), 16 * mm, height - 16 * mm, width=34 * mm, height=8.5 * mm, preserveAspectRatio=True, mask="auto")
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(CHARCOAL)
    canvas.drawString(54 * mm, height - 12.5 * mm, title[:88])
    canvas.setStrokeColor(MID_GRAY)
    canvas.line(16 * mm, height - 18 * mm, width - 16 * mm, height - 18 * mm)
    canvas.setFont("Helvetica", 7.2)
    canvas.drawString(16 * mm, 10 * mm, "Vygo - documento riservato - bozza da validare legalmente")
    canvas.drawRightString(width - 16 * mm, 10 * mm, f"Pagina {doc.page}")
    canvas.restoreState()


def logo_flowable():
    if not LOGO.exists():
        return Spacer(1, 1)
    img = Image(str(LOGO))
    img._restrictSize(70 * mm, 24 * mm)
    return img


def metadata_table(styles):
    rows = [
        [
            Paragraph("VERSIONE", styles["VygoMetaLabel"]),
            Paragraph("USO", styles["VygoMetaLabel"]),
            Paragraph("DATA", styles["VygoMetaLabel"]),
            Paragraph("STATO", styles["VygoMetaLabel"]),
        ],
        [
            Paragraph("Bozza operativa", styles["VygoMetaValue"]),
            Paragraph("Revisione legale", styles["VygoMetaValue"]),
            Paragraph(date.today().strftime("%d/%m/%Y"), styles["VygoMetaValue"]),
            Paragraph("Non definitiva", styles["VygoMetaValue"]),
        ],
    ]
    table = Table(rows, colWidths=[42 * mm] * 4, hAlign="CENTER")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_CYAN),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#BFEFF6")),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#BFEFF6")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return table


def callout(text: str, styles, fill=LIGHT_GRAY):
    table = Table([[Paragraph(rich(text), styles["VygoCallout"])]], colWidths=[178 * mm], hAlign="CENTER")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), fill),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#C9D3DA")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


def signature_table(styles):
    data = [
        [Paragraph("<b>Cliente</b>", styles["VygoBody"]), Paragraph("<b>Fornitore</b>", styles["VygoBody"])],
        [Paragraph("Nome e qualifica: ___________________________", styles["VygoSmall"]), Paragraph("Nome e qualifica: ___________________________", styles["VygoSmall"])],
        [Paragraph("Data: ______________________________________", styles["VygoSmall"]), Paragraph("Data: ______________________________________", styles["VygoSmall"])],
        [Paragraph("Firma: _____________________________________", styles["VygoSmall"]), Paragraph("Firma: _____________________________________", styles["VygoSmall"])],
    ]
    table = Table(data, colWidths=[86 * mm, 86 * mm], hAlign="CENTER")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_CYAN),
                ("BOX", (0, 0), (-1, -1), 0.7, MID_GRAY),
                ("INNERGRID", (0, 0), (-1, -1), 0.45, MID_GRAY),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def blocks_to_story(blocks, styles):
    story = []
    signature_seen = False
    for kind, text in blocks:
        if kind == "h1":
            continue
        if kind == "h2":
            heading_key = re.sub(r"^\d+\.\s*", "", text.lower().strip())
            signature_seen = heading_key in {"firma", "firme"}
            story.append(Paragraph(rich(text), styles["VygoH1"]))
            continue
        if kind == "h3":
            story.append(Paragraph(rich(text), styles["VygoH2"]))
            continue
        if kind == "p":
            if text.upper().startswith("BOZZA"):
                story.append(callout(text, styles, fill=LIGHT_CYAN))
                story.append(Spacer(1, 4))
                continue
            if signature_seen and text in {"Cliente:", "Fornitore:", "Data:", "Firma:"}:
                continue
            story.append(Paragraph(rich(text), styles["VygoBody"]))
            continue
        if kind in {"bullet", "check"}:
            prefix = "Da compilare: " if kind == "check" else ""
            item = ListItem(Paragraph(rich(prefix + text), styles["VygoBody"]), leftIndent=14, bulletColor=CYAN)
            story.append(ListFlowable([item], bulletType="bullet", start=None, leftIndent=14, bulletFontName="Helvetica", bulletFontSize=7))
    if any(kind == "h2" and re.sub(r"^\d+\.\s*", "", text.lower().strip()) in {"firma", "firme"} for kind, text in blocks):
        story.append(Spacer(1, 8))
        story.append(signature_table(styles))
    return story


def build_pdf(source: Path) -> Path:
    styles = build_styles()
    blocks = parse_markdown(source.read_text(encoding="utf-8"))
    title = next((text for kind, text in blocks if kind == "h1"), source.stem)
    out = OUT_DIR / f"{source.stem}.pdf"
    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=23 * mm,
        bottomMargin=16 * mm,
        title=title,
        author="Vygo",
        subject="Pacchetto contrattuale Vygo",
    )
    story = [
        logo_flowable(),
        Spacer(1, 7),
        Paragraph(rich(title), styles["VygoTitle"]),
        Paragraph("Pacchetto contrattuale Vygo", styles["VygoSubtitle"]),
        metadata_table(styles),
        Spacer(1, 10),
        callout("Documento preparatorio: usare per revisione con avvocato, consulente privacy o cliente pilota. Non usare come parere legale definitivo.", styles),
        Spacer(1, 6),
    ]
    story.extend(blocks_to_story(blocks, styles))
    doc.build(story, onFirstPage=lambda c, d: header_footer(c, d, title), onLaterPages=lambda c, d: header_footer(c, d, title))
    return out


def build_index(generated: list[Path]) -> Path:
    styles = build_styles()
    out = OUT_DIR / "00-indice-pacchetto-legale-vygo.pdf"
    title = "Pacchetto legale Vygo"
    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=23 * mm,
        bottomMargin=16 * mm,
        title=title,
        author="Vygo",
    )
    story = [
        logo_flowable(),
        Spacer(1, 7),
        Paragraph(title, styles["VygoTitle"]),
        Paragraph("Documenti per pilota, clienti paganti e revisione professionale", styles["VygoSubtitle"]),
        metadata_table(styles),
        Spacer(1, 10),
        callout("Questo pacchetto raccoglie bozze operative. Prima dell'uso commerciale vanno validate da professionisti abilitati.", styles, fill=LIGHT_CYAN),
        Paragraph("Documenti inclusi", styles["VygoH1"]),
    ]
    for item in generated:
        story.append(Paragraph(f"<b>{html.escape(item.name)}</b>", styles["VygoBody"]))
    story.append(Paragraph("Uso consigliato", styles["VygoH1"]))
    for line in [
        "Accordo pilota per test gratuiti o agevolati.",
        "Ordine commerciale + contratto SaaS + condizioni generali per clienti paganti.",
        "DPA privacy da allegare quando vengono trattati dati personali dei dipendenti del cliente.",
        "Checklist legale da consegnare ad avvocato e consulente privacy.",
    ]:
        story.append(Paragraph(html.escape(line), styles["VygoBody"]))
    doc.build(story, onFirstPage=lambda c, d: header_footer(c, d, title), onLaterPages=lambda c, d: header_footer(c, d, title))
    return out


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = [build_pdf(LEGAL_DIR / filename) for filename in SOURCE_FILES]
    build_index(generated)
    print("Generated PDFs:")
    for path in sorted(OUT_DIR.glob("*.pdf")):
        print(path)


if __name__ == "__main__":
    main()
