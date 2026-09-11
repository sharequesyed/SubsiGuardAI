import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_path):
    prs = Presentation()
    # Exact 20 inch x 11.25 inch (16:9 widescreen)
    prs.slide_width = Inches(20.0)
    prs.slide_height = Inches(11.25)
    blank_layout = prs.slide_layouts[6]

    # Clean assets
    base_brain = r"C:\Users\Admin\.gemini\antigravity-ide\brain\9262dede-4126-4e2a-b0e1-539e19132896"
    sih_logo_path = os.path.join(base_brain, r"scratch\clean_assets\clean_sih_logo.png")
    sih_watermark_path = os.path.join(base_brain, r"scratch\clean_assets\clean_sih_watermark.png")
    knothe_diag_path = os.path.join(base_brain, r"scratch\diagrams\strata_knothe_profile.png")
    saito_diag_path = os.path.join(base_brain, r"scratch\diagrams\saito_prediction_curve.png")
    workflow_diag_path = os.path.join(base_brain, r"scratch\diagrams\workflow_mindmap.png")
    hw_diag_path = os.path.join(base_brain, r"scratch\diagrams\hardware_architecture_schematic.png")

    # Colors
    c_blue_primary = RGBColor(0, 111, 192)      # #006FC0 (official SIH blue)
    c_navy_dark = RGBColor(31, 73, 125)         # #1F497D (official SIH navy)
    c_purple_team = RGBColor(92, 45, 145)       # #5C2D91 (team oval outline)
    c_card_bg = RGBColor(248, 250, 252)         # #F8FAFC
    c_card_border = RGBColor(203, 213, 225)     # #CBD5E1
    c_red_alert = RGBColor(220, 38, 38)         # #DC2626
    c_green_success = RGBColor(22, 163, 74)     # #16A34A
    c_white = RGBColor(255, 255, 255)
    c_text_dark = RGBColor(15, 23, 42)          # #0F172A
    c_text_muted = RGBColor(71, 85, 105)        # #475569

    def add_header_footer(slide, slide_num, title_text):
        # Top Left Team Oval Badge (slides 2 to 6)
        if slide_num > 1:
            oval = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.8), Inches(0.35), Inches(2.2), Inches(1.1))
            oval.fill.solid()
            oval.fill.fore_color.rgb = c_white
            oval.line.color.rgb = c_purple_team
            oval.line.width = Pt(2.5)
            tf = oval.text_frame
            tf.word_wrap = True
            p1 = tf.paragraphs[0]
            p1.text = "TEAM"
            p1.alignment = PP_ALIGN.CENTER
            p1.font.name = "Arial"
            p1.font.size = Pt(13)
            p1.font.bold = True
            p1.font.color.rgb = c_purple_team
            p2 = tf.add_paragraph()
            p2.text = "MineNova6"
            p2.alignment = PP_ALIGN.CENTER
            p2.font.name = "Arial"
            p2.font.size = Pt(15)
            p2.font.bold = True
            p2.font.color.rgb = c_purple_team

        # Top Center Title
        title_box = slide.shapes.add_textbox(Inches(3.2), Inches(0.4), Inches(13.0), Inches(1.1))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_t = tf_title.paragraphs[0]
        p_t.text = title_text
        p_t.alignment = PP_ALIGN.CENTER
        p_t.font.name = "Times New Roman"
        p_t.font.size = Pt(36)
        p_t.font.bold = True
        p_t.font.color.rgb = c_navy_dark

        # Top Right SIH 2026 Logo (clean white background)
        if os.path.exists(sih_logo_path):
            slide.shapes.add_picture(sih_logo_path, Inches(16.6), Inches(0.3), width=Inches(2.8))

        # Bottom Footer Bar (Blue Banner)
        footer = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(10.5), Inches(20.0), Inches(0.75))
        footer.fill.solid()
        footer.fill.fore_color.rgb = c_blue_primary
        footer.line.fill.background()

        # Footer Text Center
        tx_f = slide.shapes.add_textbox(Inches(5.0), Inches(10.55), Inches(10.0), Inches(0.65))
        p_f = tx_f.text_frame.paragraphs[0]
        p_f.text = "@SIH Idea submission- Template"
        p_f.alignment = PP_ALIGN.CENTER
        p_f.font.name = "Arial"
        p_f.font.size = Pt(15)
        p_f.font.bold = True
        p_f.font.color.rgb = c_white

        # Footer Slide Number Right
        tx_num = slide.shapes.add_textbox(Inches(18.2), Inches(10.55), Inches(1.4), Inches(0.65))
        p_n = tx_num.text_frame.paragraphs[0]
        p_n.text = str(slide_num)
        p_n.alignment = PP_ALIGN.RIGHT
        p_n.font.name = "Arial"
        p_n.font.size = Pt(16)
        p_n.font.bold = True
        p_n.font.color.rgb = c_white

    # ==========================================
    # SLIDE 1: TITLE PAGE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)

    # Top Header
    h1 = s1.shapes.add_textbox(Inches(1.2), Inches(0.45), Inches(14.5), Inches(0.9))
    p_h1 = h1.text_frame.paragraphs[0]
    p_h1.text = "SMART INDIA HACKATHON 2026"
    p_h1.font.name = "Garamond"
    p_h1.font.size = Pt(44)
    p_h1.font.bold = True
    p_h1.font.color.rgb = c_navy_dark

    # Title Page Sub-Center
    sub_tp = s1.shapes.add_textbox(Inches(1.2), Inches(1.45), Inches(14.5), Inches(0.8))
    p_sub = sub_tp.text_frame.paragraphs[0]
    p_sub.text = "TITLE PAGE"
    p_sub.font.name = "Times New Roman"
    p_sub.font.size = Pt(36)
    p_sub.font.bold = True
    p_sub.font.color.rgb = RGBColor(0, 0, 0)

    # Right Watermark Graphic (Clean white transparent)
    if os.path.exists(sih_watermark_path):
        s1.shapes.add_picture(sih_watermark_path, Inches(12.5), Inches(1.7), width=Inches(6.8))

    # Top Right SIH Logo
    if os.path.exists(sih_logo_path):
        s1.shapes.add_picture(sih_logo_path, Inches(16.5), Inches(0.4), width=Inches(2.9))

    # Left Card containing Title Page Details
    card_s1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.55), Inches(11.4), Inches(7.55))
    card_s1.fill.solid()
    card_s1.fill.fore_color.rgb = c_card_bg
    card_s1.line.color.rgb = c_card_border
    card_s1.line.width = Pt(1.5)

    tf_s1 = card_s1.text_frame
    tf_s1.word_wrap = True
    tf_s1.margin_left = Inches(0.6)
    tf_s1.margin_right = Inches(0.6)
    tf_s1.margin_top = Inches(0.5)

    entries = [
        ("Problem Statement ID :", "26025"),
        ("Problem Statement Title :", "AI/IoT-Powered Ground Subsidence Monitoring & Early Warning System for Coal Mining Areas"),
        ("Theme :", "Smart Mining, Disaster Management & Industrial Safety"),
        ("PS Category :", "Hardware / Software (Integrated Hybrid Solution)"),
        ("Organization :", "Ministry of Coal / Coal India Limited (CIL)"),
        ("Team Name :", "MineNova6"),
        ("Team ID :", "[SIH2026-TEAM-MN6] (Internal College Round Evaluation)")
    ]

    for idx, (label, val) in enumerate(entries):
        p = tf_s1.paragraphs[0] if idx == 0 else tf_s1.add_paragraph()
        p.space_after = Pt(13)
        run1 = p.add_run()
        run1.text = f"•  {label} "
        run1.font.name = "Arial"
        run1.font.size = Pt(20)
        run1.font.bold = True
        run1.font.color.rgb = c_navy_dark

        run2 = p.add_run()
        run2.text = val
        run2.font.name = "Arial"
        run2.font.size = Pt(20)
        run2.font.bold = (label in ["Problem Statement ID :", "Team Name :"])
        run2.font.color.rgb = c_text_dark

    # Footer for slide 1
    footer1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(10.5), Inches(20.0), Inches(0.75))
    footer1.fill.solid()
    footer1.fill.fore_color.rgb = c_blue_primary
    footer1.line.fill.background()

    tx_f1 = s1.shapes.add_textbox(Inches(5.0), Inches(10.55), Inches(10.0), Inches(0.65))
    p_f1 = tx_f1.text_frame.paragraphs[0]
    p_f1.text = "@SIH Idea submission- Template"
    p_f1.alignment = PP_ALIGN.CENTER
    p_f1.font.name = "Arial"
    p_f1.font.size = Pt(15)
    p_f1.font.bold = True
    p_f1.font.color.rgb = c_white

    tx_num1 = s1.shapes.add_textbox(Inches(18.2), Inches(10.55), Inches(1.4), Inches(0.65))
    p_n1 = tx_num1.text_frame.paragraphs[0]
    p_n1.text = "1"
    p_n1.alignment = PP_ALIGN.RIGHT
    p_n1.font.name = "Arial"
    p_n1.font.size = Pt(16)
    p_n1.font.bold = True
    p_n1.font.color.rgb = c_white


    # ==========================================
    # SLIDE 2: PROPOSED SOLUTION & THE CRITICAL GAP
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_footer(s2, 2, "SubsiGuard: Autonomous IoT & Edge AI Early Warning System")

    sh2 = s2.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(18.4), Inches(0.6))
    p_sh2 = sh2.text_frame.paragraphs[0]
    p_sh2.text = "❖ Proposed Solution (Describe your Idea / Solution / Prototype)"
    p_sh2.font.name = "Arial"
    p_sh2.font.size = Pt(22)
    p_sh2.font.bold = True
    p_sh2.font.color.rgb = c_blue_primary
    p_sh2.font.underline = True

    # Left Column: Existing Solutions & Limitations
    c_left = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.35), Inches(9.0), Inches(5.9))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = c_card_bg
    c_left.line.color.rgb = RGBColor(239, 68, 68)
    c_left.line.width = Pt(2.0)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True
    tf_l.margin_left = Inches(0.4)
    tf_l.margin_right = Inches(0.4)
    tf_l.margin_top = Inches(0.4)

    p_lh = tf_l.paragraphs[0]
    p_lh.text = "EXISTING SOLUTIONS & LIMITATIONS"
    p_lh.font.name = "Arial"
    p_lh.font.size = Pt(20)
    p_lh.font.bold = True
    p_lh.font.color.rgb = c_red_alert
    p_lh.space_after = Pt(14)

    left_bullets = [
        ("Satellite InSAR & Remote Sensing", "12-day orbital revisit latency; blind to sudden rapid sinkhole drops and obscured during heavy monsoon cloud cover."),
        ("Total Station Optical Ground Survey", "Manual and periodic (weekly/monthly); surveyors are physically exposed to active ground fissures, tension cracks, and void hazards."),
        ("Micro-Seismic Monitoring Arrays", "High capex (> ₹50 Lakhs per panel) with heavy power consumption; blind to slow continuous plastic strata creep and non-seismic deformations."),
        ("Borehole Rod Extensometers", "Single-point measurement with extreme drilling costs; vulnerable to deep shear shear-off before critical alarms can be triggered.")
    ]
    for title, desc in left_bullets:
        p = tf_l.add_paragraph()
        p.space_after = Pt(11)
        r1 = p.add_run()
        r1.text = f"• {title}: "
        r1.font.name = "Arial"
        r1.font.size = Pt(16.5)
        r1.font.bold = True
        r1.font.color.rgb = c_text_dark
        r2 = p.add_run()
        r2.text = desc
        r2.font.name = "Arial"
        r2.font.size = Pt(15.5)
        r2.font.color.rgb = c_text_muted

    # Right Column: SubsiGuard Solution
    c_right = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.2), Inches(2.35), Inches(9.0), Inches(5.9))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = c_card_bg
    c_right.line.color.rgb = RGBColor(16, 185, 129)
    c_right.line.width = Pt(2.0)
    tf_r = c_right.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = Inches(0.4)
    tf_r.margin_right = Inches(0.4)
    tf_r.margin_top = Inches(0.4)

    p_rh = tf_r.paragraphs[0]
    p_rh.text = "SUBSIGUARD: AUTONOMOUS IOT SOLUTION"
    p_rh.font.name = "Arial"
    p_rh.font.size = Pt(20)
    p_rh.font.bold = True
    p_rh.font.color.rgb = c_green_success
    p_rh.space_after = Pt(14)

    right_bullets = [
        ("1 Hz Continuous Surface Telemetry", "Synchronized MPU-6050 dual-axis inclination (±0.05° precision) and linear crack extensometers continuously recording ground deformation."),
        ("Edge AI Saito Inverse-Velocity Prediction", "Real-time failure forecasting running on-chip (1/v -> 0); calculates exact Time-to-Failure (Tf) hours ahead of ground collapse."),
        ("Ultra Low-Cost Resilient Mesh Architecture", "Sub-₹2,500 per node with 868MHz long-range LoRa P2P mesh; solar MPPT + LiFePO4 battery ensuring 35-day uninterrupted off-grid autonomy."),
        ("Autonomous Fail-Safe Life Safety Dispatch", "Direct hardwired relay trip to pithead sirens (<100ms) with zero cloud dependency, backed by localized multi-lingual SMS evacuation geo-fencing.")
    ]
    for title, desc in right_bullets:
        p = tf_r.add_paragraph()
        p.space_after = Pt(11)
        r1 = p.add_run()
        r1.text = f"• {title}: "
        r1.font.name = "Arial"
        r1.font.size = Pt(16.5)
        r1.font.bold = True
        r1.font.color.rgb = c_text_dark
        r2 = p.add_run()
        r2.text = desc
        r2.font.name = "Arial"
        r2.font.size = Pt(15.5)
        r2.font.color.rgb = c_text_muted

    # Bottom Bridge Banner: The Critical Gap (Single sentence as requested)
    gap_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(8.55), Inches(18.4), Inches(1.6))
    gap_box.fill.solid()
    gap_box.fill.fore_color.rgb = RGBColor(254, 242, 242)
    gap_box.line.color.rgb = c_red_alert
    gap_box.line.width = Pt(2.0)

    tf_gap = gap_box.text_frame
    tf_gap.word_wrap = True
    tf_gap.margin_left = Inches(0.5)
    tf_gap.margin_right = Inches(0.5)
    tf_gap.margin_top = Inches(0.2)

    p_gh = tf_gap.paragraphs[0]
    p_gh.alignment = PP_ALIGN.CENTER
    r_gt = p_gh.add_run()
    r_gt.text = "THE CRITICAL GAP IDENTIFIED"
    r_gt.font.name = "Arial"
    r_gt.font.size = Pt(17)
    r_gt.font.bold = True
    r_gt.font.color.rgb = c_red_alert

    p_gb = tf_gap.add_paragraph()
    p_gb.alignment = PP_ALIGN.CENTER
    r_gb = p_gb.add_run()
    r_gb.text = '"Absence of continuous, real-time subsurface monitoring capable of automated early warning and collapse prediction before catastrophic ground failure occurs."'
    r_gb.font.name = "Times New Roman"
    r_gb.font.size = Pt(21)
    r_gb.font.bold = True
    r_gb.font.color.rgb = c_navy_dark


    # ==========================================
    # SLIDE 3: TECHNICAL APPROACH (Clean Layout: Text on Top, Diagrams on Bottom)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_footer(s3, 3, "TECHNICAL APPROACH")

    sh3 = s3.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(18.4), Inches(0.6))
    p_sh3 = sh3.text_frame.paragraphs[0]
    p_sh3.text = "❖ Technologies to be used & Process Workflow Architecture"
    p_sh3.font.name = "Arial"
    p_sh3.font.size = Pt(22)
    p_sh3.font.bold = True
    p_sh3.font.color.rgb = c_blue_primary
    p_sh3.font.underline = True

    # 3 Top Text Cards
    col_w = Inches(5.9)
    col_gap = Inches(0.35)
    left_margin = Inches(0.8)

    c3_top_info = [
        ("1. GEOTECHNICAL STRATA MODELING", [
            ("Barakar Sandstone Flexure", "180m depth goaf extraction void collapse."),
            ("Knothe Subsidence Formulation", "S(x) = Smax · [0.5 - 0.5 · erf(√π · x / R)]."),
            ("Strain & Curvature Analysis", "Predicts surface tensile fissures & inflection zone.")
        ]),
        ("2. 4-TIER WORKFLOW MIND MAP", [
            ("Layer 1 (Sensing)", "100Hz IMU tilt & linear crack dilation."),
            ("Layer 2 (Mesh)", "868MHz LoRa mesh with 72h offline SPI buffer."),
            ("Layer 3 (Edge AI)", "Saito 1/v -> 0 prediction & 3-layer dumper filter."),
            ("Layer 4 (Life Safety)", "Direct pithead sirens & geo-fenced SMS.")
        ]),
        ("3. PROTOTYPE HARDWARE RIG", [
            ("ESP32 Dual-Core (240MHz)", "Core 0: LoRa Mesh; Core 1: 100Hz DSP & AI."),
            ("MPU-6050 & Extensometer", "±0.05° tilt & 0.01mm dilation ADC resolution."),
            ("Dumper Vibration Rejection", "15-50Hz notch filter eliminates truck tremors.")
        ])
    ]

    for i, (col_title, items) in enumerate(c3_top_info):
        x = left_margin + i * (col_w + col_gap)
        card_top = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.3), col_w, Inches(2.8))
        card_top.fill.solid()
        card_top.fill.fore_color.rgb = c_card_bg
        card_top.line.color.rgb = c_card_border
        card_top.line.width = Pt(1.5)

        tf = card_top.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.2)

        p = tf.paragraphs[0]
        p.text = col_title
        p.font.name = "Arial"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = c_navy_dark
        p.space_after = Pt(6)

        for heading, detail in items:
            p = tf.add_paragraph()
            p.space_after = Pt(4)
            r1 = p.add_run()
            r1.text = f"• {heading}: "
            r1.font.name = "Arial"
            r1.font.size = Pt(14)
            r1.font.bold = True
            r1.font.color.rgb = c_text_dark
            r2 = p.add_run()
            r2.text = detail
            r2.font.name = "Arial"
            r2.font.size = Pt(13.5)
            r2.font.color.rgb = c_text_muted

    # 3 Bottom Diagrams in styled frame containers
    diagram_files = [knothe_diag_path, workflow_diag_path, hw_diag_path]
    for i, diag_path in enumerate(diagram_files):
        x = left_margin + i * (col_w + col_gap)
        frame = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.3), col_w, Inches(4.9))
        frame.fill.solid()
        frame.fill.fore_color.rgb = c_white
        frame.line.color.rgb = c_card_border
        frame.line.width = Pt(1.5)

        if os.path.exists(diag_path):
            s3.shapes.add_picture(diag_path, x + Inches(0.15), Inches(5.45), width=col_w - Inches(0.3))


    # ==========================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_footer(s4, 4, "FEASIBILITY AND VIABILITY")

    sh4 = s4.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(18.4), Inches(0.6))
    p_sh4 = sh4.text_frame.paragraphs[0]
    p_sh4.text = "❖ Analysis of Feasibility, Potential Challenges & Overcoming Engineering Strategies"
    p_sh4.font.name = "Arial"
    p_sh4.font.size = Pt(22)
    p_sh4.font.bold = True
    p_sh4.font.color.rgb = c_blue_primary
    p_sh4.font.underline = True

    # Left Column: Challenges & Risks
    c4_l = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.35), Inches(9.0), Inches(5.3))
    c4_l.fill.solid()
    c4_l.fill.fore_color.rgb = c_card_bg
    c4_l.line.color.rgb = c_red_alert
    c4_l.line.width = Pt(2.0)
    tf4_l = c4_l.text_frame
    tf4_l.word_wrap = True
    tf4_l.margin_left = Inches(0.4)
    tf4_l.margin_right = Inches(0.4)
    tf4_l.margin_top = Inches(0.35)

    p = tf4_l.paragraphs[0]
    p.text = "POTENTIAL CHALLENGES & OPERATIONAL RISKS"
    p.font.name = "Arial"
    p.font.size = Pt(19)
    p.font.bold = True
    p.font.color.rgb = c_red_alert
    p.space_after = Pt(12)

    challenges = [
        ("Extreme Open-Cast Environment", "Heavy airborne coal dust, corrosive acidic mine drainage, monsoon downpours, and -5°C to 50°C thermal shifts."),
        ("Deep Mine RF Shadowing & Remote Belts", "High pit benches and remote overburden dumps lack cellular (4G/5G) mobile connectivity and direct line-of-sight."),
        ("Heavy Machinery False Positives", "120-tonne dumpers, shovels, and blasting create high-amplitude surface vibrations mimicking subsidence fissures."),
        ("Power Grid Absence & Remote Maintenance", "Lack of AC power across active subsidence bowls; high cost and danger of frequent manual battery replacements.")
    ]
    for title, desc in challenges:
        p = tf4_l.add_paragraph()
        p.space_after = Pt(8)
        r1 = p.add_run()
        r1.text = f"• {title}: "
        r1.font.name = "Arial"
        r1.font.size = Pt(16)
        r1.font.bold = True
        r1.font.color.rgb = c_text_dark
        r2 = p.add_run()
        r2.text = desc
        r2.font.name = "Arial"
        r2.font.size = Pt(15)
        r2.font.color.rgb = c_text_muted

    # Right Column: Engineering Strategies to Overcome
    c4_r = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.2), Inches(2.35), Inches(9.0), Inches(5.3))
    c4_r.fill.solid()
    c4_r.fill.fore_color.rgb = c_card_bg
    c4_r.line.color.rgb = c_green_success
    c4_r.line.width = Pt(2.0)
    tf4_r = c4_r.text_frame
    tf4_r.word_wrap = True
    tf4_r.margin_left = Inches(0.4)
    tf4_r.margin_right = Inches(0.4)
    tf4_r.margin_top = Inches(0.35)

    p = tf4_r.paragraphs[0]
    p.text = "ENGINEERING STRATEGIES TO OVERCOME"
    p.font.name = "Arial"
    p.font.size = Pt(19)
    p.font.bold = True
    p.font.color.rgb = c_green_success
    p.space_after = Pt(12)

    solutions = [
        ("IP67 Rugged Enclosure + Gore-Tex Vent", "Hermetically sealed ABS housing with hydrophobic Gore-Tex breather membrane prevents internal condensation and dust entry."),
        ("Multi-Hop 868MHz LoRa Mesh + SPI Buffer", "Dynamic packet leapfrogging across node mesh with 72-hour offline SPI flash ring buffer ensuring 0% data loss during outages."),
        ("3-Layer Edge DSP Noise Rejection", "Digital bandstop notch filter (15-50Hz truck harmonics) + 3.5s tilt persistence verification reliably eliminates false alarms."),
        ("Solar MPPT + 6000mAh LiFePO4 Chemistry", "Integrated mono-crystalline solar harvesting with LiFePO4 cells delivering 35 days of continuous power without direct sunlight.")
    ]
    for title, desc in solutions:
        p = tf4_r.add_paragraph()
        p.space_after = Pt(8)
        r1 = p.add_run()
        r1.text = f"• {title}: "
        r1.font.name = "Arial"
        r1.font.size = Pt(16)
        r1.font.bold = True
        r1.font.color.rgb = c_text_dark
        r2 = p.add_run()
        r2.text = desc
        r2.font.name = "Arial"
        r2.font.size = Pt(15)
        r2.font.color.rgb = c_text_muted

    # Bottom 3 Viability Metric Cards
    metrics = [
        ("CAPEX VIABILITY", "₹2,100 Per Node", "95%+ cost reduction compared to ₹50L+ imported extensometer/micro-seismic arrays, enabling dense grid deployment.", RGBColor(2, 132, 199)),
        ("DEPLOYMENT FEASIBILITY", "< 10 Mins / Node", "Quick-mount universal ground stakes & magnetic clamp anchors allow rapid setup with zero trenching or drilling.", RGBColor(13, 148, 136)),
        ("OPERATIONAL LONGEVITY", "5+ Years Lifespan", "Industrial-grade LiFePO4 cells (2000+ cycles) and UV-stabilized IP67 housing ensure multi-year zero-maintenance service.", RGBColor(124, 58, 237))
    ]

    for i, (m_title, m_val, m_desc, m_col) in enumerate(metrics):
        bx = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i * 6.3), Inches(7.95), Inches(5.8), Inches(2.2))
        bx.fill.solid()
        bx.fill.fore_color.rgb = c_card_bg
        bx.line.color.rgb = m_col
        bx.line.width = Pt(1.8)
        tf_m = bx.text_frame
        tf_m.word_wrap = True
        tf_m.margin_left = Inches(0.3)
        tf_m.margin_right = Inches(0.3)
        tf_m.margin_top = Inches(0.2)

        p = tf_m.paragraphs[0]
        p.text = m_title
        p.font.name = "Arial"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = m_col

        p = tf_m.add_paragraph()
        p.text = m_val
        p.font.name = "Arial"
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = c_text_dark
        p.space_after = Pt(2)

        p = tf_m.add_paragraph()
        p.text = m_desc
        p.font.name = "Arial"
        p.font.size = Pt(13)
        p.font.color.rgb = c_text_muted


    # ==========================================
    # SLIDE 5: IMPACT AND BENEFITS
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_footer(s5, 5, "IMPACT AND BENEFITS")

    sh5 = s5.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(18.4), Inches(0.6))
    p_sh5 = sh5.text_frame.paragraphs[0]
    p_sh5.text = "❖ Potential Impact on Target Audience & Quantifiable Multi-Dimensional Benefits"
    p_sh5.font.name = "Arial"
    p_sh5.font.size = Pt(22)
    p_sh5.font.bold = True
    p_sh5.font.color.rgb = c_blue_primary
    p_sh5.font.underline = True

    # 4 Quadrants
    pillars = [
        ("1. SOCIAL & HUMANITARIAN IMPACT", [
            ("Zero-Fatality Mandate", "Directly addresses 370+ historical coalfield subsidence fatalities in Jharia, Raniganj, and Dhanbad."),
            ("400,000+ Civilians Protected", "Safeguards dense township populations residing above unmapped, aging British-era coal voids."),
            ("2 to 6 Hour Evacuation Buffer", "Provides actionable early warning via Saito inverse-velocity inflection modeling before ground failure occurs."),
            ("Surveyor Hazard Elimination", "Autonomous wireless mesh eliminates the need for human survey crews to walk over active tension fissures.")
        ], c_red_alert),

        ("2. ECONOMIC & INFRASTRUCTURE PROTECTION", [
            ("Prevention of Railway Closures", "Safeguards critical transport corridors like the ₹1,500 Crore Dhanbad-Chandrapura railway line shutdown."),
            ("Highway & Power Pylon Safety", "Continuous real-time strain monitoring along National Highways (NH-19) and high-voltage transmission lines."),
            ("Mineral Sterilisation Prevention", "Enables safe depillaring operations, unlocking millions of tonnes of coal previously locked in safety barriers."),
            ("95%+ Capex Savings for Coal India", "Sub-₹2,500 cost per node saves ₹45+ Lakhs per monitoring panel compared to imported micro-seismic systems.")
        ], RGBColor(2, 132, 199)),

        ("3. ENVIRONMENTAL PRESERVATION", [
            ("Subsurface Coal Fire Mitigation", "Detects surface tensile fissures instantly, enabling prompt clay sealing before oxygen fuels underground coal seam fires."),
            ("Groundwater Aquifer Protection", "Prevents rupture of overlying water tables and localized drying of surface drinking borewells in mining belts."),
            ("Overburden Dump Slope Stability", "Continuous tilt tracking on 40m+ overburden waste dumps prevents catastrophic monsoon-induced landslides.")
        ], c_green_success),

        ("4. REGULATORY & STATUTORY COMPLIANCE", [
            ("DGMS Tech Circular No. 2 (1987)", "100% compliance with Directorate General of Mines Safety permissible subsidence, slope, and strain limits."),
            ("Coal Mines Regulations (CMR) 2017", "Automates compliance reporting under Regulations 111 & 112 (Precautions against subsidence and extraction stability)."),
            ("Automated Tamper-Evident Audit Trail", "Immutable digital telemetry records provide Coal India subsidiaries (BCCL, ECL, CCL) with certified safety proof.")
        ], RGBColor(124, 58, 237))
    ]

    coords = [
        (Inches(0.8), Inches(2.35), Inches(9.0), Inches(4.0)),
        (Inches(10.2), Inches(2.35), Inches(9.0), Inches(4.0)),
        (Inches(0.8), Inches(6.55), Inches(9.0), Inches(3.7)),
        (Inches(10.2), Inches(6.55), Inches(9.0), Inches(3.7))
    ]

    for i, (p_title, p_items, p_color) in enumerate(pillars):
        x, y, w, h = coords[i]
        bx = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
        bx.fill.solid()
        bx.fill.fore_color.rgb = c_card_bg
        bx.line.color.rgb = p_color
        bx.line.width = Pt(2.0)
        tf_p = bx.text_frame
        tf_p.word_wrap = True
        tf_p.margin_left = Inches(0.4)
        tf_p.margin_right = Inches(0.4)
        tf_p.margin_top = Inches(0.25)

        p = tf_p.paragraphs[0]
        p.text = p_title
        p.font.name = "Arial"
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = p_color
        p.space_after = Pt(8)

        for title, desc in p_items:
            p = tf_p.add_paragraph()
            p.space_after = Pt(5)
            r1 = p.add_run()
            r1.text = f"• {title}: "
            r1.font.name = "Arial"
            r1.font.size = Pt(14.5)
            r1.font.bold = True
            r1.font.color.rgb = c_text_dark
            r2 = p.add_run()
            r2.text = desc
            r2.font.name = "Arial"
            r2.font.size = Pt(13.5)
            r2.font.color.rgb = c_text_muted


    # ==========================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_footer(s6, 6, "RESEARCH AND REFERENCES")

    sh6 = s6.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(18.4), Inches(0.6))
    p_sh6 = sh6.text_frame.paragraphs[0]
    p_sh6.text = "❖ Statutory Mining Standards, Geotechnical Literature & Field Case Studies"
    p_sh6.font.name = "Arial"
    p_sh6.font.size = Pt(22)
    p_sh6.font.bold = True
    p_sh6.font.color.rgb = c_blue_primary
    p_sh6.font.underline = True

    c6 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.35), Inches(18.4), Inches(7.8))
    c6.fill.solid()
    c6.fill.fore_color.rgb = c_card_bg
    c6.line.color.rgb = c_navy_dark
    c6.line.width = Pt(2.0)
    tf6 = c6.text_frame
    tf6.word_wrap = True
    tf6.margin_left = Inches(0.6)
    tf6.margin_right = Inches(0.6)
    tf6.margin_top = Inches(0.4)

    references = [
        ("Directorate General of Mines Safety (DGMS)", "Technical Circular No. 2 of 1987: Permissible Limits of Surface Subsidence, Slope, and Strain over Underground Coal Workings in Indian Coalfields, Dhanbad, Ministry of Labour and Employment, Govt. of India."),
        ("CSIR-Central Institute of Mining & Fuel Research (CIMFR)", "Guidelines on Subsidence Prediction, Slope Stability & Strata Control in Bord & Pillar and Longwall Extractions in Raniganj and Jharia Coalfields, CSIR-CIMFR Dhanbad, Jharkhand."),
        ("Knothe, S. (1957)", "Observations of Surface Movements Under the Influence of Mining and Their Theoretical Interpretation, Proceedings of the European Congress on Ground Movement, Leeds, pp. 210–218."),
        ("Saito, M. (1969) & Fukuzono, T. (1985)", "Forecasting Time of Slope and Ground Failure by Inverse-Velocity Method, Japanese Geotechnical Society / Soils and Foundations, Vol. 25, No. 2, pp. 26–40."),
        ("Ministry of Coal, Government of India", "Coal Mines Regulations (CMR) 2017 – Regulations 111 & 112: Stability of Workings, Precautions Against Subsidence, and Depillaring Approvals."),
        ("Indian Road Congress (IRC:SP:106-2015) & NHAI", "Engineering Guidelines for Infrastructure Construction and Subsidence Monitoring in Undermined and Subsidence-Prone Coal Belts."),
        ("Jharia Coalfield Master Plan (2021–2030)", "High-Level Committee Action Report on Fire, Subsidence, and Environmental Rehabilitation in Leasehold Areas of BCCL and ECL, Ministry of Coal, Govt. of India.")
    ]

    for idx, (auth, detail) in enumerate(references):
        p = tf6.paragraphs[0] if idx == 0 else tf6.add_paragraph()
        p.space_after = Pt(14)
        r_num = p.add_run()
        r_num.text = f"[{idx + 1}] "
        r_num.font.name = "Arial"
        r_num.font.size = Pt(17)
        r_num.font.bold = True
        r_num.font.color.rgb = c_blue_primary

        r_auth = p.add_run()
        r_auth.text = f"{auth} – "
        r_auth.font.name = "Arial"
        r_auth.font.size = Pt(17)
        r_auth.font.bold = True
        r_auth.font.color.rgb = c_navy_dark

        r_det = p.add_run()
        r_det.text = detail
        r_det.font.name = "Calibri"
        r_det.font.size = Pt(16)
        r_det.font.color.rgb = c_text_dark

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    out = r"c:\Shareque Coding\SubsiGuard\SubsiGuard_SIH2026_Official_Presentation.pptx"
    create_presentation(out)
