import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─── Design tokens (miroir de index.css / App.css) ──────────────────────────
const C = {
  bgMain:      "#0A0E17",
  bgCard:      "#151E2C",
  bgCard2:     "#0D1420",
  border:      "#1B4D34",
  accent:      "#05E575",
  textMain:    "#F9FAFB",
  textMuted:   "#7D8798",
  textSoft:    "#9CA3AF",
  critical:    "#F72525",
  criticalBg:  "#2A1010",
  high:        "#F25202",
  highBg:      "#221508",
  medium:      "#D9A82B",
  mediumBg:    "#1E1A07",
  low:         "#7BA6ED",
  lowBg:       "#0D1624",
  info:        "#7D8798",
  infoBg:      "#131820",
};

const SEV = {
  Critique: { fg: C.critical, bg: C.criticalBg },
  Élevée:   { fg: C.high,     bg: C.highBg     },
  Moyenne:  { fg: C.medium,   bg: C.mediumBg   },
  Faible:   { fg: C.low,      bg: C.lowBg      },
  Info:     { fg: C.info,     bg: C.infoBg     },
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily:        "Helvetica",
    fontSize:          9,
    color:             C.textMain,
    backgroundColor:   C.bgMain,
    paddingTop:        40,
    paddingBottom:     48,
    paddingHorizontal: 36,
  },

  // Header
  headerWrap: { marginBottom: 20 },
  headerTop: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-end",
    marginBottom:   10,
  },
  appName: {
    fontSize:      11,
    fontFamily:    "Helvetica-Bold",
    color:         C.accent,
    letterSpacing: 2,
  },
  headerMeta: { fontSize: 8, color: C.textMuted, textAlign: "right" },
  repoName: {
    fontSize:     20,
    fontFamily:   "Helvetica-Bold",
    color:        C.textMain,
    marginBottom: 3,
  },
  headerSub: { fontSize: 8.5, color: C.textMuted },
  accentLine: {
    height:          1.5,
    backgroundColor: C.accent,
    marginTop:       10,
    borderRadius:    1,
  },

  // Score banner
  scoreBanner: {
    flexDirection:   "row",
    backgroundColor: C.bgCard,
    borderRadius:    12,
    border:          `1px solid ${C.border}`,
    padding:         16,
    marginBottom:    18,
    alignItems:      "center",
    gap:             20,
  },
  scoreCircle: {
    alignItems:      "center",
    justifyContent:  "center",
    width:           68,
    height:          68,
    borderRadius:    34,
    backgroundColor: C.bgMain,
    border:          `2px solid ${C.accent}`,
  },
  scoreNumber: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  scoreUnit:   { fontSize: 7.5, color: C.textMuted },
  divider: {
    width:           1,
    height:          48,
    backgroundColor: C.border,
  },
  statsGrid: {
    flex:           1,
    flexDirection:  "row",
    justifyContent: "space-around",
    alignItems:     "center",
  },
  statCol:   { alignItems: "center", gap: 3 },
  statVal:   { fontSize: 15, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 7.5, color: C.textMuted },
  complianceBadge: {
    borderRadius:      6,
    paddingVertical:   3,
    paddingHorizontal: 8,
    fontSize:          8,
    fontFamily:        "Helvetica-Bold",
  },

  // Section header
  sectionRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    marginBottom:  10,
  },
  sectionDot: {
    width:           5,
    height:          5,
    borderRadius:    3,
    backgroundColor: C.accent,
  },
  sectionTitle: {
    fontSize:   11,
    fontFamily: "Helvetica-Bold",
    color:      C.textMain,
  },
  sectionBadge: {
    fontSize:          7.5,
    color:             C.accent,
    backgroundColor:   "rgba(5,229,117,0.1)",
    borderRadius:      8,
    paddingVertical:   2,
    paddingHorizontal: 7,
  },

  // Vuln card
  vulnCard: {
    backgroundColor: C.bgCard,
    borderRadius:    10,
    border:          `1px solid ${C.border}`,
    padding:         11,
    marginBottom:    8,
  },
  vulnTop: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           8,
    marginBottom:  5,
  },
  sevTag: {
    borderRadius:      4,
    paddingVertical:   2,
    paddingHorizontal: 7,
    fontSize:          7.5,
    fontFamily:        "Helvetica-Bold",
  },
  vulnCode: {
    fontSize:          7.5,
    color:             C.textMuted,
    backgroundColor:   C.bgMain,
    borderRadius:      4,
    paddingVertical:   1,
    paddingHorizontal: 5,
  },
  vulnTitle: {
    fontSize:     9.5,
    fontFamily:   "Helvetica-Bold",
    color:        C.textMain,
    marginBottom: 3,
  },
  vulnDesc: {
    fontSize:     8.5,
    color:        C.textMuted,
    lineHeight:   1.5,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap:           5,
    flexWrap:      "wrap",
    marginTop:     4,
  },
  metaChip: {
    fontSize:          7.5,
    color:             C.textSoft,
    backgroundColor:   C.bgMain,
    borderRadius:      4,
    paddingVertical:   1,
    paddingHorizontal: 5,
    border:            `1px solid ${C.border}`,
  },
  recommendation: {
    marginTop:   5,
    paddingTop:  5,
    borderTop:   `1px solid ${C.border}`,
    fontSize:    8,
    color:       C.accent,
    fontFamily:  "Helvetica-Oblique",
  },

  // Empty state
  emptyCard: {
    backgroundColor: C.bgCard,
    borderRadius:    10,
    border:          `1px solid ${C.border}`,
    padding:         20,
    alignItems:      "center",
  },
  emptyText: { fontSize: 10, color: C.textMuted },

  // Footer
  footer: {
    position:       "absolute",
    bottom:         18,
    left:           36,
    right:          36,
    flexDirection:  "row",
    justifyContent: "space-between",
    borderTop:      `1px solid ${C.border}`,
    paddingTop:     6,
  },
  footerAccent: { fontSize: 7.5, color: C.accent },
  footerText:   { fontSize: 7.5, color: C.textMuted },
});

