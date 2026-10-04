import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, A4[1] - 30, A4[0] - 40, A4[1] - 30)
            self.drawString(40, A4[1] - 25, "SubsiGuard — Video Production Script (SIH 2026)")
            self.drawRightString(A4[0] - 40, A4[1] - 25, "Problem Statement: SIH26025")

        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 36, A4[0] - 40, 36)
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 40, 24, page_text)
        self.drawString(40, 24, "CONFIDENTIAL & PROPRIETARY — SubsiGuard Video Production Team (2026)")
        self.restoreState()

def build_pdf():
    pdf_path = os.path.abspath(r"c:\Shareque Coding\SubsiGuard\Presentstion\SubsiGuard_Video_Script.pdf")
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor('#059669'),
        spaceAfter=10
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#64748B')
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    scene_title_style = ParagraphStyle(
        'SceneTitle',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    scene_badge_style = ParagraphStyle(
        'SceneBadge',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        alignment=2,
        textColor=colors.HexColor('#0284C7')
    )

    speaker_style = ParagraphStyle(
        'SpeakerStyle',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#059669')
    )

    dialogue_style = ParagraphStyle(
        'DialogueStyle',
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#1E293B')
    )

    action_label = ParagraphStyle(
        'ActionLabel',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#64748B')
    )

    action_text = ParagraphStyle(
        'ActionText',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#475569')
    )

    story = []

    # Title Banner
    story.append(Paragraph("SubsiGuard: SIH 2026 Video Production Script", title_style))
    story.append(Paragraph("Official YouTube Demonstration Script • Modeled on Benchmark SIH National Winner Format • Runtime: 2m 25s", subtitle_style))
    story.append(Spacer(1, 4))

    # Metadata Table
    meta_data = [
        [
            Paragraph("<b>Target Video Duration:</b>", meta_label),
            Paragraph("2 Minutes 25 Seconds (145s)", meta_val),
            Paragraph("<b>Problem Statement:</b>", meta_label),
            Paragraph("SIH26025 (Ministry of Coal / CIL)", meta_val)
        ],
        [
            Paragraph("<b>Language & Delivery:</b>", meta_label),
            Paragraph("English (Energetic, Natural)", meta_val),
            Paragraph("<b>Cast / Presenters:</b>", meta_label),
            Paragraph("Person 1 to Person 6 (Team Collaboration)", meta_val)
        ],
        [
            Paragraph("<b>Physical Hardware Prop:</b>", meta_label),
            Paragraph("ESP32 + MPU6050 + Extensometer + Buzzer", meta_val),
            Paragraph("<b>Software Sync:</b>", meta_label),
            Paragraph("Web Serial Live Dashboard (Lockstep)", meta_val)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[110, 150, 110, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Scenes Definition
    scenes = [
        {
            "num": "SCENE 01",
            "title": "The Hook — \"What If?\"",
            "time": "00:00 – 00:15 (15 sec)",
            "location": "Campus Lawn / Greenery (Natural Outdoor Sunlight)",
            "camera": "Medium tracking shot walking forward towards camera. Clean, direct eye contact.",
            "speaker": "Person 1",
            "dialogue": "\"What if the ground beneath our national highways, railway corridors, and mining townships could give us an early warning... before sudden collapse? Across India's coalfields, underground void settlement puts thousands of lives and vital infrastructure at risk. Today, our team brings you SubsiGuard: an intelligent ground subsidence early warning system.\"",
            "action": "Speaker walks confidently along campus lawn. At 00:10, cut in quick B-roll animation or news clipping of highway crack / mine subsidence fissure, then snap back to speaker holding a SubsiGuard sensor node."
        },
        {
            "num": "SCENE 02",
            "title": "Team Identity & Problem Formulation",
            "time": "00:15 – 00:25 (10 sec)",
            "location": "College Steps / Main Building Entrance Plaza",
            "camera": "Wide shot showing the full 6-member team standing on steps, pushing in slightly to Person 2.",
            "speaker": "Person 2",
            "dialogue": "\"Under Smart India Hackathon 2026, Problem Statement SIH26025, our team engineered SubsiGuard. Traditional satellite InSAR takes up to twelve days between orbital passes, while manual surveys miss rapid strata acceleration. SubsiGuard solves this with continuous, real-time wireless monitoring.\"",
            "action": "Team stands shoulder-to-shoulder in matching college/team attire. Person 2 speaks clearly while other team members nod with confidence. SubsiGuard logo bug appears in top corner."
        },
        {
            "num": "SCENE 03",
            "title": "Hardware Breakdown & Sensor Node Anatomy",
            "time": "00:25 – 00:45 (20 sec)",
            "location": "Electronics / IoT Hardware Laboratory",
            "camera": "Over-the-shoulder and close-up macro shots of the physical prototype circuit board.",
            "speaker": "Person 3",
            "dialogue": "\"Every SubsiGuard node is an autonomous edge unit built under twenty-one hundred rupees. It integrates an MPU-6050 dual-axis inclinometer for tilt resolution, a linear crack extensometer, an SW-420 seismic vibration transducer, and an ESP32 microcontroller with a long-range 865 to 868 megahertz LoRa transceiver.\"",
            "action": "Person 3 holds the assembled sensor node casing and circuit board. Camera cuts to crisp B-roll macro inserts pointing out the MPU-6050, the extensometer wire, LoRa antenna, and battery terminal."
        },
        {
            "num": "SCENE 04",
            "title": "Geotechnical Physics & Saito Inverse-Velocity AI",
            "time": "00:45 – 01:05 (20 sec)",
            "location": "Classroom / Seminar Hall (Blackboard or Whiteboard)",
            "camera": "Medium shot of Person 4 writing on the board, panning smoothly between speaker and equation.",
            "speaker": "Person 4",
            "dialogue": "\"Instead of relying on delayed surveys, we implement the Saito and Fukuzono Inverse-Velocity method: one over v tending to zero. In steady state, creep velocity v is stable. But when rock strata enter tertiary accelerating creep, one over v drops linearly toward zero. By continuously computing this gradient in real time, SubsiGuard dynamically calculates the time-to-failure countdown — alerting safety engineers before catastrophic surface collapse.\"",
            "action": "Person 4 writes: 'lim (1/v) -> 0 as t -> tf' on the board. A clear 2D animated overlay illustrates the inverse-velocity line descending to intercept the zero axis."
        },
        {
            "num": "SCENE 05",
            "title": "LoRa Mesh Reliability & Outdoor Power Autonomy",
            "time": "01:05 – 01:25 (20 sec)",
            "location": "Campus Walkway / Outdoor Corridor (Simulating Field Deployment)",
            "camera": "Tracking shot showing Person 1 and Person 2 demonstrating wireless node spacing.",
            "speaker": "Person 1",
            "dialogue": "\"Indian coalfields are vast, dusty, and rugged. Each SubsiGuard node operates on an independent 865 megahertz LoRa mesh with multi-hop packet leapfrogging. Even across multiple kilometers without cellular towers or internet, telemetry hops reliably back to the pithead. With intelligent low-power duty cycling and solar harvesting, each node maintains continuous off-grid resilience.\"",
            "action": "Person 1 holds a node with antenna extended while Person 2 demonstrates a receiver node down the walkway. B-roll overlay shows mesh leapfrog animation with zero backhaul dependency."
        },
        {
            "num": "SCENE 06",
            "title": "Zero-Cloud Hardware Fail-Safe Interlock",
            "time": "01:25 – 01:40 (15 sec)",
            "location": "Library / Server Rack / Control Room Corridor",
            "camera": "Intense medium-close shot. Serious, high-stakes delivery.",
            "speaker": "Person 2",
            "dialogue": "\"And what happens if the central computers or local networks lose power during a crisis? We engineered an autonomous dual-path failsafe. Even if all computers go down, an independent hardware relay detects critical strata acceleration and immediately triggers 110-decibel pithead sirens locally — with direct hardware response, completely independent of cloud or internet connectivity.\"",
            "action": "Person 2 points to the hardwired siren relay module. Graphic badge on screen: 'Dual-Path Hardware Interlock • Zero Internet Dependency'."
        },
        {
            "num": "SCENE 07",
            "title": "Live Physical Prototype Test (The Highlight Moment)",
            "time": "01:40 – 02:05 (25 sec)",
            "location": "Tabletop Demo Setup (Laptop + ESP32 Hardware via USB)",
            "camera": "Split screen or smooth pan from physical rig tilt to laptop dashboard screen.",
            "speaker": "Person 5",
            "dialogue": "\"Let's see it live in action. Here we have our physical SubsiGuard hardware unit connected to our command dashboard via Web Serial. Watch closely as I simulate strata tilt on the physical rig. The instant the angle tilts, the live dashboard tracks the deformation in exact lockstep. As tilt breaches critical threshold, the ESP32 activates the onboard alarm buzzer, while the web platform triggers real-time visual alerts and geo-fenced worker evacuation notices.\"",
            "action": "CRITICAL HERO DEMO: Person 5 gently tilts the physical board by hand. On-screen OLED updates instantaneously. The laptop dashboard gauge swings from GREEN to RED, the buzzer sounds audible beeps, and the siren badge illuminates."
        },
        {
            "num": "SCENE 08",
            "title": "Basin Scalability & Economic Feasibility",
            "time": "02:05 – 02:20 (15 sec)",
            "location": "Campus Canopy / Outdoor Seating (Professional Forward Look)",
            "camera": "Side-profile moving to frontal shot of Person 6 holding the project tablet/node.",
            "speaker": "Person 6",
            "dialogue": "\"SubsiGuard is engineered for direct field scalability across Raniganj, Jharia, and Singrauli basins. Because our entire 30-node mine deployment costs under two point two lakh rupees — less than two percent of legacy radar systems — Coal India subsidiaries can protect active depillaring panels with zero blind spots.\"",
            "action": "Person 6 gestures to a tablet displaying the GIS Mine Heatmap. Graphics comparison card shows: 'SubsiGuard: ₹2.2 Lakhs vs InSAR/Radar: ₹1.5+ Crore'."
        },
        {
            "num": "SCENE 09",
            "title": "Closing Statement & Unison Team Punchline",
            "time": "02:20 – 02:25 (5 sec)",
            "location": "College Steps / Campus Landmark (Wide Shot — All 6 Members)",
            "camera": "Dynamic push-in on all 6 team members standing in unison.",
            "speaker": "All Members (In Unison)",
            "dialogue": "\"SubsiGuard: Predicting ground collapse. Protecting Indian miners. Securing our nation's infrastructure!\"",
            "action": "All 6 team members look directly into camera with proud, confident smiles and deliver the closing slogan together. Fade to black with SubsiGuard logo, Team ID, and Problem Statement SIH26025."
        }
    ]

    for idx, sc in enumerate(scenes):
        sc_data = [
            [
                Paragraph(f"<b>{sc['num']} — {sc['title']}</b>", scene_title_style),
                Paragraph(f"<b>{sc['time']}</b>", scene_badge_style)
            ],
            [
                Paragraph(f"<b>Location:</b> {sc['location']}<br/><b>Visual / Shot:</b> {sc['camera']}", action_text),
                Paragraph("", action_text)
            ],
            [
                Paragraph(f"<b>Speaker:</b> {sc['speaker']}", speaker_style),
                Paragraph("", speaker_style)
            ],
            [
                Paragraph(f"<b>Dialogue:</b><br/>{sc['dialogue']}", dialogue_style),
                Paragraph("", dialogue_style)
            ],
            [
                Paragraph(f"<b>Action & Props:</b> {sc['action']}", action_text),
                Paragraph("", action_text)
            ]
        ]

        t = Table(sc_data, colWidths=[380, 142])
        t.setStyle(TableStyle([
            ('SPAN', (0, 1), (1, 1)),
            ('SPAN', (0, 2), (1, 2)),
            ('SPAN', (0, 3), (1, 3)),
            ('SPAN', (0, 4), (1, 4)),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#FFFFFF')),
            ('BOX', (0, 0), (-1, -1), 0.75, colors.HexColor('#CBD5E1')),
            ('LINEBELOW', (0, 0), (-1, 0), 0.75, colors.HexColor('#94A3B8')),
            ('LINEBELOW', (0, 1), (-1, 1), 0.5, colors.HexColor('#E2E8F0')),
            ('LINEBELOW', (0, 2), (-1, 2), 0.5, colors.HexColor('#E2E8F0')),
            ('LINEBELOW', (0, 3), (-1, 3), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))

        story.append(KeepTogether([t, Spacer(1, 8)]))

    # Add Filming Guidelines Section
    story.append(Spacer(1, 4))
    guide_title = ParagraphStyle(
        'GuideTitle',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=6
    )
    story.append(KeepTogether([
        Paragraph("Video Production & Filming Checklist (SIH Winning Standard)", guide_title),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#059669"), spaceBefore=2, spaceAfter=6)
    ]))

    guidelines = [
        [
            Paragraph("<b>1. Audio Quality (Crucial):</b>", meta_label),
            Paragraph("Use a collar/lapel mic (wireless or USB) for every speaker. Wind noise or echo will distract evaluators. Record in a quiet room or outdoor spot shielded from wind.", meta_val)
        ],
        [
            Paragraph("<b>2. Camera & Framing:</b>", meta_label),
            Paragraph("Shoot in 1080p 30fps landscape (16:9). Keep camera at eye level. Avoid shaky handheld footage — use a tripod or steady gimbal. Natural daylight produces the best skin tones.", meta_val)
        ],
        [
            Paragraph("<b>3. Physical Rig Demonstration:</b>", meta_label),
            Paragraph("Ensure the ESP32 board is plugged into the laptop running the SubsiGuard web dashboard via USB (Chrome / Edge with Web Serial enabled). Test the tilt response beforehand.", meta_val)
        ],
        [
            Paragraph("<b>4. Dialogue Delivery:</b>", meta_label),
            Paragraph("Speak with clear cadence, genuine passion, and crisp pronunciation. Do not read mechanically from a phone. Rehearse each 15-second line 3 times before filming.", meta_val)
        ],
        [
            Paragraph("<b>5. Editing & Graphics:</b>", meta_label),
            Paragraph("Add clean lower-third titles with Speaker Role ('Person 1 — Problem Framing'). Overlay high-resolution dashboard screen captures during the Scene 7 live demonstration.", meta_val)
        ]
    ]

    guide_table = Table(guidelines, colWidths=[140, 382])
    guide_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(guide_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {pdf_path}")

if __name__ == '__main__':
    build_pdf()
