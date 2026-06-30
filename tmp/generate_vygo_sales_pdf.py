from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "vygo-kit-commerciale-2026.pdf"
IMG = ROOT / "docs" / "assets" / "marketing"
BRAND = ROOT / "docs" / "assets" / "brand-render-clean"
TMP_ASSETS = ROOT / "tmp" / "pdf-sales-assets"

W, H = A4

CYAN = colors.HexColor("#12c6df")
BLUE = colors.HexColor("#0b67b7")
NAVY = colors.HexColor("#07111f")
INK = colors.HexColor("#111827")
MUTED = colors.HexColor("#536174")
PALE = colors.HexColor("#ecfbff")
LINE = colors.HexColor("#dbe7ee")
GREEN = colors.HexColor("#16a34a")
ORANGE = colors.HexColor("#f59e0b")
RED = colors.HexColor("#dc2626")
WHITE = colors.white


def pstyle(size=11, leading=None, color=INK, bold=False, align=0):
    return ParagraphStyle(
        "s",
        fontName="Helvetica-Bold" if bold else "Helvetica",
        fontSize=size,
        leading=leading or size * 1.25,
        textColor=color,
        alignment=align,
        spaceAfter=0,
    )


def paragraph(c, text, x, y, w, size=11, color=INK, bold=False, leading=None, align=0):
    para = Paragraph(text.replace("\n", "<br/>"), pstyle(size, leading, color, bold, align))
    _, h = para.wrap(w, 1000)
    para.drawOn(c, x, y - h)
    return y - h


def cover_image(c, path, x, y, w, h, opacity=1):
    reader = ImageReader(str(prepared_photo(path)))
    iw, ih = reader.getSize()
    scale = max(w / iw, h / ih)
    dw = iw * scale
    dh = ih * scale
    dx = x + (w - dw) / 2
    dy = y + (h - dh) / 2
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    try:
        c.setFillAlpha(opacity)
    except Exception:
        pass
    c.drawImage(reader, dx, dy, dw, dh, preserveAspectRatio=True, mask="auto")
    c.restoreState()


def prepared_photo(path):
    TMP_ASSETS.mkdir(parents=True, exist_ok=True)
    source = Path(path)
    target = TMP_ASSETS / f"{source.stem}-compressed.jpg"
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return target
    with Image.open(source) as img:
        img = img.convert("RGB")
        img.thumbnail((1700, 1700), Image.Resampling.LANCZOS)
        img.save(target, "JPEG", quality=84, optimize=True, progressive=True)
    return target


def logo(c, x, y, w=72 * mm):
    path = BRAND / "vygo-logo-horizontal-render-clean-1600.png"
    reader = ImageReader(str(path))
    iw, ih = reader.getSize()
    h = w * ih / iw
    c.drawImage(reader, x, y - h, w, h, mask="auto")
    return h


def footer(c, page):
    c.setStrokeColor(colors.Color(1, 1, 1, alpha=0))
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(18 * mm, 10 * mm, "Vygo - www.vy-go.com")
    c.drawRightString(W - 18 * mm, 10 * mm, str(page))


def title(c, overline, heading, body=None, dark=False):
    color = WHITE if dark else INK
    sub = colors.HexColor("#bdefff") if dark else CYAN
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(sub)
    c.drawString(18 * mm, H - 22 * mm, overline.upper())
    y = paragraph(c, heading, 18 * mm, H - 31 * mm, W - 36 * mm, 26, color, True, 31)
    if body:
        paragraph(c, body, 18 * mm, y - 5 * mm, W - 36 * mm, 11.5, colors.HexColor("#d7edf5") if dark else MUTED, False, 15)


def chip(c, text, x, y, fill=PALE, stroke=LINE, color=INK):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.roundRect(x, y - 7 * mm, stringWidth(text, "Helvetica-Bold", 8) + 9 * mm, 7 * mm, 3 * mm, stroke=1, fill=1)
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 4 * mm, y - 4.7 * mm, text)


def bullet(c, text, x, y, w, accent=CYAN):
    c.setFillColor(accent)
    c.circle(x + 2 * mm, y - 3.4 * mm, 1.4 * mm, stroke=0, fill=1)
    return paragraph(c, text, x + 7 * mm, y, w - 7 * mm, 10.5, INK, False, 13.5)


def card(c, x, y, w, h, heading, body, accent=CYAN):
    c.setFillColor(WHITE)
    c.setStrokeColor(LINE)
    c.roundRect(x, y - h, w, h, 4 * mm, stroke=1, fill=1)
    c.setFillColor(accent)
    c.roundRect(x, y - 3 * mm, w, 3 * mm, 4 * mm, stroke=0, fill=1)
    paragraph(c, heading, x + 6 * mm, y - 10 * mm, w - 12 * mm, 12, INK, True, 14)
    paragraph(c, body, x + 6 * mm, y - 25 * mm, w - 12 * mm, 9.5, MUTED, False, 12)


