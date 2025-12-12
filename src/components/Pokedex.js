// src/components/Pokedex.js
import React, { useMemo, useState } from "react";
import "./Pokedex.css";
import {
  POKEMON_BASIC,
  POKEMON_DETAILS,
  POKEMON_TYPES,
  TYPE_LABELS_KO,
} from "../data/index";

function Pokedex() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalTab, setModalTab] = useState("info");
  const [movesPage, setMovesPage] = useState(0);

  const getTypeLabelKo = (type) => TYPE_LABELS_KO[type] || type;

  const details = selectedPokemon
    ? POKEMON_DETAILS[selectedPokemon.id] || {}
    : {};

  const filteredPokemon = useMemo(() => {
    const q = query.trim().toLowerCase();

    return POKEMON_BASIC.filter((p) => {
      const matchesQuery =
        !q ||
        p.enName.toLowerCase().includes(q) ||
        p.koName.includes(q) ||
        String(p.id).padStart(3, "0").includes(q);

      if (!matchesQuery) return false;

      if (typeFilter === "All") return true;
      return p.types.includes(typeFilter);
    });
  }, [query, typeFilter]);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}
      >
        포켓몬 도감
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1.5rem" }}>
        영어 이름, 한국어 이름, 도감 번호로 검색하고 타입별로 필터링할 수 있는
        포켓몬 도감입니다.
      </p>

      {/* 검색 & 필터 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="영어 이름 / 한글 이름 / 번호로 검색"
          style={{
            padding: "0.5rem 0.75rem",
            fontSize: "0.9rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: "0.5rem 0.75rem",
            fontSize: "0.9rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            maxWidth: "200px",
          }}
        >
          {POKEMON_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "전체 타입" : getTypeLabelKo(t)}
            </option>
          ))}
        </select>
      </div>

      {/* 그리드 */}
      {filteredPokemon.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          포켓몬을 찾을 수 없습니다. 다른 검색어를 시도해 보세요!
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredPokemon.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPokemon(p);
                setModalTab("info");
                setMovesPage(0);
              }}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <img
                src={p.imageUrl}
                alt={p.koName}
                style={{
                  width: "80px",
                  height: "80px",
                  marginBottom: "0.75rem",
                }}
              />
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#777" }}>
                  #{String(p.id).padStart(3, "0")}
                </div>
                <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                  {p.koName}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#999" }}>
                  {p.enName}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.25rem",
                  marginBottom: "0.5rem",
                }}
              >
                {p.types.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "0.15rem 0.5rem",
                      fontSize: "0.7rem",
                      borderRadius: "999px",
                      border: "1px solid #ccc",
                    }}
                  >
                    {getTypeLabelKo(t)}
                  </span>
                ))}
              </div>

              {p.categoryKo && (
                <div style={{ fontSize: "0.75rem", color: "#666" }}>
                  {p.categoryKo}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 모달 */}
      {selectedPokemon && (
        <div
          onClick={() => setSelectedPokemon(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              maxWidth: "520px",
              width: "90%",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "0.1rem",
                  }}
                >
                  #{String(selectedPokemon.id).padStart(3, "0")}{" "}
                  {selectedPokemon.koName}
                </h2>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#777",
                    margin: 0,
                  }}
                >
                  {selectedPokemon.enName}
                </p>
              </div>
              <button
                onClick={() => setSelectedPokemon(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  marginLeft: "0.5rem",
                }}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 상단: 이미지 + 기본 정보 */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <img
                src={selectedPokemon.imageUrl}
                alt={selectedPokemon.koName}
                style={{ width: "96px", height: "96px" }}
              />
              <div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>타입:</strong>{" "}
                  {selectedPokemon.types
                    .map((t) => getTypeLabelKo(t))
                    .join(", ")}
                </div>
                {selectedPokemon.categoryKo && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>분류:</strong> {selectedPokemon.categoryKo}
                  </div>
                )}
              </div>
            </div>

            {/* 탭 버튼 */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.75rem",
                borderBottom: "1px solid #eee",
                paddingBottom: "0.25rem",
              }}
            >
              {[
                { key: "info", label: "도감" },
                { key: "stats", label: "능력치 / 특성" },
                { key: "moves", label: "기술" },
                { key: "evolution", label: "진화 단계" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setModalTab(tab.key)}
                  style={{
                    border: "none",
                    borderBottom:
                      modalTab === tab.key
                        ? "2px solid #333"
                        : "2px solid transparent",
                    background: "transparent",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    color: modalTab === tab.key ? "#333" : "#888",
                    fontWeight: modalTab === tab.key ? 600 : 400,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 탭 내용 */}
            <div style={{ fontSize: "0.8rem", color: "#444" }}>
              {/* 탭 1: 도감 */}
              {modalTab === "info" && (
                <div>
                  {details.dexEntries && details.dexEntries.length > 0 ? (
                    <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "0.8rem",
                        }}
                      >
                        <tbody>
                          {details.dexEntries.map((entry, idx) => (
                            <tr key={idx}>
                              <td
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  verticalAlign: "top",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {entry.versionLabel}
                              </td>
                              <td
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  lineHeight: 1.5,
                                }}
                              >
                                {entry.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8rem", color: "#777" }}>
                      아직 도감 설명 데이터가 준비되지 않았습니다.
                    </p>
                  )}
                </div>
              )}

              {/* 탭 2: 능력치 / 특성 */}
              {modalTab === "stats" && (
                <div>
                  {details.stats ? (
                    <div style={{ marginBottom: "1rem" }}>
                      {/* stats table */}
                      <table>
                        <tbody>
                          <tr>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              <strong>HP</strong>
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              {details.stats.hp}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              <strong>공격</strong>
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              {details.stats.atk}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              <strong>방어</strong>
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              {details.stats.def}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              <strong>특수공격</strong>
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              {details.stats.spAtk}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              <strong>특수방어</strong>
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              {details.stats.spDef}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              <strong>스피드</strong>
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                              {details.stats.speed}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8rem", color: "#777" }}>
                      아직 능력치 데이터가 준비되지 않았습니다.
                    </p>
                  )}

                  {details.abilities && details.abilities.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          marginBottom: "0.25rem",
                        }}
                      >
                        특성
                      </h3>
                      <ul
                        style={{
                          paddingLeft: "1rem",
                          margin: 0,
                          fontSize: "0.8rem",
                        }}
                      >
                        {details.abilities.map((ab, index) => (
                          <li key={index} style={{ marginBottom: "0.35rem" }}>
                            <div style={{ fontWeight: 600 }}>{ab.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#777" }}>
                              {ab.description}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 탭 3: 기술 */}
              {modalTab === "moves" && (
                <div>
                  {details.levelUpMoves && details.levelUpMoves.length > 0 ? (
                    (() => {
                      const moves = details.levelUpMoves;
                      const pageSize = 6;
                      const totalPages = Math.ceil(moves.length / pageSize);
                      const currentPage =
                        movesPage >= totalPages ? 0 : movesPage;
                      const start = currentPage * pageSize;
                      const pageMoves = moves.slice(start, start + pageSize);

                      return (
                        <>
                          <div
                            style={{
                              maxHeight: "260px",
                              overflowY: "auto",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "0.8rem",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      textAlign: "left",
                                      padding: "0.25rem 0.5rem",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    레벨
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "left",
                                      padding: "0.25rem 0.5rem",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    기술 이름
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "left",
                                      padding: "0.25rem 0.5rem",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    타입
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "left",
                                      padding: "0.25rem 0.5rem",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    분류
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "right",
                                      padding: "0.25rem 0.5rem",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    위력
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "right",
                                      padding: "0.25rem 0.5rem",
                                      borderBottom: "1px solid #eee",
                                    }}
                                  >
                                    명중률
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {pageMoves.map((m, idx) => (
                                  <tr key={idx}>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                      }}
                                    >
                                      {m.level}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                      }}
                                    >
                                      {m.moveKo}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                      }}
                                    >
                                      {getTypeLabelKo(m.type)}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                      }}
                                    >
                                      {m.categoryKo}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                        textAlign: "right",
                                      }}
                                    >
                                      {m.power != null ? m.power : "-"}
                                    </td>
                                    <td
                                      style={{
                                        padding: "0.25rem 0.5rem",
                                        textAlign: "right",
                                      }}
                                    >
                                      {m.accuracy != null
                                        ? `${m.accuracy}%`
                                        : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setMovesPage(
                                  currentPage > 0 ? currentPage - 1 : 0
                                )
                              }
                              disabled={currentPage === 0}
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.8rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                backgroundColor:
                                  currentPage === 0 ? "#f5f5f5" : "#fff",
                                color: currentPage === 0 ? "#aaa" : "#333",
                                cursor:
                                  currentPage === 0 ? "default" : "pointer",
                              }}
                            >
                              이전
                            </button>
                            <div style={{ fontSize: "0.8rem", color: "#777" }}>
                              페이지 {currentPage + 1} / {totalPages}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setMovesPage(
                                  currentPage < totalPages - 1
                                    ? currentPage + 1
                                    : currentPage
                                )
                              }
                              disabled={currentPage >= totalPages - 1}
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.8rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                backgroundColor:
                                  currentPage >= totalPages - 1
                                    ? "#f5f5f5"
                                    : "#fff",
                                color:
                                  currentPage >= totalPages - 1
                                    ? "#aaa"
                                    : "#333",
                                cursor:
                                  currentPage >= totalPages - 1
                                    ? "default"
                                    : "pointer",
                              }}
                            >
                              다음
                            </button>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <p style={{ fontSize: "0.8rem", color: "#777" }}>
                      아직 레벨업 기술 데이터가 준비되지 않았습니다.
                    </p>
                  )}
                </div>
              )}

              {/* 탭 4: 진화 단계 */}
              {modalTab === "evolution" && (
                <div>
                  {details.evolution && details.evolution.length > 0 ? (
                    (() => {
                      const chain = details.evolution;
                      const stageCount = chain.length;
                      const isBranched = stageCount > 3;

                      const getMon = (id) =>
                        POKEMON_BASIC.find((p) => p.id === id);

                      if (!isBranched) {
                        // === Straight-line Layout ===
                        return (
                          <div
                            className={`evo-chain-card stages-${stageCount}`}
                          >
                            {chain.map((ev, idx) => {
                              const mon = getMon(ev.id);
                              if (!mon) return null;
                              const isActive = mon.id === selectedPokemon.id;

                              return (
                                <React.Fragment key={ev.id}>
                                  {idx > 0 && (
                                    <div className="evo-arrow-block">
                                      <div className="evo-arrow-level">
                                        {ev.level ? `Lv. ${ev.level}` : "진화"}
                                      </div>
                                      <div>🍬</div>
                                      <div className="evo-arrow-symbol">→</div>
                                    </div>
                                  )}

                                  <div
                                    className={
                                      "evo-stage evo-stage-clickable" +
                                      (isActive ? " evo-stage-active" : "")
                                    }
                                    onClick={() => {
                                      setSelectedPokemon(mon);
                                      setModalTab("info");
                                      setMovesPage(0);
                                    }}
                                  >
                                    <div className="evo-stage-image">
                                      <img
                                        src={mon.imageUrl}
                                        alt={mon.koName}
                                      />
                                    </div>
                                    <div className="evo-stage-label">
                                      {ev.stageLabel}
                                    </div>
                                    <div className="evo-stage-name-box">
                                      {mon.koName}
                                    </div>
                                    <div className="evo-stage-types">
                                      {mon.types.map((t) => (
                                        <span key={t} className="evo-type-tag">
                                          {getTypeLabelKo(t)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        );
                      }

                      // === Branch Layout ===
                      const base = chain[0];
                      const branches = chain.slice(1);
                      const baseMon = getMon(base.id);

                      return (
                        <div style={{ overflowX: "auto" }}>
                          <div className="evo-branch-card">
                            {baseMon && (
                              <div className="evo-branch-base">
                                <div className="evo-stage-image evo-branch-base-image">
                                  <img
                                    src={baseMon.imageUrl}
                                    alt={baseMon.koName}
                                  />
                                </div>
                                <div className="evo-stage-label">
                                  {base.stageLabel}
                                </div>
                                <div className="evo-stage-name-box evo-branch-base-name">
                                  {baseMon.koName}
                                </div>
                                <div className="evo-stage-types">
                                  {baseMon.types.map((t) => (
                                    <span key={t} className="evo-type-tag">
                                      {getTypeLabelKo(t)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 중간: 조건 + 화살표 줄 */}
                            <div className="evo-branch-conditions-row">
                              {branches.map((ev, idx) => (
                                <div
                                  key={ev.id}
                                  className="evo-branch-condition"
                                >
                                  <div className="evo-branch-condition-text">
                                    {ev.conditionKo ||
                                      (ev.level ? `Lv. ${ev.level}` : "진화")}
                                  </div>
                                  <div className="evo-branch-arrow-down">↓</div>
                                </div>
                              ))}
                            </div>

                            {/* 하단: 여러 진화 형태 */}
                            <div className="evo-branch-targets-row">
                              {branches.map((ev) => {
                                const mon = getMon(ev.id);
                                if (!mon) return null;
                                const isActive = mon.id === selectedPokemon.id;

                                return (
                                  <div
                                    key={ev.id}
                                    className={
                                      "evo-stage evo-stage-clickable evo-branch-target" +
                                      (isActive ? " evo-stage-active" : "")
                                    }
                                    onClick={() => {
                                      setSelectedPokemon(mon);
                                      setModalTab("info");
                                      setMovesPage(0);
                                    }}
                                  >
                                    <div className="evo-stage-image evo-branch-target-image">
                                      <img
                                        src={mon.imageUrl}
                                        alt={mon.koName}
                                      />
                                    </div>
                                    <div className="evo-stage-label">
                                      {ev.stageLabel}
                                    </div>
                                    <div className="evo-stage-name-box">
                                      {mon.koName}
                                    </div>
                                    <div className="evo-stage-types">
                                      {mon.types.map((t) => (
                                        <span key={t} className="evo-type-tag">
                                          {getTypeLabelKo(t)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p style={{ fontSize: "0.8rem", color: "#777" }}>
                      이 포켓몬은 진화 정보가 없습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pokedex;
