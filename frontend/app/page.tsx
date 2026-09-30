import { DAY_OPTIONS, fetchPriorities, parseFilters, percent } from "../lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const result = await fetchPriorities(filters, {
    BACKEND_URL: process.env.BACKEND_URL,
    DASHBOARD_API_KEY: process.env.DASHBOARD_API_KEY,
  });

  if (!result.ok) {
    return (
      <main>
        <h1>People&apos;s Priorities</h1>
        <p className="muted">Explainable development priorities from resident reports.</p>
        <div className="error">{result.message}</div>
      </main>
    );
  }

  const data = result.data;
  return (
    <main>
      <h1>People&apos;s Priorities</h1>
      <p className="muted">A transparent view of which needs are being reported across the constituency.</p>

      {data.contains_synthetic_data && (
        <div className="banner"><strong>SYNTHETIC DEMO DATA</strong> — this dashboard uses generated reports and does not represent real residents.</div>
      )}

      <div className="stats">
        <div className="stat">Reports considered<strong>{data.reports_considered}</strong></div>
        <div className="stat">Needs ranked<strong>{data.items.length}</strong></div>
        <div className="stat">Window<strong>{data.window_days} days</strong></div>
      </div>

      <form className="filters" method="get">
        <label>Window
          <select name="days" defaultValue={String(filters.days)}>
            {DAY_OPTIONS.map((days) => <option key={days} value={days}>{days} days</option>)}
          </select>
        </label>
        <label>Ward
          <input name="ward" defaultValue={filters.ward} maxLength={120} placeholder="All wards" />
        </label>
        <button type="submit">Apply filters</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Rank</th><th>Ward</th><th>Need</th><th>Score</th><th>Evidence</th><th>Why it ranks</th></tr></thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={`${item.rank}-${item.ward}-${item.category}`}>
                <td>{item.rank}</td>
                <td>{item.ward}</td>
                <td><strong>{item.category}</strong></td>
                <td><div className="score">{percent(item.score)}%</div><div className="bar"><span style={{ width: `${percent(item.score)}%` }} /></div></td>
                <td>{item.reporters} residents · {item.reports} reports<br />{item.active_days} active days · {item.ward_reporters} in ward</td>
                <td className="breakdown">
                  <div><span>Voice</span><strong>{percent(item.components.voice)}%</strong></div>
                  <div><span>Ward share</span><strong>{percent(item.components.ward_share)}%</strong></div>
                  <div><span>Persistence</span><strong>{percent(item.components.persistence)}%</strong></div>
                  <div><span>Spread</span><strong>{percent(item.components.spread)}%</strong></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer>
        Method: weighted voice, ward share, persistence and spread. Residents are counted once per need.
        Ranks are constituency-wide even when a ward filter is applied. Generated {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(new Date(data.generated_at))}.
      </footer>
    </main>
  );
}