def page_cover(c):
    cover_image(c, IMG / "vygo-scena-08-finale-flotta.png", 0, 0, W, H)
    c.saveState()
    c.setFillColor(colors.Color(0.02, 0.05, 0.1, alpha=0.76))
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.restoreState()
    logo(c, 18 * mm, H - 18 * mm, 58 * mm)
    c.setFont("Helvetica-Bold", 42)
    c.setFillColor(WHITE)
    c.drawString(18 * mm, 154 * mm, "Move. Manage.")
    c.setFillColor(CYAN)
    c.drawString(18 * mm, 138 * mm, "Succeed.")
    paragraph(c, "Il centro operativo per aziende di trasporto e logistica che vogliono controllare scadenze, documenti, guasti, check, chat e costi da un unico posto.", 18 * mm, 121 * mm, 114 * mm, 15, colors.HexColor("#d8f5ff"), False, 20)
    chip(c, "Dashboard azienda", 18 * mm, 84 * mm, colors.HexColor("#0d3142"), colors.HexColor("#23566b"), WHITE)
    chip(c, "App iOS/Android", 66 * mm, 84 * mm, colors.HexColor("#0d3142"), colors.HexColor("#23566b"), WHITE)
    chip(c, "Centro costi", 110 * mm, 84 * mm, colors.HexColor("#0d3142"), colors.HexColor("#23566b"), WHITE)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(18 * mm, 42 * mm, "Meno rincorse. Piu controllo. Piu margine.")
    c.setFont("Helvetica", 10)
    c.drawString(18 * mm, 32 * mm, "www.vy-go.com")


def page_problem(c):
    title(c, "Il problema", "Le aziende non perdono solo documenti. Perdono controllo.")
    cover_image(c, IMG / "vygo-scena-01-imprenditore-stress.png", 18 * mm, 32 * mm, 78 * mm, 94 * mm)
    x = 106 * mm
    y = 246 * mm
    paragraph(c, "Nella giornata reale di una flotta, le informazioni importanti finiscono ovunque: telefono, chat, email, cartelle, Excel e memoria delle persone.", x, y, 82 * mm, 12.5, INK, True, 16)
    y = 210 * mm
    for text in [
        "Scadenze rincorse all ultimo minuto.",
        "Guasti segnalati in chat e difficili da ritrovare.",
        "Documenti caricati male o cercati quando serve mostrarli subito.",
        "Costi di riparazione non collegati a targa, autista o periodo.",
        "Telefonate continue tra ufficio, autisti e magazzino.",
    ]:
        y = bullet(c, text, x, y, 82 * mm)
        y -= 4 * mm
    c.setFillColor(NAVY)
    c.roundRect(106 * mm, 36 * mm, 82 * mm, 40 * mm, 4 * mm, stroke=0, fill=1)
    paragraph(c, "Domanda da fare al cliente", 112 * mm, 66 * mm, 70 * mm, 9, CYAN, True, 11)
    paragraph(c, "Se domani vuole sapere quali mezzi hanno generato piu costi negli ultimi sei mesi, lo trova in pochi minuti?", 112 * mm, 58 * mm, 70 * mm, 12, WHITE, True, 15)


def page_solution(c):
    title(c, "La soluzione", "Una dashboard per capire cosa richiede attenzione oggi.")
    cover_image(c, IMG / "vygo-scena-03-dashboard-soluzione.png", 18 * mm, 136 * mm, 174 * mm, 74 * mm)
    y = 119 * mm
    w = 52 * mm
    h = 42 * mm
    card(c, 18 * mm, y, w, h, "Scadenze", "Patenti, CQC, visite, revisioni e assicurazioni diventano pratiche da lavorare.", CYAN)
    card(c, 78 * mm, y, w, h, "Guasti e check", "Segnalazioni collegate a persona, mezzo, foto, stato, costo e archivio.", ORANGE)
    card(c, 138 * mm, y, w, h, "Costi", "Spese, multe e interventi filtrati per targa, autista o periodo.", GREEN)
    paragraph(c, "Vygo non sostituisce per forza il gestionale trasporti: diventa il centro operativo quotidiano per quello che spesso oggi viene rincorso a mano.", 18 * mm, 58 * mm, 174 * mm, 13, MUTED, False, 17, 1)


