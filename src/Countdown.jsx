import React, { useState, useEffect, useMemo } from "react";
import countries from "./data/countries_200.json";
import "./CountdownPage.css";

const globalTargetTime = new Date("2025-07-05T04:18:00+08:00").getTime();

export default function CountdownPage() {
  const [globalTimeLeft, setGlobalTimeLeft] = useState(
    globalTargetTime - Date.now()
  );
  const [localTimes, setLocalTimes] = useState({});
  const [localCountdowns, setLocalCountdowns] = useState({});
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name"); // "name", "timezone", "earliest", "latest"

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalTimeLeft(globalTargetTime - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function updateLocalInfo() {
      const now = new Date();
      const newLocalTimes = {};
      const newLocalCountdowns = {};

      countries.forEach(({ timezone }) => {
        const timeStr = new Intl.DateTimeFormat("zh-TW", {
          hour12: false,
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(now);
        newLocalTimes[timezone] = timeStr;

        const localTarget = new Date(
          new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date("2025-07-05")) + "T04:18:00"
        );

        const diff = localTarget.getTime() - now.getTime();
        newLocalCountdowns[timezone] = diff;
      });

      setLocalTimes(newLocalTimes);
      setLocalCountdowns(newLocalCountdowns);
    }

    updateLocalInfo();
    const interval = setInterval(updateLocalInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const d = Math.floor(globalTimeLeft / (1000 * 60 * 60 * 24));
  const h = Math.floor(
    (globalTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const m = Math.floor((globalTimeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((globalTimeLeft % (1000 * 60)) / 1000);

  function formatCountdown(ms) {
    if (ms === undefined || ms < 0) return "--";
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${d}天 ${h}時 ${m}分 ${s}秒`;
  }

  const filteredAndSortedCountries = useMemo(() => {
    let filtered = countries.filter(
      ({ name, capital }) =>
        name.toLowerCase().includes(search.toLowerCase()) ||
        capital.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortKey === "timezone") {
        return a.timezone.localeCompare(b.timezone);
      } else if (sortKey === "earliest") {
        // localCountdowns 是毫秒差，剩餘時間短的排前
        return (
          (localCountdowns[a.timezone] ?? Infinity) -
          (localCountdowns[b.timezone] ?? Infinity)
        );
      } else if (sortKey === "latest") {
        // 剩餘時間長的排前
        return (
          (localCountdowns[b.timezone] ?? -Infinity) -
          (localCountdowns[a.timezone] ?? -Infinity)
        );
      }
      return 0;
    });

    return filtered;
  }, [search, sortKey, localCountdowns]);

  return (
    <div className="countdown-container">
      <h1 className="countdown-title">🌏 全球統一倒數（以台灣時間為基準）</h1>
      <div className="countdown-timer">
        <div className="time-unit">
          <div className="time-digit">{d}</div>
          <div className="time-label">天</div>
        </div>
        <div className="time-unit">
          <div className="time-digit">{h}</div>
          <div className="time-label">小時</div>
        </div>
        <div className="time-unit">
          <div className="time-digit">{m}</div>
          <div className="time-label">分鐘</div>
        </div>
        <div className="time-unit">
          <div className="time-digit">{s}</div>
          <div className="time-label">秒</div>
        </div>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="搜尋國家或首都"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", width: "200px", marginRight: "1rem" }}
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="name">依國家排序</option>
          <option value="timezone">依時區排序</option>
          <option value="earliest">依當地倒數最早（剩餘時間最少）</option>
          <option value="latest">依當地倒數最晚（剩餘時間最多）</option>
        </select>
      </div>

      <h2 className="city-times-title">🌍 各國當地時間 & 當地倒數</h2>
      <div className="city-times-container">
        {filteredAndSortedCountries.map(
          ({ name, capital, timezone, flag }, idx) => (
            <div key={`${timezone}-${name}-${idx}`} className="city-time-item">
              <span className="flag">{flag}</span>
              <span className="city-name">
                {name} {capital}
              </span>
              <span className="local-time">
                🕒 {localTimes[timezone] || "--:--:--"}
              </span>
              <span className="local-countdown">
                ⏳ {formatCountdown(localCountdowns[timezone])}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
