import React, { useState, useEffect, useCallback } from 'react';
import {
  TableMeta,
  MongoCollectionMeta,
  SqlLabQuestion,
  AcidSimulationResult,
  SystemTelemetryData,
  VivaGuideData
} from '../types';

interface AcademicCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide';
}

const PRESET_QUERIES = [
  {
    name: '1. Department Overview (dept table)',
    sql: 'SELECT * FROM dept ORDER BY deptno ASC;'
  },
  {
    name: '2. Employee Payroll & Net Compensation (emp table)',
    sql: 'SELECT empno, ename, job, sal, COALESCE(comm, 0) AS comm, (sal + COALESCE(comm, 0)) AS total_comp FROM emp ORDER BY total_comp DESC;'
  },
  {
    name: '3. Relational Join: Employees & Departments (emp + dept)',
    sql: 'SELECT e.empno, e.ename, e.job, e.sal, d.dname, d.loc FROM emp e JOIN dept d ON e.deptno = d.deptno ORDER BY d.dname, e.ename;'
  },
  {
    name: '4. Multi-Warehouse Stock Heatmap (products + inventory)',
    sql: `SELECT p.product_id, p.name AS product_name, c.name AS category_name, p.price,
       SUM(i.quantity) AS total_stock,
       SUM(i.reserved_qty) AS total_reserved,
       SUM(i.quantity - i.reserved_qty) AS available_stock,
       COUNT(DISTINCT i.warehouse_id) AS warehouse_coverage
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN inventory i ON p.product_id = i.product_id
GROUP BY p.product_id, p.name, c.name, p.price
ORDER BY total_stock DESC
LIMIT 8;`
  },
  {
    name: '5. Regional Warehouse Capacity Utilization',
    sql: `SELECT w.warehouse_id, w.name AS warehouse_name, w.location, w.capacity,
       SUM(i.quantity) AS total_units_stored,
       ROUND((SUM(i.quantity)::numeric / w.capacity::numeric) * 100, 2) AS capacity_utilization_pct,
       ROUND(SUM(i.quantity * p.price), 2) AS total_inventory_valuation_usd
FROM warehouses w
JOIN inventory i ON w.warehouse_id = i.warehouse_id
JOIN products p ON i.product_id = p.product_id
GROUP BY w.warehouse_id, w.name, w.location, w.capacity
ORDER BY total_inventory_valuation_usd DESC;`
  },
  {
    name: '6. Customer Lifetime Value (CLV) Analytics',
    sql: `SELECT u.user_id, u.name, u.email, u.role,
       COUNT(o.order_id) AS total_orders,
       COALESCE(ROUND(SUM(o.total_amount), 2), 0) AS lifetime_spend_usd,
       COALESCE(ROUND(AVG(o.total_amount), 2), 0) AS avg_order_val
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.name, u.email, u.role
ORDER BY lifetime_spend_usd DESC;`
  },
  {
    name: '7. Stockout Risk Radar (quantity <= low_stock_threshold)',
    sql: `SELECT p.product_id, p.name AS product_name, w.name AS warehouse_name,
       i.quantity AS on_hand, i.reserved_qty AS reserved,
       (i.quantity - i.reserved_qty) AS net_available,
       i.low_stock_threshold
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE (i.quantity - i.reserved_qty) <= i.low_stock_threshold
ORDER BY net_available ASC;`
  },
  {
    name: '8. Change Data Capture (CDC) Audit Ledger',
    sql: `SELECT it.txn_id, it.txn_type, p.name AS product_name, w.name AS warehouse_name,
       it.delta, it.reference_order_id, it.performed_by, it.created_at
FROM inventory_transactions it
JOIN products p ON it.product_id = p.product_id
JOIN warehouses w ON it.warehouse_id = w.warehouse_id
ORDER BY it.created_at DESC
LIMIT 12;`
  }
];

