import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { PaperData } from "@/lib/api";

const DIFF: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

const s = StyleSheet.create({
  page: { paddingVertical: 48, paddingHorizontal: 56, fontFamily: "Helvetica", color: "#222" },
  school: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "center" },
  sub: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 2 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  meta: { fontSize: 11 },
  instr: { fontSize: 11, marginTop: 10 },
  studentLine: { fontSize: 11, marginTop: 6 },
  sectionName: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 8 },
  qRow: { flexDirection: "row", marginBottom: 8 },
  qNum: { fontSize: 11, fontFamily: "Helvetica-Bold", width: 20 },
  qText: { fontSize: 11, flex: 1, lineHeight: 1.4 },
  end: { fontSize: 11, fontFamily: "Helvetica-Bold", textAlign: "center", marginTop: 20, color: "#666" },
  answerHead: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 8 },
  divider: { borderTopWidth: 1, borderTopColor: "#ddd", marginTop: 22, paddingTop: 12 },
});

function PaperPdf({ paper }: { paper: PaperData }) {
  let n = 0;
  return (
    <Document title={`${paper.subject} — ${paper.className}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.school}>{paper.schoolName}</Text>
        <Text style={s.sub}>Subject: {paper.subject}</Text>
        <Text style={s.sub}>Class: {paper.className}</Text>

        <View style={s.metaRow}>
          <Text style={s.meta}>Time Allowed: {paper.durationMins} minutes</Text>
          <Text style={s.meta}>Maximum Marks: {paper.totalMarks}</Text>
        </View>

        <Text style={s.instr}>{paper.generalInstructions}</Text>

        <View style={{ marginTop: 12 }}>
          <Text style={s.studentLine}>Name: ______________________</Text>
          <Text style={s.studentLine}>Roll Number: ________________</Text>
          <Text style={s.studentLine}>
            Class: {paper.className}     Section: __________
          </Text>
        </View>

        {paper.sections.map((sec) => (
          <View key={sec.name}>
            <Text style={s.sectionName}>{sec.name}</Text>
            <Text style={s.sectionTitle}>
              {sec.title} — {sec.instruction}
            </Text>
            {sec.questions.map((q) => {
              n += 1;
              return (
                <View key={n} style={s.qRow} wrap={false}>
                  <Text style={s.qNum}>{n}.</Text>
                  <Text style={s.qText}>
                    [{DIFF[q.difficulty] ?? q.difficulty}] {q.text} [{q.marks} Marks]
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        <Text style={s.end}>— End of Question Paper —</Text>

        {paper.answerKey.length > 0 && (
          <View style={s.divider}>
            <Text style={s.answerHead}>Answer Key</Text>
            {paper.answerKey.map((a) => (
              <View key={a.n} style={s.qRow} wrap={false}>
                <Text style={s.qNum}>{a.n}.</Text>
                <Text style={s.qText}>{a.answer}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function downloadPaperPdf(paper: PaperData, fileName: string) {
  const blob = await pdf(<PaperPdf paper={paper} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