def page_app(c):
    title(c, "App personale", "Autisti, ufficio e magazzino lavorano dal telefono.")
    cover_image(c, IMG / "vygo-scena-06-app-telefono.png", 108 * mm, 42 * mm, 80 * mm, 174 * mm)
    y = 222 * mm
    paragraph(c, "L app deve essere semplice: poche azioni, sempre collegate all azienda.", 18 * mm, y, 76 * mm, 14, INK, True, 18)
    y = 184 * mm
    for text in [
        "Check giornaliero del mezzo o dello strumento.",
        "Guasto con foto, gravita, targa e semirimorchio opzionale.",
        "Documenti personali da caricare, rinnovare e mostrare.",
        "Chat con azienda, gruppi e reparti.",
        "Notifiche push per messaggi, solleciti e criticita.",
    ]:
        y = bullet(c, text, 18 * mm, y, 76 * mm)
        y -= 5 * mm
    c.setFillColor(PALE)
    c.setStrokeColor(LINE)
    c.roundRect(18 * mm, 36 * mm, 76 * mm, 34 * mm, 4 * mm, stroke=1, fill=1)
    paragraph(c, "Per l autista non deve sembrare un gestionale. Deve sembrare uno strumento rapido per fare la cosa giusta al momento giusto.", 24 * mm, 60 * mm, 64 * mm, 11, INK, True, 14)