export const AcademicCommandCenter: React.FC<AcademicCommandCenterProps> = ({
  isOpen,
  onClose,
  defaultTab = 'sql_workbench'
}) => {
  const [activeTab, setActiveTab] = useState<'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide'>(defaultTab);

  // SQL Workbench state
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [isExplain, setIsExplain] = useState<boolean>(false);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // 35 Questions state
  const [questions, setQuestions] = useState<SqlLabQuestion[]>([]);
  const [selectedQuestionCategory, setSelectedQuestionCategory] = useState<string>('ALL');
  const [questionSearch, setQuestionSearch] = useState<string>('');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({});
  const [questionOutputs, setQuestionOutputs] = useState<Record<number, any>>({});
  const [runningQuestionId, setRunningQuestionId] = useState<number | null>(null);

  // Schema & ERD state
  const [schemaTables, setSchemaTables] = useState<TableMeta[]>([]);
  const [mongoCollections, setMongoCollections] = useState<MongoCollectionMeta[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(false);
  const [schemaFilter, setSchemaFilter] = useState<string>('');

  // ACID Simulator state
  const [acidScenario, setAcidScenario] = useState<'commit' | 'rollback' | 'deadlock' | 'isolation'>('commit');
  const [acidResult, setAcidResult] = useState<AcidSimulationResult | null>(null);
  const [isSimulatingAcid, setIsSimulatingAcid] = useState<boolean>(false);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<SystemTelemetryData | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);

  // Viva Guide state
  const [vivaData, setVivaData] = useState<VivaGuideData | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<Record<number, boolean>>({});

  // Switch default tab on prop change
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Load Initial Questions & Viva Guide on Mount
  useEffect(() => {
    if (!isOpen) return;

    // Fetch questions
    fetch('/api/db/sql-lab/questions')
      .then(res => res.json())
      .then(data => {
        if (data.questions) setQuestions(data.questions);
      })
      .catch(err => console.error('Failed to load questions:', err));

    // Fetch telemetry
    fetchTelemetry();

    // Fetch Viva Guide
    fetch('/api/db/viva-defense')
      .then(res => res.json())
      .then(data => setVivaData(data))
      .catch(err => console.error('Failed to load viva guide:', err));

    // Fetch Schema
    fetchSchema();
  }, [isOpen]);

  const fetchTelemetry = useCallback(() => {
    setIsLoadingTelemetry(true);
    fetch('/api/db/telemetry')
      .then(res => res.json())
      .then(data => {
        setTelemetry(data);
        setIsLoadingTelemetry(false);
      })
      .catch(err => {
        console.error('Failed to load telemetry:', err);
        setIsLoadingTelemetry(false);
      });
  }, []);

  const fetchSchema = useCallback(() => {
    setIsLoadingSchema(true);
    fetch('/api/db/schema')
      .then(res => res.json())
      .then(data => {
        if (data.tables) setSchemaTables(data.tables);
        if (data.mongo_collections) setMongoCollections(data.mongo_collections);
        setIsLoadingSchema(false);
      })
      .catch(err => {
        console.error('Failed to load schema:', err);
        setIsLoadingSchema(false);
      });
  }, []);

  // Execute SQL in Workbench
  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecutingSql(true);
    setQueryError(null);
    setQueryResult(null);

    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery, explain: isExplain })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setQueryError(data.error || 'Query execution error');
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setQueryError(err.message || 'Network request failed');
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Run Question from Lab
  const runQuestion = async (qid: number) => {
    setRunningQuestionId(qid);
    try {
      const res = await fetch(`/api/db/sql-lab/run/${qid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explain: false })
      });
      const data = await res.json();
      setQuestionOutputs(prev => ({ ...prev, [qid]: data }));
    } catch (err) {
      console.error('Failed to run question:', err);
    } finally {
      setRunningQuestionId(null);
    }
  };

  // Run ACID Simulation
  const runAcidSimulation = async (scenario: 'commit' | 'rollback' | 'deadlock' | 'isolation') => {
    setIsSimulatingAcid(true);
    setAcidScenario(scenario);
    try {
      const res = await fetch('/api/db/acid-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      setAcidResult(data);
    } catch (err) {
      console.error('Failed to simulate ACID:', err);
    } finally {
      setIsSimulatingAcid(false);
    }
  };

  // Export CSV Helper
  const exportCsv = () => {
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const csvRows = [
      cols.join(','),
      ...queryResult.rows.map((row: any) =>
        cols.map((col: string) => {
          const val = row[col] === null || row[col] === undefined ? '' : String(row[col]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesCat = selectedQuestionCategory === 'ALL' || q.category === selectedQuestionCategory;
    const matchesSearch = questionSearch === '' ||
      q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.sql.toLowerCase().includes(questionSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categoriesList = ['ALL', ...Array.from(new Set(questions.map(q => q.category)))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 animate-fade-in select-none">
      <div className="bg-[#0f172a] text-slate-100 w-full max-w-[1700px] h-[95vh] rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="bg-[#1e293b] px-6 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-lg">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Academic DBMS Command Center & Viva Evaluation Lab
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Course: 25CS1302E (DBS-DBD)
                </span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  KL University • Aziz Nagar
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PostgreSQL Relational ACID Core • MongoDB Polymorphic Catalog • Redis TTL Locks • pgvector Recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-mono text-[11px]">klhdb:5432 (ACTIVE)</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/60 transition"
              title="Close Evaluation Hub"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#0b1324] px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          <button
            onClick={() => setActiveTab('sql_workbench')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg transition border-b-2 ${
              activeTab === 'sql_workbench'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-terminal text-sm"></i>
            <span>SQL Workbench & EXPLAIN</span>
          </button>

          <button
            onClick={() => setActiveTab('lab_questions')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg transition border-b-2 ${
              activeTab === 'lab_questions'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-list-check text-sm"></i>
            <span>35 DBS Lab Questions Runner</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full">35+</span>
          </button>

          <button
            onClick={() => setActiveTab('schema_erd')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg transition border-b-2 ${
              activeTab === 'schema_erd'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-diagram-project text-sm"></i>
            <span>Interactive Schema & ERD</span>
          </button>

          <button
            onClick={() => setActiveTab('acid_lab')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg transition border-b-2 ${
              activeTab === 'acid_lab'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-shield-halved text-sm"></i>
            <span>ACID & Concurrency Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg transition border-b-2 ${
              activeTab === 'telemetry'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-satellite-dish text-sm"></i>
            <span>Architecture & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('viva_guide')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-lg transition border-b-2 ${
              activeTab === 'viva_guide'
                ? 'border-amber-400 text-amber-300 bg-slate-800/80 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <i className="fa-solid fa-chalkboard-user text-sm"></i>
            <span>Professor Viva & Rubric Guide</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#090d16]">
          
          {/* TAB 1: SQL WORKBENCH */}
          {activeTab === 'sql_workbench' && (
            <div className="space-y-4 max-w-[1600px] mx-auto">
              {/* Presets and Controls */}
              <div className="bg-[#131d31] p-4 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                    <i className="fa-solid fa-bolt text-amber-400"></i>
                    Query Preset:
                  </label>
                  <select
                    onChange={(e) => {
                      const found = PRESET_QUERIES.find(p => p.name === e.target.value);
                      if (found) setSqlQuery(found.sql);
                    }}
                    className="w-full bg-[#0b1324] border border-slate-600 rounded-lg text-xs text-white px-3 py-2 focus:ring-1 focus:ring-amber-400"
                  >
                    {PRESET_QUERIES.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExplain}
                      onChange={(e) => setIsExplain(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                    />
                    <span>Generate EXPLAIN (ANALYZE)</span>
                  </label>

                  <button
                    onClick={executeQuery}
                    disabled={isExecutingSql}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-orange-500/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                  >
                    {isExecutingSql ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-play"></i>
                        <span>Execute Query (Ctrl+Enter)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SQL Editor Area */}
              <div className="bg-[#111827] rounded-xl border border-slate-700/80 overflow-hidden shadow-inner">
                <div className="bg-[#1f2937] px-4 py-2 text-xs font-mono text-slate-400 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
                    <span className="ml-2 text-slate-300 font-bold">SQL Editor (PostgreSQL klhdb)</span>
                  </div>
                  <span className="text-[11px]">Press Ctrl + Enter to run</span>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      executeQuery();
                    }
                  }}
                  rows={6}
                  placeholder="Enter PostgreSQL SQL query (SELECT, JOIN, GROUP BY, WINDOW, etc.)..."
                  className="w-full bg-[#0b101d] text-emerald-400 font-mono text-xs p-4 border-none focus:outline-none focus:ring-0 leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Error Alert */}
              {queryError && (
                <div className="bg-red-500/15 border border-red-500/50 p-4 rounded-xl text-xs text-red-200 flex items-start gap-3">
                  <i className="fa-solid fa-triangle-exclamation text-red-400 text-base mt-0.5"></i>
                  <div>
                    <span className="font-bold block mb-1">Query Execution Error:</span>
                    <pre className="font-mono whitespace-pre-wrap">{queryError}</pre>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {queryResult && (
                <div className="space-y-4">
                  {/* Results Header Info */}
                  <div className="flex items-center justify-between bg-[#131d31] px-4 py-2.5 rounded-xl border border-slate-700/80 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Query OK</span>
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-300 font-mono font-semibold">
                        {queryResult.row_count} rows returned
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-amber-300 font-mono">
                        Latency: {queryResult.execution_time_ms} ms
                      </span>
                    </div>

                    <button
                      onClick={exportCsv}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <i className="fa-solid fa-file-csv text-emerald-400"></i>
                      <span>Export to CSV</span>
                    </button>
                  </div>

                  {/* Tabular Data */}
                  <div className="bg-[#111827] rounded-xl border border-slate-700/80 overflow-hidden shadow-lg max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#1f2937] text-slate-300 sticky top-0 border-b border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3 font-mono text-[11px] text-slate-400 w-12 text-center">#</th>
                          {queryResult.columns.map((col: string) => (
                            <th key={col} className="py-2.5 px-3 font-mono text-[11px] font-bold text-amber-300">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {queryResult.rows.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition">
                            <td className="py-2 px-3 text-slate-500 text-center text-[10px]">{idx + 1}</td>
                            {queryResult.columns.map((col: string) => (
                              <td key={col} className="py-2 px-3 text-slate-200">
                                {row[col] === null ? (
                                  <span className="text-slate-500 italic">NULL</span>
                                ) : (
                                  String(row[col])
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* EXPLAIN Plan Tree */}
                  {queryResult.explain_plan && (
                    <div className="bg-[#131d31] p-4 rounded-xl border border-slate-700/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <i className="fa-solid fa-tree"></i>
                        <span>PostgreSQL Execution Plan (EXPLAIN ANALYZE)</span>
                      </div>
                      <pre className="bg-[#0b101d] text-cyan-300 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[250px] border border-slate-800">
                        {JSON.stringify(queryResult.explain_plan, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 35 LAB QUESTIONS RUNNER */}
          {activeTab === 'lab_questions' && (
            <div className="space-y-4 max-w-[1600px] mx-auto">
              {/* Category Pills & Search */}
              <div className="bg-[#131d31] p-4 rounded-xl border border-slate-700/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Category Filter:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-[900px] py-1">
                      {categoriesList.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedQuestionCategory(cat)}
                          className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                            selectedQuestionCategory === cat
                              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative min-w-[260px]">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                    <input
                      type="text"
                      placeholder="Search questions or SQL..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      className="w-full bg-[#0b1324] border border-slate-700 rounded-lg text-xs text-white pl-8 pr-3 py-1.5 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map(q => {
                  const isExpanded = !!expandedSolutions[q.id];
                  const output = questionOutputs[q.id];
                  const isRunning = runningQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="bg-[#111827] rounded-xl border border-slate-700/80 p-4 space-y-3 hover:border-amber-400/50 transition shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold px-2 py-0.5 rounded">
                            Q{q.id}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => setExpandedSolutions(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                            className="text-xs text-slate-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                          >
                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px]`}></i>
                            <span>{isExpanded ? 'Hide Solution SQL' : 'View Solution SQL'}</span>
                          </button>

                          <button
                            onClick={() => runQuestion(q.id)}
                            disabled={isRunning}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition active:scale-95 disabled:opacity-50"
                          >
                            {isRunning ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <span>Running...</span>
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-play text-[10px]"></i>
                                <span>Run Live</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Expandable SQL Solution */}
                        {isExpanded && (
                          <div className="mt-2 bg-[#0b101d] p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 relative">
                            <pre className="whitespace-pre-wrap">{q.sql}</pre>
                            <button
                              onClick={() => {
                                setSqlQuery(q.sql);
                                setActiveTab('sql_workbench');
                              }}
                              className="absolute top-2 right-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                            >
                              Open in Workbench
                            </button>
                          </div>
                        )}

                        {/* Execution Output Drawer */}
                        {output && (
                          <div className="mt-2 bg-[#0b1324] p-3 rounded-lg border border-slate-700 text-xs space-y-2 animate-fade-in">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="text-emerald-400 font-bold">
                                <i className="fa-solid fa-check-circle mr-1"></i>
                                {output.row_count} rows returned
                              </span>
                              <span className="font-mono text-amber-300">{output.execution_time_ms} ms</span>
                            </div>
                            
                            {output.rows && output.rows.length > 0 && (
                              <div className="max-h-[160px] overflow-y-auto font-mono text-[11px] border border-slate-800 rounded">
                                <table className="w-full text-left">
                                  <thead className="bg-[#1f2937] text-slate-300 sticky top-0">
                                    <tr>
                                      {output.columns.slice(0, 5).map((col: string) => (
                                        <th key={col} className="p-1 px-2 text-amber-300 font-bold">{col}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {output.rows.slice(0, 5).map((row: any, rIdx: number) => (
                                      <tr key={rIdx} className="hover:bg-slate-800/40">
                                        {output.columns.slice(0, 5).map((col: string) => (
                                          <td key={col} className="p-1 px-2 text-slate-200">
                                            {String(row[col] ?? 'NULL')}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA & ERD EXPLORER */}
          {activeTab === 'schema_erd' && (
            <div className="space-y-6 max-w-[1600px] mx-auto">
              {/* Controls */}
              <div className="bg-[#131d31] p-4 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-database text-amber-400"></i>
                    PostgreSQL Introspected Relational Tables ({schemaTables.length}) & MongoDB Collections ({mongoCollections.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live relational schema from information_schema with PK/FK constraints, column data types, and document structures.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Filter tables..."
                    value={schemaFilter}
                    onChange={(e) => setSchemaFilter(e.target.value)}
                    className="bg-[#0b1324] border border-slate-700 rounded-lg text-xs text-white px-3 py-1.5 focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={fetchSchema}
                    disabled={isLoadingSchema}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                  >
                    <i className={`fa-solid fa-rotate ${isLoadingSchema ? 'fa-spin' : ''}`}></i>
                    <span>Refresh Schema</span>
                  </button>
                </div>
              </div>

              {/* Table Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schemaTables
                  .filter(t => schemaFilter === '' || t.table_name.toLowerCase().includes(schemaFilter.toLowerCase()))
                  .map(table => (
                    <div
                      key={table.table_name}
                      className="bg-[#111827] rounded-xl border border-slate-700/80 overflow-hidden shadow-md hover:border-amber-400/50 transition flex flex-col"
                    >
                      <div className="bg-[#1e293b] px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-table text-amber-400 text-xs"></i>
                          <span className="font-mono font-bold text-xs text-white">{table.table_name}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-full border border-slate-700">
                          {table.row_count} rows
                        </span>
                      </div>

                      <div className="p-3 divide-y divide-slate-800/60 max-h-[260px] overflow-y-auto text-xs font-mono">
                        {table.columns.map(col => (
                          <div key={col.name} className="py-1.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis">
                              {col.is_pk && (
                                <span className="text-amber-400" title="Primary Key">🔑</span>
                              )}
                              {col.is_fk && (
                                <span className="text-cyan-400" title={`Foreign Key -> ${col.foreign_key?.foreign_table}.${col.foreign_key?.foreign_column}`}>
                                  🔗
                                </span>
                              )}
                              <span className={`font-semibold ${col.is_pk ? 'text-amber-200' : 'text-slate-200'}`}>
                                {col.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {col.type}
                              </span>
                              {!col.nullable && (
                                <span className="text-[9px] text-rose-400" title="NOT NULL">*</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {table.foreign_keys.length > 0 && (
                        <div className="bg-[#0b1324] px-3 py-1.5 border-t border-slate-800 text-[10px] text-cyan-300 font-mono">
                          {table.foreign_keys.map((fk, idx) => (
                            <div key={idx}>
                              ↳ {fk.column} → {fk.foreign_table}.{fk.foreign_column}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* MongoDB Polymorphic Documents */}
              <div className="mt-8 space-y-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-leaf text-emerald-400"></i>
                  MongoDB Polymorphic Document Collections
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mongoCollections.map(col => (
                    <div key={col.collection_name} className="bg-[#111827] rounded-xl border border-slate-700 p-4 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-400">
                          db.{col.collection_name}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {col.document_count} documents
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Sample polymorphic document with dynamic technical attributes:
                      </p>
                      <pre className="bg-[#0b101d] text-cyan-300 p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-[200px] border border-slate-800">
                        {JSON.stringify(col.sample_document, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACID & CONCURRENCY LAB */}
          {activeTab === 'acid_lab' && (
            <div className="space-y-6 max-w-[1600px] mx-auto">
              {/* Scenario Selector */}
              <div className="bg-[#131d31] p-4 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-300 mr-2">Select Scenario:</span>
                  {[
                    { id: 'commit', label: 'TC06: Atomic Checkout (Commit)', icon: 'fa-check' },
                    { id: 'rollback', label: 'TC07: Concurrency Oversell (Rollback)', icon: 'fa-rotate-left' },
                    { id: 'deadlock', label: 'TC08: Distributed Deadlock Backoff', icon: 'fa-arrows-split-up-and-left' },
                    { id: 'isolation', label: 'SQL Isolation Levels Matrix', icon: 'fa-layer-group' }
                  ].map(sc => (
                    <button
                      key={sc.id}
                      onClick={() => runAcidSimulation(sc.id as any)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-2 transition ${
                        acidScenario === sc.id
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <i className={`fa-solid ${sc.icon}`}></i>
                      <span>{sc.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => runAcidSimulation(acidScenario)}
                  disabled={isSimulatingAcid}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <i className={`fa-solid fa-play ${isSimulatingAcid ? 'fa-spin' : ''}`}></i>
                  <span>Simulate Live</span>
                </button>
              </div>

              {/* Simulation Result */}
              {acidResult && (
                <div className="space-y-6 animate-fade-in">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    acidResult.result_status === 'COMMITTED'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : acidResult.result_status === 'ROLLED_BACK'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-blue-500/15 border-blue-500/40 text-blue-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {acidResult.result_status === 'COMMITTED' ? '✅' : acidResult.result_status === 'ROLLED_BACK' ? '⚠️' : 'ℹ️'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{acidResult.title}</h4>
                        <p className="text-xs opacity-80 mt-0.5">
                          Status: <span className="font-mono font-bold">{acidResult.result_status}</span> • Duration: {acidResult.total_latency_ms} ms
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACID Guarantees Cards */}
                  {acidResult.acid_guarantees && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {Object.entries(acidResult.acid_guarantees).map(([pillar, desc]) => (
                        <div key={pillar} className="bg-[#111827] rounded-xl border border-slate-700/80 p-4 space-y-2">
                          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                            {pillar}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Transaction Timeline */}
                  {acidResult.timeline && (
                    <div className="bg-[#111827] rounded-xl border border-slate-700/80 p-5 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <i className="fa-solid fa-timeline text-amber-400"></i>
                        <span>Transaction Step Timeline</span>
                      </h4>

                      <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                        {acidResult.timeline.map((step) => (
                          <div key={step.step} className="relative space-y-1 bg-[#1e293b]/60 p-3 rounded-lg border border-slate-700/60">
                            <span className="absolute -left-6 top-3 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#111827]"></span>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-white flex items-center gap-2">
                                <span className="text-slate-400 font-mono">#{step.step}</span>
                                {step.name}
                              </span>
                              <span className="text-[10px] font-mono text-amber-300">+{step.timestamp} ms</span>
                            </div>
                            <p className="text-xs text-slate-300">{step.description}</p>
                            <pre className="font-mono text-[11px] bg-[#0b101d] text-emerald-300 p-2 rounded border border-slate-800 mt-1">
                              {step.sql}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Isolation Matrix */}
                  {acidResult.matrix && (
                    <div className="bg-[#111827] rounded-xl border border-slate-700/80 overflow-hidden shadow-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#1f2937] text-amber-300 border-b border-slate-700">
                          <tr>
                            <th className="p-3 font-bold">SQL Isolation Level</th>
                            <th className="p-3 font-bold">Dirty Reads</th>
                            <th className="p-3 font-bold">Non-Repeatable Reads</th>
                            <th className="p-3 font-bold">Phantom Reads</th>
                            <th className="p-3 font-bold">PostgreSQL Implementation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {acidResult.matrix.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-white">{row.level}</td>
                              <td className="p-3">{row.dirty_reads}</td>
                              <td className="p-3">{row.non_repeatable_reads}</td>
                              <td className="p-3">{row.phantom_reads}</td>
                              <td className="p-3 text-slate-300">{row.pg_implementation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6 max-w-[1600px] mx-auto">
              <div className="flex items-center justify-between bg-[#131d31] p-4 rounded-xl border border-slate-700">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-satellite-dish text-cyan-400"></i>
                    Polyglot Persistence Architecture & Real-Time Telemetry
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live telemetry across PostgreSQL, MongoDB, Redis, and pgvector.
                  </p>
                </div>
                <button
                  onClick={fetchTelemetry}
                  disabled={isLoadingTelemetry}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition active:scale-95"
                >
                  <i className={`fa-solid fa-rotate ${isLoadingTelemetry ? 'fa-spin' : ''}`}></i>
                  <span>Refresh Telemetry</span>
                </button>
              </div>

              {telemetry && (
                <div className="space-y-6">
                  {/* Polyglot Nodes Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {telemetry.polyglot_nodes.map(node => (
                      <div key={node.id} className="bg-[#111827] rounded-xl border border-slate-700 p-4 space-y-2 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{node.name}</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {node.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                          {node.type}
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed">{node.role}</p>
                      </div>
                    ))}
                  </div>

                  {/* Engine Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Postgres Card */}
                    <div className="bg-[#111827] rounded-xl border border-slate-700 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <i className="fa-solid fa-database"></i>
                        <span>PostgreSQL Relational Ledger</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Database:</span>
                          <span className="text-white font-bold">{telemetry.postgres.database_name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Database Size:</span>
                          <span className="text-emerald-400 font-bold">{telemetry.postgres.database_size || '11 MB'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Active Connections:</span>
                          <span className="text-cyan-400 font-bold">{telemetry.postgres.active_connections ?? 2}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Transactions Committed:</span>
                          <span className="text-emerald-300 font-bold">{telemetry.postgres.transactions_committed ?? 450}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Vector Search (pgvector):</span>
                          <span className="text-emerald-400 font-bold">READY (384-Dim)</span>
                        </div>
                      </div>
                    </div>

                    {/* Mongo Card */}
                    <div className="bg-[#111827] rounded-xl border border-slate-700 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <i className="fa-solid fa-leaf"></i>
                        <span>MongoDB Document Store</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Database:</span>
                          <span className="text-white font-bold">{telemetry.mongo.database_name}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Storage Engine:</span>
                          <span className="text-amber-400 font-bold">{telemetry.mongo.storage_engine}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Collections:</span>
                          <span className="text-cyan-400 font-bold">{telemetry.mongo.collections_count ?? 1}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Data Size:</span>
                          <span className="text-emerald-300 font-bold">{telemetry.mongo.data_size_kb ?? 83.4} KB</span>
                        </div>
                      </div>
                    </div>

                    {/* Redis Card */}
                    <div className="bg-[#111827] rounded-xl border border-slate-700 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                        <i className="fa-solid fa-bolt"></i>
                        <span>Redis-Compatible Lock & Cache</span>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">TTL Lock Window:</span>
                          <span className="text-white font-bold">{telemetry.redis.ttl_lock_window_seconds}s (10 min)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Active Keys:</span>
                          <span className="text-cyan-400 font-bold">{telemetry.redis.stats?.cached_keys_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Active Reservation Locks:</span>
                          <span className="text-amber-400 font-bold">{telemetry.redis.stats?.active_reservation_locks_count ?? 0}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Eviction Policy:</span>
                          <span className="text-emerald-400 font-bold">{telemetry.redis.keyspace_eviction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: VIVA GUIDE */}
          {activeTab === 'viva_guide' && vivaData && (
            <div className="space-y-8 max-w-[1600px] mx-auto">
              {/* Team Members */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-users"></i>
                  <span>Team Members & DBS-DBD Engineering Assignments</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vivaData.team.map(member => (
                    <div key={member.id} className="bg-[#111827] rounded-xl border border-slate-700/80 p-4 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-amber-300">{member.id}</span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {member.role}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{member.focus}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-Minute Professor Demo Flow */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-list-ol"></i>
                  <span>5-Minute Professor Viva Demo Flow (Matches Presentation Slide 10)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {vivaData.demo_flow_steps.map(step => (
                    <div key={step.step} className="bg-[#111827] rounded-xl border border-slate-700/80 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                          {step.step}
                        </span>
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Literature Review Comparison Matrix */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-book-bookmark"></i>
                  <span>Literature Review Comparison Matrix & Novelty (Review 2 Slide 3)</span>
                </h3>
                <div className="bg-[#111827] rounded-xl border border-slate-700/80 overflow-hidden shadow-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#1f2937] text-amber-300 border-b border-slate-700">
                      <tr>
                        <th className="p-3 font-bold">Study & Author</th>
                        <th className="p-3 font-bold">Database Stack</th>
                        <th className="p-3 font-bold">Main Feature</th>
                        <th className="p-3 font-bold text-emerald-400">Advantage</th>
                        <th className="p-3 font-bold text-rose-400">Identified Limitation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {vivaData.literature_comparison.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-white">{row.study}</td>
                          <td className="p-3 font-mono text-cyan-300">{row.tech}</td>
                          <td className="p-3 text-slate-300">{row.feature}</td>
                          <td className="p-3 text-emerald-300">{row.advantage}</td>
                          <td className="p-3 text-rose-300">{row.limitation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Viva Defense FAQ */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-circle-question"></i>
                  <span>Expected Professor Viva Questions & Technical Answers</span>
                </h3>
                <div className="space-y-3">
                  {vivaData.viva_faq.map((item, idx) => {
                    const isFaqOpen = !!expandedFaq[idx];
                    return (
                      <div key={idx} className="bg-[#111827] rounded-xl border border-slate-700 overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                        >
                          <span className="font-bold text-xs text-white flex items-center gap-2">
                            <span className="text-amber-400 font-mono">Q{idx + 1}.</span>
                            {item.question}
                          </span>
                          <i className={`fa-solid fa-chevron-${isFaqOpen ? 'up' : 'down'} text-slate-400 text-xs`}></i>
                        </button>
                        {isFaqOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-[#0b1324]">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
