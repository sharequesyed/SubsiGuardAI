import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def create_docx(file_path):
    doc = Document()

    # Set page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("SubsiGuard: SIH 2026 Final Presentation Delivery Script")
    r_title.font.name = "Arial"
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0, 111, 192) # #006FC0

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Team MineNova6 | Problem Statement SIH26025 (Ministry of Coal)")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(71, 85, 105)
    p_sub.paragraph_format.space_after = Pt(16)

    # Intro
    p_intro = doc.add_paragraph()
    r_intro = p_intro.add_run(
        "This final presentation is exceptionally well-crafted for hackathon judges. "
        "Notice why: it avoids hyperbole, states engineering claims honestly (e.g., acknowledging radar physics, "
        "RF airtime limits, and baseline calibration), and clearly articulates an independent hardware fail-safe that "
        "operates without cloud or ML dependencies.\n\n"
        "Here is your exact 5-to-6 minute presentation delivery blueprint, slide-by-slide verbal script, and how to "
        "seamlessly integrate your live prototype demonstration."
    )
    r_intro.font.name = "Arial"
    r_intro.font.size = Pt(10.5)
    p_intro.paragraph_format.space_after = Pt(14)

    # Section 1: Timing & Structure
    h1 = doc.add_paragraph()
    r_h1 = h1.add_run("Timing & Structure (5–6 Minutes Total)")
    r_h1.font.name = "Arial"
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True
    r_h1.font.color.rgb = RGBColor(31, 73, 125)
    h1.paragraph_format.space_before = Pt(10)
    h1.paragraph_format.space_after = Pt(6)

    timings = [
        ("[0:00 - 0:30]", "Slide 1: Problem Identity & Mission Hook"),
        ("[0:30 - 1:30]", "Slide 2: Monitoring Gap & SubsiGuard Proposed Solution"),
        ("[1:30 - 3:00]", "Slide 3: Technical Architecture & LIVE PROTOTYPE DEMO"),
        ("[3:00 - 4:00]", "Slide 4: Engineering Feasibility & Field Validation"),
        ("[4:00 - 5:00]", "Slide 5: Grounded Impact & Safety Realism"),
        ("[5:00 - 5:30]", "Slide 6: Statutory Standards & Conclusion"),
        ("[5:30 - 8:00]", "Q&A Defense")
    ]
    for t_range, desc in timings:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        r1 = p.add_run(f"{t_range}  ")
        r1.font.name = "Consolas"
        r1.font.size = Pt(10)
        r1.font.bold = True
        r1.font.color.rgb = RGBColor(0, 111, 192)
        r2 = p.add_run(desc)
        r2.font.name = "Arial"
        r2.font.size = Pt(10.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 2: Slide-by-Slide Verbal Script
    h2 = doc.add_paragraph()
    r_h2 = h2.add_run("Slide-by-Slide Verbal Script")
    r_h2.font.name = "Arial"
    r_h2.font.size = Pt(14)
    r_h2.font.bold = True
    r_h2.font.color.rgb = RGBColor(31, 73, 125)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(8)

    # Slide 1
    p_s1_t = doc.add_paragraph()
    r = p_s1_t.add_run("Slide 1: Title Page (0:00 – 0:30)")
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    p_s1_t.paragraph_format.space_after = Pt(4)

    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.left_indent = Inches(0.25)
    p_s1.paragraph_format.space_after = Pt(12)
    r = p_s1.add_run(
        '“Respected judges and panel members, good morning/afternoon. We are Team MineNova6, and today we present SubsiGuard '
        'for Problem Statement SIH26025 under the Ministry of Coal: Development of an AI-enabled, low-cost, real-time mine '
        'subsidence monitoring, prediction, and early warning system for underground coal mines in India.”'
    )
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.italic = True

    # Slide 2
    p_s2_t = doc.add_paragraph()
    r = p_s2_t.add_run("Slide 2: Proposed Solution & The Monitoring Gap (0:30 – 1:30)")
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    p_s2_t.paragraph_format.space_after = Pt(4)

    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.left_indent = Inches(0.25)
    p_s2.paragraph_format.space_after = Pt(6)
    r = p_s2.add_run(
        '“Underground bord-and-pillar and depillaring operations create large subsurface voids. Over time, strata flexure reaches '
        'the surface, endangering communities, railways, and roads above.\n\n'
        'Today’s monitoring methods have clear operational trade-offs:\n'
        '• Satellite InSAR: While radar operates through clouds, orbital revisit intervals and multi-day interferometric processing cannot provide continuous local telemetry during rapid acceleration.\n'
        '• Optical Ground Surveys: Intermittent manual measurements leave days of blindness and expose human surveyors to hazardous tension cracks.\n'
        '• Microseismic & Extensometers: Microseismic captures acoustic fracture energy but lacks direct surface strain measurement, while borehole extensometers are point-specific and site-dependent.\n\n'
        'The Critical Gap Identified: Continuous, real-time surface deformation monitoring above underground mine panels, with localized wireless sensing and offline early warning.\n\n'
        'Our solution, SubsiGuard, deploys an affordable surface mesh of wireless sensor nodes continuously monitoring tilt, vibration, and crack dilation. Crucially, it features a dual-path architecture: advanced hybrid analytics on the gateway, paired with an independent ESP32 threshold fail-safe that sounds local sirens even if the gateway, cloud, or ML layers are completely offline.”'
    )
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.italic = True
    p_s2.paragraph_format.space_after = Pt(12)

    # Slide 3
    p_s3_t = doc.add_paragraph()
    r = p_s3_t.add_run("Slide 3: Technical Approach & The Live Demo (1:30 – 3:00)")
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    p_s3_t.paragraph_format.space_after = Pt(2)

    p_s3_note = doc.add_paragraph()
    r = p_s3_note.add_run("(Deliver the architecture, then transition directly to your live screen)")
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(100, 116, 139)
    p_s3_note.paragraph_format.space_after = Pt(6)

    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.left_indent = Inches(0.25)
    p_s3.paragraph_format.space_after = Pt(8)
    r = p_s3.add_run(
        '“Our technical workflow operates across three integrated pillars:\n'
        '1. Surface Sensing Nodes: Dual-core ESP32s sampling an MPU-6050 and mechanical crack extensometers at 100 Hz, with edge digital filtering producing 1 Hz feature telemetry over India\'s license-exempt 865–868 MHz LoRa band.\n'
        '2. Hybrid Risk Analytics on Gateway: A Random Forest classifier for categorical risk states, combined with a Saito inverse-velocity trend estimator (1/v -> 0) to project potential failure windows under sustained acceleration.\n'
        '3. Spatial Physics & Independent Safety: Calibrated against Knothe’s classical strata flexure profile, while hardware watchdogs trigger direct local sirens with zero network latency.”'
    )
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.italic = True

    p_demo = doc.add_paragraph()
    p_demo.paragraph_format.left_indent = Inches(0.25)
    p_demo.paragraph_format.space_after = Pt(12)
    r = p_demo.add_run("[Seamless Transition to Live Screen — 45-60 seconds]:\n")
    r.font.bold = True
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(0, 111, 192)

    r = p_demo.add_run('“Let us show you this running live in our working prototype environment right now.”\n\n')
    r.font.italic = True
    r.font.size = Pt(10.5)

    r = p_demo.add_run("• Step 1 (Geological Strata): ")
    r.font.bold = True
    r.font.size = Pt(10)
    r = p_demo.add_run("Alt+Tab to http://localhost:5173/. Click \"Start 24h Time-Lapse\".\n")
    r.font.size = Pt(10)
    r = p_demo.add_run('  “Here you see our 2.5D geotechnical simulator modeling 180-meter Barakar sandstone flexure above an active goaf void. Notice how the Knothe inflection point shifts stress to the surface tension cracks, transitioning the alert status from Normal to Critical.”\n\n')
    r.font.italic = True
    r.font.size = Pt(10)

    r = p_demo.add_run("• Step 2 (3D Circuit Rig): ")
    r.font.bold = True
    r.font.size = Pt(10)
    r = p_demo.add_run("Switch to the 3D Circuit Rig sub-tab.\n")
    r.font.size = Pt(10)
    r = p_demo.add_run('  “Here is our active hardware rig: the ESP32 node running our FreeRTOS firmware, reading the MPU-6050 artificial horizon tilt and the crack extensometer dial. Notice this dumper trigger button: our edge filter successfully suppresses transient 15–50 Hz haul truck tremors, preventing false alarms from machinery traffic.”')
    r.font.italic = True
    r.font.size = Pt(10)

    # Slide 4
    p_s4_t = doc.add_paragraph()
    r = p_s4_t.add_run("Slide 4: Feasibility and Viability (3:00 – 4:00)")
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    p_s4_t.paragraph_format.space_after = Pt(2)

    p_s4_note = doc.add_paragraph()
    r = p_s4_note.add_run("(Alt+Tab back to Slide 4)")
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(100, 116, 139)
    p_s4_note.paragraph_format.space_after = Pt(6)

    p_s4 = doc.add_paragraph()
    p_s4.paragraph_format.left_indent = Inches(0.25)
    p_s4.paragraph_format.space_after = Pt(12)
    r = p_s4.add_run(
        '“Operating in open-cast perimeters and remote overburden dumps requires engineering realism:\n'
        '• Weather & Dust Protection: Enclosed in gasketed weatherproof housings with hydrophobic breathable membranes to withstand coal dust and heavy monsoon rainfall.\n'
        '• Mesh Resilience: Custom multi-hop packet forwarding with local SPI flash ring buffers ensures zero data loss during temporary link obstructions.\n'
        '• False Alarm Rejection: Multi-sensor agreement and configurable persistence checks eliminate transient false alarms while keeping the raw hardware watchdog active.\n'
        '• Economics: Our student prototype node has an estimated BOM cost of ₹2,100, making a dense pilot array over active extraction panels economically viable for Coal India subsidiaries.”'
    )
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.italic = True

    # Slide 5
    p_s5_t = doc.add_paragraph()
    r = p_s5_t.add_run("Slide 5: Impact and Benefits (4:00 – 5:00)")
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    p_s5_t.paragraph_format.space_after = Pt(4)

    p_s5 = doc.add_paragraph()
    p_s5.paragraph_format.left_indent = Inches(0.25)
    p_s5.paragraph_format.space_after = Pt(12)
    r = p_s5.add_run(
        '“We ground our impact in practical mining operations:\n'
        '1. Community & Worker Safety: Provides earlier indication of developing ground movement. The local pithead siren serves as the primary alert, while connected gateways push secondary geo-fenced SMS. We maintain technical honesty: abrupt brittle failures may lack precursory creep, making ground response protocols essential.\n'
        '2. Infrastructure Protection: Offline-capable GIS overlays risk contours along critical corridors like National Highways and railway alignments.\n'
        '3. Environmental Tracking: Early identification of tensile ground fissures enables prompt clay sealing before surface fissures can draw atmospheric oxygen into subsurface coal seams.\n'
        '4. Statutory Alignment: Designed to support compliance reporting aligned with DGMS Coal Mines Regulations (CMR 2017) Regulations 111 and 112 for depillaring and development stability.”'
    )
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.italic = True

    # Slide 6
    p_s6_t = doc.add_paragraph()
    r = p_s6_t.add_run("Slide 6: Research and References & Closing (5:00 – 5:30)")
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    p_s6_t.paragraph_format.space_after = Pt(4)

    p_s6 = doc.add_paragraph()
    p_s6.paragraph_format.left_indent = Inches(0.25)
    p_s6.paragraph_format.space_after = Pt(16)
    r = p_s6.add_run(
        '“Every technical premise in SubsiGuard is anchored in statutory regulations and peer-reviewed geotechnical literature:\n'
        '• CMR 2017 Regulations 111 & 112 and the Revised Jharia Master Plan guidelines.\n'
        '• Misa (2023) and Knothe’s classical strata flexure formulations.\n'
        '• Saito (1965) and Fukuzono (1985) inverse-velocity failure mechanics.\n'
        '• Department of Telecommunications (DoT) 2021 WPC rules for 865–868 MHz SRD compliance.\n\n'
        'SubsiGuard combines practical low-cost edge hardware, robust multi-hop LoRa networking, and life-critical fail-safe design. Thank you, and we are ready for your questions.”'
    )
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.italic = True

    # Section 3: Q&A Defense Table
    h3 = doc.add_paragraph()
    r_h3 = h3.add_run("Top Questions Judges Will Ask & How to Defend Your Final Slides")
    r_h3.font.name = "Arial"
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True
    r_h3.font.color.rgb = RGBColor(31, 73, 125)
    h3.paragraph_format.space_before = Pt(12)
    h3.paragraph_format.space_after = Pt(8)

    qna_data = [
        ("Why do you claim LoRa RSSI is not a displacement measure on Slide 3?",
         "“In real mining environments, multi-path reflections off rock faces, coal dust absorption, and antenna orientation cause 10–15 dB signal fluctuations without any physical movement. Claiming millimeter accuracy from RSSI is flawed. Instead, SubsiGuard uses anchored linear displacement extensometers and calibrated tilt sensors for genuine physical measurements.”"),
        ("What happens if the gateway or the Random Forest model crashes?",
         "“Notice our independent fail-safe path on Slide 3: the ESP32 node has hardcoded tilt and strain thresholds running in native firmware. If deformation exceeds critical limits, the node trips its local buzzer/LED and sends an emergency broadcast that triggers the gateway siren directly, completely bypassing ML, software backends, or cloud services.”"),
        ("Why do you state on Slide 5 that there is 'No guaranteed evacuation lead time'?",
         "“Because in mining geotechnics, while ductile strata exhibit tertiary creep acceleration allowing inverse-velocity prediction, massive rigid sandstone roof beams can occasionally undergo sudden, brittle shear failure. Stating an absolute guarantee would be irresponsible engineering. SubsiGuard detects precursory creep when present, but serves to complement—not replace—formal DGMS geotechnical site response plans.”"),
        ("Is your 865–868 MHz LoRa network legal in India?",
         "“Yes, under the Ministry of Communications / WPC Notification G.S.R. 853(E) (December 2021), the 865–868 MHz band is de-licensed for Short Range Devices (SRD) up to 1W EIRP with standard duty cycle compliance.”")
    ]

    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    hdr_cells = table.rows[0].cells
    hdr_cells[0].width = Inches(2.4)
    hdr_cells[1].width = Inches(4.4)

    set_cell_background(hdr_cells[0], "006FC0")
    set_cell_background(hdr_cells[1], "006FC0")

    p0 = hdr_cells[0].paragraphs[0]
    r0 = p0.add_run("Likely Judge Question")
    r0.font.name = "Arial"
    r0.font.size = Pt(10.5)
    r0.font.bold = True
    r0.font.color.rgb = RGBColor(255, 255, 255)

    p1 = hdr_cells[1].paragraphs[0]
    r1 = p1.add_run("Winning Technical Defense")
    r1.font.name = "Arial"
    r1.font.size = Pt(10.5)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(255, 255, 255)

    for q, a in qna_data:
        row_cells = table.add_row().cells
        row_cells[0].width = Inches(2.4)
        row_cells[1].width = Inches(4.4)

        set_cell_background(row_cells[0], "F8FAFC")
        set_cell_background(row_cells[1], "FFFFFF")

        pq = row_cells[0].paragraphs[0]
        rq = pq.add_run(q)
        rq.font.name = "Arial"
        rq.font.size = Pt(10)
        rq.font.bold = True
        rq.font.color.rgb = RGBColor(15, 23, 42)

        pa = row_cells[1].paragraphs[0]
        ra = pa.add_run(a)
        ra.font.name = "Arial"
        ra.font.size = Pt(9.5)
        ra.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Section 4: Pro-Tips for Tomorrow's Presentation
    h4 = doc.add_paragraph()
    r_h4 = h4.add_run("Pro-Tips for Tomorrow's Presentation")
    r_h4.font.name = "Arial"
    r_h4.font.size = Pt(14)
    r_h4.font.bold = True
    r_h4.font.color.rgb = RGBColor(31, 73, 125)
    h4.paragraph_format.space_before = Pt(10)
    h4.paragraph_format.space_after = Pt(6)

    protips = [
        ("Have Two Windows Ready: ", "Window 1: PowerPoint in Full Screen (F5). Window 2: Chrome open to http://localhost:5173/ in fullscreen (F11). Practice the Alt + Tab transition once so it takes less than 2 seconds."),
        ("Highlight the \"Engineering Realism\": ", "Evaluators love when students acknowledge real engineering challenges (airtime limits, dust, lack of false certainty) rather than making unrealistic claims. Your slides do this brilliantly."),
        ("Keep the Delivery Confident: ", "Speak at a steady, measured pace. When showing the 3D circuit rig, point out the dumper vibration filter—faculty evaluators in mining and electronics will immediately recognize its practical value.")
    ]

    for num, (bold_prefix, text_body) in enumerate(protips, start=1):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(5)
        r_num = p.add_run(f"{num}. ")
        r_num.font.name = "Arial"
        r_num.font.size = Pt(10.5)
        r_num.font.bold = True

        r_p = p.add_run(bold_prefix)
        r_p.font.name = "Arial"
        r_p.font.size = Pt(10.5)
        r_p.font.bold = True
        r_p.font.color.rgb = RGBColor(15, 23, 42)

        r_b = p.add_run(text_body)
        r_b.font.name = "Arial"
        r_b.font.size = Pt(10)
        r_b.font.color.rgb = RGBColor(71, 85, 105)

    doc.save(file_path)
    print(f"Docx generated at: {file_path}")

if __name__ == "__main__":
    out_file = r"c:\Shareque Coding\SubsiGuard\SubsiGuard_Pitch_Script_MineNova6.docx"
    create_docx(out_file)