def page_documents(c):
    title(c, "Documenti e scadenze", "Da promemoria a pratica completa.")
    rows = [
        ("1", "Avviso", "La scadenza entra in dashboard e nelle notifiche."),
        ("2", "Dettaglio", "L azienda vede persona o mezzo, documento, data e stato."),
        ("3", "Sollecito", "Se serve, invia una richiesta guidata all utente."),
        ("4", "Rinnovo", "Si carica il nuovo file e si inserisce la nuova data."),
        ("5", "Storico", "La criticita sparisce dai lavori aperti e resta archiviata."),
    ]
    y = 224 * mm
    for num, head, body in rows:
        c.setFillColor(CYAN if num != "5" else GREEN)
        c.circle(28 * mm, y - 6 * mm, 6 * mm, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(28 * mm, y - 9 * mm, num)
        paragraph(c, head, 42 * mm, y, 44 * mm, 13, INK, True, 15)
        paragraph(c, body, 92 * mm, y, 88 * mm, 10.5, MUTED, False, 13)
        y -= 30 * mm
    c.setFillColor(NAVY)
    c.roundRect(18 * mm, 34 * mm, 174 * mm, 32 * mm, 4 * mm, stroke=0, fill=1)
    paragraph(c, "Valore percepito", 24 * mm, 56 * mm, 45 * mm, 9, CYAN, True, 11)
    paragraph(c, "Il cliente non vede una data in calendario: vede una pratica completa, con responsabile, file, sollecito e storico.", 70 * mm, 57 * mm, 110 * mm, 12, WHITE, True, 15)


def page_costs(c):
    title(c, "Centro costi", "Dove la flotta smette di essere una sensazione e diventa un numero.")
    cover_image(c, IMG / "vygo-scena-07-report-costi.png", 18 * mm, 152 * mm, 174 * mm, 58 * mm)
    data = [
        ("Guasti", "Costo riparazione, foto, targa, stato e archivio."),
        ("Manutenzioni", "Spese libere collegate a mezzo, muletto o attrezzatura."),
        ("Sanzioni", "Importi per autista, targa, periodo e classifica multe."),
        ("Report", "CSV, stampa A4 e filtri per periodo, categoria o asset."),
    ]
    y = 128 * mm
    for i, (head, body) in enumerate(data):
        x = 18 * mm + (i % 2) * 88 * mm
        yy = y - (i // 2) * 42 * mm
        card(c, x, yy, 82 * mm, 36 * mm, head, body, [CYAN, GREEN, ORANGE, BLUE][i])
    c.setFillColor(PALE)
    c.setStrokeColor(LINE)
    c.roundRect(18 * mm, 20 * mm, 174 * mm, 24 * mm, 4 * mm, stroke=1, fill=1)
    paragraph(c, "Frase chiave: non sai solo quanto hai speso, sai per quale targa, quale autista, quale periodo e quale motivo.", 24 * mm, 38.5 * mm, 162 * mm, 12.5, INK, True, 15, 1)


def page_chat(c):
    title(c, "Chat aziendale", "Comunicazioni operative, non messaggi dispersi.")
    cover_image(c, IMG / "vygo-scena-02-autista-difficolta.png", 18 * mm, 124 * mm, 76 * mm, 96 * mm)
    x = 106 * mm
    y = 220 * mm
    paragraph(c, "La chat non deve essere solo un posto dove scrivere. Deve aiutare l azienda a non perdere il contesto.", x, y, 82 * mm, 13, INK, True, 17)
    y = 178 * mm
    for text in [
        "Chat singole con autisti, ufficio e magazzino.",
        "Gruppi per reparti e comunicazioni operative.",
        "Foto, video, audio, reazioni e conferme lettura.",
        "Notifiche push e contatori non letti.",
        "Nome, ruolo e foto di chi scrive nei gruppi.",
    ]:
        y = bullet(c, text, x, y, 82 * mm)
        y -= 4 * mm
    c.setFillColor(NAVY)
    c.roundRect(18 * mm, 36 * mm, 174 * mm, 42 * mm, 4 * mm, stroke=0, fill=1)
    paragraph(c, "Differenza rispetto a WhatsApp", 25 * mm, 66 * mm, 70 * mm, 9, CYAN, True, 11)
    paragraph(c, "WhatsApp fa parlare. Vygo collega comunicazioni, persone, reparti, notifiche, documenti, guasti e storico operativo.", 25 * mm, 57 * mm, 154 * mm, 12, WHITE, True, 15)


def page_pricing(c):
    title(c, "Piani", "Prezzi pensati per il valore reale che portiamo.")
    plans = [
        ("Start 5", "300 euro/mese", "5 mezzi, 3 strumenti, 10 account, 10 GB."),
        ("Fleet 10", "450 euro/mese", "10 mezzi, 5 strumenti, 20 account, 20 GB."),
        ("Fleet 20", "650 euro/mese", "20 mezzi, 10 strumenti, 40 account, 30 GB."),
        ("Fleet 30", "850 euro/mese", "30 mezzi, 15 strumenti, 60 account, 50 GB."),
        ("Fleet 50", "1.200 euro/mese", "50 mezzi, 25 strumenti, 100 account, 75 GB."),
    ]
    y = 220 * mm
    for name, price, desc in plans:
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.roundRect(18 * mm, y - 20 * mm, 174 * mm, 17 * mm, 3 * mm, stroke=1, fill=1)
        paragraph(c, name, 24 * mm, y - 8 * mm, 35 * mm, 12, INK, True, 13)
        paragraph(c, price + " + IVA", 66 * mm, y - 8 * mm, 46 * mm, 11, BLUE, True, 13)
        paragraph(c, desc, 118 * mm, y - 8 * mm, 66 * mm, 9.5, MUTED, False, 12)
        y -= 24 * mm
    paragraph(c, "Moduli opzionali", 18 * mm, 86 * mm, 90 * mm, 15, INK, True, 18)
    card(c, 18 * mm, 73 * mm, 53 * mm, 32 * mm, "Chat", "+100 euro/mese + IVA", CYAN)
    card(c, 78 * mm, 73 * mm, 53 * mm, 32 * mm, "Centro costi", "+150 euro/mese + IVA", GREEN)
    card(c, 138 * mm, 73 * mm, 53 * mm, 32 * mm, "Report", "+250 euro/mese + IVA", BLUE)
    paragraph(c, "Start-up kit: 1.500 euro una tantum + IVA. Storage extra: 20GB 49 euro/mese, 50GB 99 euro/mese, 100GB 179 euro/mese.", 18 * mm, 30 * mm, 174 * mm, 10.5, MUTED, False, 13, 1)


def page_close(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    cover_image(c, IMG / "vygo-scena-04-finale-sorriso.png", 0, 106 * mm, W, 191 * mm, 0.78)
    c.saveState()
    c.setFillColor(colors.Color(0.02, 0.05, 0.1, alpha=0.42))
    c.rect(0, 106 * mm, W, 191 * mm, stroke=0, fill=1)
    c.restoreState()
    logo(c, 18 * mm, 282 * mm, 50 * mm)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(18 * mm, 96 * mm, "Il punto non e avere")
    c.setFillColor(CYAN)
    c.drawString(18 * mm, 82 * mm, "un programma in piu.")
    paragraph(c, "Il punto e aprire Vygo e sapere subito cosa richiede attenzione prima che diventi un problema.", 18 * mm, 64 * mm, 150 * mm, 15, colors.HexColor("#d8f5ff"), False, 20)
    c.setFillColor(CYAN)
    c.roundRect(18 * mm, 28 * mm, 66 * mm, 13 * mm, 4 * mm, stroke=0, fill=1)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(51 * mm, 32.5 * mm, "Richiedi una demo")
    c.setFillColor(colors.HexColor("#d8f5ff"))
    c.setFont("Helvetica", 10)
    c.drawString(18 * mm, 18 * mm, "www.vy-go.com")


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    pages = [
        page_cover,
        page_problem,
        page_solution,
        page_app,
        page_documents,
        page_costs,
        page_chat,
        page_pricing,
        page_close,
    ]
    for i, fn in enumerate(pages, 1):
        if fn is not page_cover and fn is not page_close:
            c.setFillColor(colors.HexColor("#f8fbfd"))
            c.rect(0, 0, W, H, stroke=0, fill=1)
        fn(c)
        if fn is not page_cover and fn is not page_close:
            footer(c, i)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
