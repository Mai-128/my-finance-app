import { useState, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["#4ade80", "#facc15", "#60a5fa", "#f87171", "#a78bfa"];
const CATEGORIES = ["食費", "日用品", "外食", "交通費", "その他"];

const initialExpenses = [
  { id: 1, date: "2026-05-01", item: "スーパー", amount: 3200, category: "食費" },
  { id: 2, date: "2026-05-02", item: "ドラッグストア", amount: 1500, category: "日用品" },
  { id: 3, date: "2026-05-03", item: "ランチ", amount: 980, category: "外食" },
  { id: 4, date: "2026-05-04", item: "コンビニ", amount: 450, category: "食費" },
  { id: 5, date: "2026-05-04", item: "電車", amount: 640, category: "交通費" },
];

const initialIncome = [
  { id: 1, date: "2026-05-25", item: "給与", amount: 280000, type: "salary" },
  { id: 2, date: "2026-05-10", item: "NTT配当", amount: 8000, type: "dividend" },
];

const initialStocks = [
  { id: 1, name: "NTT", shares: 100, dividendPerShare: 5.1, dividendMonths: [3, 9], color: "#4ade80" },
  { id: 2, name: "トヨタ", shares: 50, dividendPerShare: 30, dividendMonths: [3], color: "#60a5fa" },
  { id: 3, name: "三菱UFJ", shares: 200, dividendPerShare: 4.1, dividendMonths: [3, 9], color: "#facc15" },
];

const initialSavings = [
  { id: 1, name: "変額保険（積立）", amount: 20000, freq: "毎月", icon: "🛡️", growthRate: 4 },
  { id: 2, name: "定額積立", amount: 30000, freq: "毎月", icon: "🏦", growthRate: 2 },
  { id: 3, name: "NISA（つみたて）", amount: 33333, freq: "毎月", icon: "📈", growthRate: 5 },
  { id: 4, name: "iDeCo", amount: 23000, freq: "毎月", icon: "🏛️", growthRate: 4 },
];

const initialFixed = [
  { id: 1, name: "クレジットカード年会費", amount: 11000, freq: "年1回", icon: "💳", monthly: 917 },
  { id: 2, name: "自動車保険", amount: 6800, freq: "毎月", icon: "🚗", monthly: 6800 },
  { id: 3, name: "Netflix", amount: 1490, freq: "毎月", icon: "🎬", monthly: 1490 },
  { id: 4, name: "Spotify", amount: 980, freq: "毎月", icon: "🎵", monthly: 980 },
  { id: 5, name: "スマホ代", amount: 3080, freq: "毎月", icon: "📱", monthly: 3080 },
];

const TABS = ["変動費", "固定支出", "収入・貯金", "株・配当"];

export default function App() {
  const [tab, setTab] = useState("変動費");
  const [fixedTab, setFixedTab] = useState("積立");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [income] = useState(initialIncome);
  const [stocks] = useState(initialStocks);
  const [savings, setSavings] = useState(initialSavings);
  const [fixed, setFixed] = useState(initialFixed);
  const [scanState, setScanState] = useState("idle");
  const [scannedItems, setScannedItems] = useState([]);
  const [newCategory, setNewCategory] = useState({});
  const fileRef = useRef();

  // シミュレーション
  const [monthly, setMonthly] = useState(30000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(20);

  // 追加フォーム
  const [showAddSaving, setShowAddSaving] = useState(false);
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", amount: "", freq: "毎月", icon: "💰", growthRate: 3 });

  const simData = Array.from({ length: years + 1 }, (_, i) => {
    const total = monthly * 12 * i;
    const compound = i === 0 ? 0 : monthly * 12 * ((Math.pow(1 + rate / 100, i) - 1) / (rate / 100));
    return { year: `${i}年後`, 元本: Math.round(total), 運用後: Math.round(compound) };
  });
  const finalAmount = simData[years]?.運用後 ?? 0;

  const currentMonth = "2026-05";
  const currentYear = "2026";

  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const yearlyExpenses = expenses.filter(e => e.date.startsWith(currentYear));

  const totalMonthExpense = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
  const totalYearExpense = yearlyExpenses.reduce((s, e) => s + e.amount, 0);

  const monthCategoryTotals = CATEGORIES.map(cat => ({
    name: cat,
    今月: monthlyExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    今年: yearlyExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.今月 > 0 || c.今年 > 0);

  const categoryTotals = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.value > 0);

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalSavings = savings.reduce((s, i) => s + i.amount, 0);
  const totalFixed = fixed.reduce((s, i) => s + i.monthly, 0);
  const totalFixedAll = totalSavings + totalFixed;
  const savings_amount = totalIncome - totalExpense - totalFixedAll;

  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const dividendByMonth = months.map((m, i) => ({
    month: m,
    amount: stocks.reduce((s, st) => st.dividendMonths.includes(i + 1) ? s + st.shares * st.dividendPerShare : s, 0)
  }));
  const annualDividend = stocks.reduce((s, st) => s + st.shares * st.dividendPerShare * st.dividendMonths.length, 0);

  async function handleScan(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanState("scanning");
    setScannedItems([]);
    const base64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
            { type: "text", text: `このレシートから品目と金額を読み取ってください。以下のJSONのみを返してください（説明不要）:\n{"items":[{"name":"品目名","amount":金額数値,"category":"食費 or 日用品 or 外食 or 交通費 or その他"}]}\nカテゴリは必ず上記5つのどれかにしてください。` }
          ]}]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(c => c.text || "").join("") ?? "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setScannedItems(parsed.items || []);
      const init = {};
      parsed.items.forEach((it, i) => { init[i] = it.category; });
      setNewCategory(init);
      setScanState("done");
    } catch {
      setScannedItems([{ name: "読み取りエラー", amount: 0, category: "その他" }]);
      setScanState("done");
    }
  }

  function addScannedItems() {
    const today = new Date().toISOString().split("T")[0];
    setExpenses(prev => [...prev, ...scannedItems.map((it, i) => ({
      id: Date.now() + i, date: today, item: it.name, amount: it.amount,
      category: newCategory[i] ?? it.category,
    }))]);
    setScanState("idle"); setScannedItems([]);
  }

  function addSavingItem() {
    if (!newItem.name || !newItem.amount) return;
    setSavings(prev => [...prev, { ...newItem, id: Date.now(), amount: Number(newItem.amount), growthRate: Number(newItem.growthRate) }]);
    setNewItem({ name: "", amount: "", freq: "毎月", icon: "💰", growthRate: 3 });
    setShowAddSaving(false);
  }

  function addFixedItem() {
    if (!newItem.name || !newItem.amount) return;
    const amt = Number(newItem.amount);
    const monthly = newItem.freq === "年1回" ? Math.round(amt / 12) : amt;
    setFixed(prev => [...prev, { ...newItem, id: Date.now(), amount: amt, monthly }]);
    setNewItem({ name: "", amount: "", freq: "毎月", icon: "💳", growthRate: 0 });
    setShowAddFixed(false);
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", background: "#0d0d18",
    color: "#e8e8ff", border: "1px solid #2a2a40", borderRadius: 10,
    fontSize: 13, boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d18", color: "#e8e8ff",
      fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
      maxWidth: 480, margin: "0 auto", paddingBottom: 90,
    }}>
      {/* Header */}
      <div style={{
        padding: "28px 20px 16px",
        background: "linear-gradient(160deg, #141428 0%, #0d0d18 100%)",
        borderBottom: "1px solid #1a1a30",
      }}>
        <div style={{ fontSize: 10, color: "#818cf8", letterSpacing: "0.25em", marginBottom: 4 }}>MY FINANCE</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>資産ダッシュボード</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>2026年5月</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
          {[
            { label: "収入", value: `¥${totalIncome.toLocaleString()}`, color: "#4ade80" },
            { label: "支出合計", value: `¥${(totalExpense + totalFixedAll).toLocaleString()}`, color: "#f87171" },
            { label: "手元残高", value: `¥${savings_amount.toLocaleString()}`, color: "#818cf8" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#12122a", borderRadius: 12, padding: "12px 10px", textAlign: "center",
              border: `1px solid ${s.color}22`,
            }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid #1a1a30",
        position: "sticky", top: 0, background: "#0d0d18", zIndex: 10,
        overflowX: "auto",
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flexShrink: 0, padding: "12px 12px", fontSize: 11,
            fontWeight: tab === t ? 700 : 400,
            color: tab === t ? "#818cf8" : "#6b7280",
            background: "none", border: "none",
            borderBottom: tab === t ? "2px solid #818cf8" : "2px solid transparent",
            cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* ===== 変動費 ===== */}
        {tab === "変動費" && (
          <>
            <div style={{
              background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 20,
              border: "1px dashed #818cf844",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📷 レシートをスキャン</div>
              {scanState === "idle" && (
                <>
                  <input type="file" accept="image/*" ref={fileRef} onChange={handleScan} style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()} style={{
                    width: "100%", padding: 12, background: "#818cf822", color: "#818cf8",
                    border: "1px solid #818cf844", borderRadius: 10, fontSize: 13, cursor: "pointer", fontWeight: 600,
                  }}>画像を選択してスキャン</button>
                </>
              )}
              {scanState === "scanning" && (
                <div style={{ textAlign: "center", padding: 20, color: "#818cf8" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                  <div style={{ fontSize: 13 }}>AIが読み取り中...</div>
                </div>
              )}
              {scanState === "done" && (
                <>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>読み取り結果</div>
                  {scannedItems.map((it, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                      background: "#0d0d18", borderRadius: 8, padding: "8px 10px",
                    }}>
                      <div style={{ flex: 1, fontSize: 13 }}>{it.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#facc15" }}>¥{it.amount.toLocaleString()}</div>
                      <select value={newCategory[i] ?? it.category}
                        onChange={e => setNewCategory(prev => ({ ...prev, [i]: e.target.value }))}
                        style={{ background: "#12122a", color: "#e8e8ff", border: "1px solid #2a2a40", borderRadius: 6, padding: "4px 6px", fontSize: 11 }}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => setScanState("idle")} style={{
                      flex: 1, padding: 10, background: "#12122a", color: "#6b7280",
                      border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    }}>キャンセル</button>
                    <button onClick={addScannedItems} style={{
                      flex: 2, padding: 10, background: "#818cf8", color: "#fff",
                      border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}>追加する</button>
                  </div>
                </>
              )}
            </div>

            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>カテゴリ別支出</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryTotals} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {categoryTotals.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `¥${v.toLocaleString()}`} contentStyle={{ background: "#12122a", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categoryTotals.map((c, i) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: "#9ca3af" }}>{c.name}</span>
                    <span style={{ fontWeight: 700 }}>¥{c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 今月 vs 今年 */}
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 20, border: "1px solid #1a1a30" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>今月 vs 今年</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ background: "#0d0d18", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #818cf8" }}>
                  <div style={{ fontSize: 10, color: "#818cf8", marginBottom: 4, letterSpacing: "0.1em" }}>今月</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>¥{totalMonthExpense.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{monthlyExpenses.length}件</div>
                </div>
                <div style={{ background: "#0d0d18", borderRadius: 12, padding: "12px 14px", borderLeft: "3px solid #facc15" }}>
                  <div style={{ fontSize: 10, color: "#facc15", marginBottom: 4, letterSpacing: "0.1em" }}>今年累計</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>¥{totalYearExpense.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{yearlyExpenses.length}件</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>カテゴリ別 今月 vs 今年</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthCategoryTotals} barGap={2} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => `¥${v.toLocaleString()}`} contentStyle={{ background: "#12122a", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="今月" fill="#818cf8" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="今年" fill="#facc1555" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#818cf8" }} /><span style={{ color: "#9ca3af" }}>今月</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#facc1555", border: "1px solid #facc15" }} /><span style={{ color: "#9ca3af" }}>今年</span>
                </div>
              </div>
            </div>

            <div style={{ background: "#12122a", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>変動費明細</div>
              {[...expenses].reverse().map(e => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a30" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.item}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{e.date} · {e.category}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f87171" }}>-¥{e.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== 固定支出 ===== */}
        {tab === "固定支出" && (
          <>
            {/* サマリーカード2枚 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div onClick={() => setFixedTab("積立")} style={{
                background: fixedTab === "積立" ? "#0f2a1a" : "#12122a",
                borderRadius: 16, padding: "14px", cursor: "pointer",
                border: fixedTab === "積立" ? "2px solid #4ade80" : "2px solid #1a1a30",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 10, color: "#4ade80", marginBottom: 6 }}>💰 積立</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80" }}>¥{totalSavings.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>/ 月</div>
                <div style={{ fontSize: 10, color: "#4ade8088", marginTop: 6 }}>資産になる</div>
              </div>
              <div onClick={() => setFixedTab("固定費")} style={{
                background: fixedTab === "固定費" ? "#1f0f10" : "#12122a",
                borderRadius: 16, padding: "14px", cursor: "pointer",
                border: fixedTab === "固定費" ? "2px solid #f87171" : "2px solid #1a1a30",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 10, color: "#f87171", marginBottom: 6 }}>📌 固定費</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f87171" }}>¥{totalFixed.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>/ 月換算</div>
                <div style={{ fontSize: 10, color: "#f8717188", marginTop: 6 }}>戻ってこない</div>
              </div>
            </div>

            {/* 合計バー */}
            <div style={{ background: "#12122a", borderRadius: 12, padding: "12px 14px", marginBottom: 16, border: "1px solid #1a1a30" }}>
              <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ flex: totalSavings, background: "#4ade80", transition: "flex 0.5s" }} />
                <div style={{ flex: totalFixed, background: "#f87171", transition: "flex 0.5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                <span>固定支出 月合計</span>
                <span style={{ fontWeight: 700, color: "#e8e8ff", fontSize: 13 }}>¥{totalFixedAll.toLocaleString()}</span>
              </div>
            </div>

            {/* タブコンテンツ */}
            <div style={{
              background: "#12122a", borderRadius: 16, padding: 16,
              border: `1px solid ${fixedTab === "積立" ? "#4ade8033" : "#f8717133"}`,
              transition: "border-color 0.3s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {fixedTab === "積立" ? "💰 積立一覧" : "📌 固定費一覧"}
                </div>
                <button onClick={() => fixedTab === "積立" ? setShowAddSaving(true) : setShowAddFixed(true)} style={{
                  padding: "5px 12px", fontSize: 11, fontWeight: 600,
                  color: fixedTab === "積立" ? "#4ade80" : "#f87171",
                  background: fixedTab === "積立" ? "#4ade8011" : "#f8717111",
                  border: `1px solid ${fixedTab === "積立" ? "#4ade8033" : "#f8717133"}`,
                  borderRadius: 8, cursor: "pointer",
                }}>+ 追加</button>
              </div>

              {/* 積立リスト */}
              {fixedTab === "積立" && savings.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", borderBottom: i < savings.length - 1 ? "1px solid #1a1a30" : "none",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, background: "#0f2a1a",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{s.freq} · 想定利回り {s.growthRate}%</div>
                    <div style={{ marginTop: 6, height: 3, background: "#1a2a20", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, s.growthRate * 16)}%`, background: "#4ade80", borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#4ade80" }}>¥{s.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>/ 月</div>
                  </div>
                </div>
              ))}

              {/* 積立追加フォーム */}
              {fixedTab === "積立" && showAddSaving && (
                <div style={{ marginTop: 14, padding: 14, background: "#0d0d18", borderRadius: 12, border: "1px solid #4ade8033" }}>
                  <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 10, fontWeight: 700 }}>新しい積立を追加</div>
                  <input placeholder="名前（例：つみたてNISA）" value={newItem.name}
                    onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 8 }} />
                  <input placeholder="金額（円）" type="number" value={newItem.amount}
                    onChange={e => setNewItem(p => ({ ...p, amount: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <select value={newItem.freq} onChange={e => setNewItem(p => ({ ...p, freq: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }}>
                      {["毎月", "年1回", "年2回"].map(f => <option key={f}>{f}</option>)}
                    </select>
                    <input placeholder="利回り%" type="number" value={newItem.growthRate}
                      onChange={e => setNewItem(p => ({ ...p, growthRate: e.target.value }))}
                      style={{ ...inputStyle, flex: 1 }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowAddSaving(false)} style={{
                      flex: 1, padding: 10, background: "#1a1a30", color: "#6b7280",
                      border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    }}>キャンセル</button>
                    <button onClick={addSavingItem} style={{
                      flex: 2, padding: 10, background: "#4ade80", color: "#0d0d18",
                      border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}>追加</button>
                  </div>
                </div>
              )}

              {/* 固定費リスト */}
              {fixedTab === "固定費" && fixed.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0", borderBottom: i < fixed.length - 1 ? "1px solid #1a1a30" : "none",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, background: "#1f0f10",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{
                      display: "inline-block", marginTop: 3, padding: "2px 7px",
                      background: s.freq === "年1回" ? "#7c2d1233" : "#1a1a30",
                      border: `1px solid ${s.freq === "年1回" ? "#f8717144" : "#2a2a40"}`,
                      borderRadius: 4, fontSize: 10,
                      color: s.freq === "年1回" ? "#fca5a5" : "#6b7280",
                    }}>{s.freq}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#f87171" }}>¥{s.amount.toLocaleString()}</div>
                    {s.freq !== "毎月" && (
                      <div style={{ fontSize: 10, color: "#6b7280" }}>月 ¥{s.monthly.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* 固定費追加フォーム */}
              {fixedTab === "固定費" && showAddFixed && (
                <div style={{ marginTop: 14, padding: 14, background: "#0d0d18", borderRadius: 12, border: "1px solid #f8717133" }}>
                  <div style={{ fontSize: 12, color: "#f87171", marginBottom: 10, fontWeight: 700 }}>新しい固定費を追加</div>
                  <input placeholder="名前（例：Amazon Prime）" value={newItem.name}
                    onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 8 }} />
                  <input placeholder="金額（円）" type="number" value={newItem.amount}
                    onChange={e => setNewItem(p => ({ ...p, amount: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 8 }} />
                  <select value={newItem.freq} onChange={e => setNewItem(p => ({ ...p, freq: e.target.value }))}
                    style={{ ...inputStyle, marginBottom: 8 }}>
                    {["毎月", "年1回", "年2回", "年4回"].map(f => <option key={f}>{f}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowAddFixed(false)} style={{
                      flex: 1, padding: 10, background: "#1a1a30", color: "#6b7280",
                      border: "1px solid #2a2a40", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    }}>キャンセル</button>
                    <button onClick={addFixedItem} style={{
                      flex: 2, padding: 10, background: "#f87171", color: "#fff",
                      border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}>追加</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== 収入・貯金 ===== */}
        {tab === "収入・貯金" && (
          <>
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>今月の収支</div>
              {[
                { label: "💰 給与", value: income.filter(i => i.type === "salary").reduce((s, i) => s + i.amount, 0), color: "#4ade80", sign: "+" },
                { label: "📈 配当金", value: income.filter(i => i.type === "dividend").reduce((s, i) => s + i.amount, 0), color: "#a78bfa", sign: "+" },
                { label: "🛒 変動支出", value: totalExpense, color: "#f87171", sign: "-" },
                { label: "📌 積立", value: totalSavings, color: "#4ade8088", sign: "-" },
                { label: "🔒 固定費", value: totalFixed, color: "#f8717188", sign: "-" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #1a1a30" }}>
                  <span style={{ fontSize: 13 }}>{r.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: r.color }}>{r.sign}¥{r.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 0" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>💎 手元に残るお金</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: savings_amount >= 0 ? "#818cf8" : "#f87171" }}>
                  ¥{savings_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>収入明細</div>
              {income.map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a30" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{i.item}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{i.date}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>+¥{i.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* 年間支出サマリー */}
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, border: "1px solid #1a1a30" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>📅 年間支出サマリー</div>

              {/* 変動費 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#818cf8", letterSpacing: "0.12em", marginBottom: 8 }}>変動費</div>
                {CATEGORIES.map(cat => {
                  const amt = yearlyExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                  if (!amt) return null;
                  return (
                    <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a30" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{cat}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>¥{amt.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>変動費 年間合計</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#818cf8" }}>¥{totalYearExpense.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ height: 1, background: "#1a1a30", margin: "4px 0 14px" }} />

              {/* 固定支出 */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#f87171", letterSpacing: "0.12em", marginBottom: 8 }}>固定支出</div>
                {savings.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a30" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{s.icon} {s.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>¥{(s.amount * 12).toLocaleString()}</span>
                  </div>
                ))}
                {fixed.map(f => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a30" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{f.icon} {f.name}</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f87171" }}>
                        {f.freq === "年1回" ? `¥${f.amount.toLocaleString()}` : `¥${(f.monthly * 12).toLocaleString()}`}
                      </div>
                      {f.freq === "年1回" && <div style={{ fontSize: 10, color: "#6b7280" }}>年1回</div>}
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>固定支出 年間合計</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#f87171" }}>¥{(totalFixedAll * 12).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ height: 1, background: "#2a2a40", margin: "4px 0 14px" }} />

              {/* 年間総支出 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>📊 年間支出合計</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#facc15" }}>
                  ¥{(totalYearExpense + totalFixedAll * 12).toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ===== 株・配当 ===== */}
        {tab === "株・配当" && (
          <>
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>年間配当収入</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#a78bfa" }}>¥{annualDividend.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>月平均 ¥{Math.round(annualDividend / 12).toLocaleString()}</div>
            </div>
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>保有株</div>
              {stocks.map(s => (
                <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #1a1a30" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
                          {s.shares}株 · 配当月: {s.dividendMonths.map(m => `${m}月`).join("・")}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>
                        ¥{(s.shares * s.dividendPerShare * s.dividendMonths.length).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>年間配当</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>月別配当スケジュール</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dividendByMonth} barSize={18}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <Tooltip formatter={v => `¥${v.toLocaleString()}`} contentStyle={{ background: "#12122a", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="amount" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 積立シミュレーション（旧 資産シミュタブ） */}
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16, marginBottom: 16, border: "1px solid #818cf833" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>📊 積立シミュレーション</div>
              {[
                { label: "毎月の積立額", value: monthly, setter: setMonthly, min: 1000, max: 100000, step: 5000, disp: `¥${monthly.toLocaleString()}` },
                { label: "年利率", value: rate, setter: setRate, min: 0.1, max: 15, step: 0.5, disp: `${rate}%` },
                { label: "積立期間", value: years, setter: setYears, min: 1, max: 40, step: 1, disp: `${years}年` },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#facc15" }}>{s.disp}</span>
                  </div>
                  <input type="range" min={s.min} max={s.label === "年利率" ? 15 : s.label === "積立期間" ? 40 : 100000}
                    step={s.step} value={s.value}
                    onChange={e => s.setter(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#818cf8" }} />
                </div>
              ))}
              <div style={{ background: "linear-gradient(135deg, #818cf822, #4ade8011)", borderRadius: 12, padding: 16, textAlign: "center", border: "1px solid #818cf833" }}>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{years}年後（年利{rate}%）</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#818cf8" }}>¥{finalAmount.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  元本 ¥{(monthly * 12 * years).toLocaleString()} → 運用益 ¥{(finalAmount - monthly * 12 * years).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ background: "#12122a", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>資産成長グラフ</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={simData.filter((_, i) => i % Math.max(1, Math.floor(years / 8)) === 0 || i === years)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a30" />
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <YAxis tickFormatter={v => `${(v / 10000).toFixed(0)}万`} tick={{ fontSize: 9, fill: "#6b7280" }} />
                  <Tooltip formatter={v => `¥${v.toLocaleString()}`} contentStyle={{ background: "#12122a", border: "1px solid #2a2a40", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="元本" stroke="#6b7280" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="運用後" stroke="#818cf8" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