// ─── Sous-composants ─────────────────────────────────────────────────────────
function SevTag({ label }) {
  const { fg, bg } = SEV[label] ?? { fg: C.info, bg: C.infoBg };
  return <Text style={[s.sevTag, { color: fg, backgroundColor: bg }]}>{label}</Text>;
}

function StatCol({ value, label, color }) {
  return (
    <View style={s.statCol}>
      <Text style={[s.statVal, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
const ScanReportPdf = ({ repoName, analyzedAt, score, stats, vulns = [] }) => {
  const dateStr = analyzedAt
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" })
        .format(new Date(analyzedAt))
    : "—";

  const scoreColor = score >= 80 ? C.accent : score >= 50 ? C.medium : C.critical;
  const isCompliant = vulns.length === 0;

  return (
    <Document
      title={`Rapport SecureScan — ${repoName}`}
      author="SecureScan"
      subject="Rapport d'analyse de vulnérabilités"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerWrap}>
          <View style={s.headerTop}>
            <Text style={s.appName}>SECURESCAN</Text>
            <Text style={s.headerMeta}>Généré le {dateStr}</Text>
          </View>
          <Text style={s.repoName}>{repoName}</Text>
          <Text style={s.headerSub}>
            Rapport d'analyse de sécurité  ·  Standards ISO 27001 & OWASP Top 10
          </Text>
          <View style={s.accentLine} />
        </View>

        {/* ── Score banner ── */}
        <View style={s.scoreBanner}>
          <View style={s.scoreCircle}>
            <Text style={[s.scoreNumber, { color: scoreColor }]}>{score}</Text>
            <Text style={s.scoreUnit}>/100</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statsGrid}>
            <StatCol value={stats.crit}  label="Critique" color={C.critical} />
            <StatCol value={stats.elev}  label="Élevée"   color={C.high}     />
            <StatCol value={stats.moy}   label="Moyenne"  color={C.medium}   />
            <StatCol value={stats.total} label="Total"    color={C.textMain} />
            <View style={s.statCol}>
              <Text style={[s.complianceBadge, {
                color:           isCompliant ? C.accent  : C.medium,
                backgroundColor: isCompliant ? "rgba(5,229,117,0.1)" : "rgba(217,168,43,0.1)",
              }]}>
                {isCompliant ? "Conforme" : "Partiel"}
              </Text>
              <Text style={s.statLabel}>Conformité</Text>
            </View>
          </View>
        </View>

        {/* ── Vulnérabilités ── */}
        <View style={s.sectionRow}>
          <View style={s.sectionDot} />
          <Text style={s.sectionTitle}>Vulnérabilités détectées</Text>
          <Text style={s.sectionBadge}>{vulns.length}</Text>
        </View>

        {vulns.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Aucune vulnérabilité détectée — dépôt sain.</Text>
          </View>
        ) : (
          vulns.map((v, i) => (
            <View key={v.id ?? i} style={s.vulnCard} wrap={false}>
              <View style={s.vulnTop}>
                <SevTag label={v.severity} />
                {v.code ? <Text style={s.vulnCode}>{v.code}</Text> : null}
              </View>
              <Text style={s.vulnTitle}>{v.title}</Text>
              {v.description ? <Text style={s.vulnDesc}>{v.description}</Text> : null}
              {(v.file || v.line) ? (
                <View style={s.metaRow}>
                  {v.file ? <Text style={s.metaChip}>{v.file}</Text> : null}
                  {v.line ? <Text style={s.metaChip}>Ligne {v.line}</Text> : null}
                </View>
              ) : null}
              {v.recommendation ? (
                <Text style={s.recommendation}>→ {v.recommendation}</Text>
              ) : null}
            </View>
          ))
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerAccent}>SecureScan</Text>
          <Text style={s.footerText}>{repoName} · {dateStr}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

export default ScanReportPdf;
