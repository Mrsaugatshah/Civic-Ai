import { CANVAS_W, CANVAS_H, NEIGHBORHOODS } from "@/services/map/mapService";

/**
 * The calm, neutral base layer of the city map. Roads are light,
 * land is soft, water is clear, and neighborhoods carry subtle
 * boundaries. Issue markers are the visual focus — not this layer.
 * The layout is a stylized Chitwan: the Mahendra Highway running
 * east–west, the Narayani (west) and Rapti (south) rivers, Bis
 * Hazari Tal, and Chitwan National Park along the south.
 */
export function BaseCityMap({ showNeighborhoods = true }) {
  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* land */}
      <rect width={CANVAS_W} height={CANVAS_H} fill="#EEF2F7" />

      {/* neighborhood tints */}
      {showNeighborhoods &&
        NEIGHBORHOODS.map((n) => (
          <polygon key={n.key} points={n.poly.join(" ")} fill="#E8EEF7" opacity="0.7" />
        ))}

      {/* parks — the national park band in the south + small city parks */}
      <g fill="#DCF3E2" stroke="#C6E8D2" strokeWidth="1.5">
        <ellipse cx="590" cy="505" rx="270" ry="88" />
        <ellipse cx="355" cy="180" rx="45" ry="30" />
        <ellipse cx="655" cy="150" rx="38" ry="26" />
        <ellipse cx="760" cy="235" rx="42" ry="28" />
        <ellipse cx="255" cy="330" rx="34" ry="24" />
      </g>

      {/* Narayani river (west edge) */}
      <path
        d="M 150 -30 C 145 140, 200 280, 170 440 C 150 530, 95 590, 30 650"
        fill="none"
        stroke="#CBEAF9"
        strokeWidth="40"
        strokeLinecap="round"
      />
      <path
        d="M 150 -30 C 145 140, 200 280, 170 440 C 150 530, 95 590, 30 650"
        fill="none"
        stroke="#BFE4F7"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M 150 -30 C 145 140, 200 280, 170 440 C 150 530, 95 590, 30 650"
        fill="none"
        stroke="#A8D8F0"
        strokeWidth="3"
        strokeDasharray="14 10"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Rapti river (south, along the national park) */}
      <path
        d="M -30 445 C 180 430, 420 455, 640 443 C 790 435, 900 450, 1030 440"
        fill="none"
        stroke="#CBEAF9"
        strokeWidth="36"
        strokeLinecap="round"
      />
      <path
        d="M -30 445 C 180 430, 420 455, 640 443 C 790 435, 900 450, 1030 440"
        fill="none"
        stroke="#BFE4F7"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <path
        d="M -30 445 C 180 430, 420 455, 640 443 C 790 435, 900 450, 1030 440"
        fill="none"
        stroke="#A8D8F0"
        strokeWidth="3"
        strokeDasharray="14 10"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Bis Hazari Tal (lake) */}
      <ellipse cx="845" cy="330" rx="48" ry="26" fill="#CBEAF9" stroke="#BFE4F7" strokeWidth="2" />

      {/* neighborhood boundaries */}
      {showNeighborhoods &&
        NEIGHBORHOODS.map((n) => (
          <polygon
            key={n.key}
            points={n.poly.join(" ")}
            fill="none"
            stroke="#D5DEEA"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
        ))}

      {/* minor roads */}
      <g stroke="#FFFFFF" strokeWidth="4" opacity="0.95">
        <path d="M -20 210 H 1020" />
        <path d="M -20 365 H 1020" />
        <path d="M -20 500 H 1020" />
        <path d="M 120 -20 V 620" />
        <path d="M 260 -20 V 620" />
        <path d="M 520 -20 V 620" />
        <path d="M 700 -20 V 620" />
        <path d="M 860 -20 V 620" />
      </g>

      {/* main roads (casing + center) */}
      <g fill="none" strokeLinecap="round">
        {/* Mahendra Highway (east–west) */}
        <path d="M -20 300 H 1020" stroke="#E0E7EF" strokeWidth="16" />
        <path d="M -20 300 H 1020" stroke="#FFFFFF" strokeWidth="11" />

        {/* Mugling Road (north to Narayangadh) */}
        <path d="M 445 -20 C 435 120, 475 210, 495 295" stroke="#E0E7EF" strokeWidth="16" />
        <path d="M 445 -20 C 435 120, 475 210, 495 295" stroke="#FFFFFF" strokeWidth="11" />

        {/* Road south to Khairhani + Madi */}
        <path d="M 475 300 V 480" stroke="#E0E7EF" strokeWidth="14" />
        <path d="M 475 300 V 480" stroke="#FFFFFF" strokeWidth="9" />
        <path d="M 480 480 L 615 505" stroke="#E0E7EF" strokeWidth="14" />
        <path d="M 480 480 L 615 505" stroke="#FFFFFF" strokeWidth="9" />

        {/* Road north-west to Fulbari */}
        <path d="M 490 300 C 430 245, 340 195, 265 150" stroke="#E0E7EF" strokeWidth="14" />
        <path d="M 490 300 C 430 245, 340 195, 265 150" stroke="#FFFFFF" strokeWidth="9" />
      </g>

      {/* road labels */}
      <g fill="#B6C1D1" fontSize="12" fontWeight="600">
        <text x="130" y="292">Mahendra Highway</text>
        <text x="430" y="85" transform="rotate(-8 430 85)">Mugling Road</text>
        <text x="505" y="465" transform="rotate(-3 505 465)">Khairhani Road</text>
      </g>

      {/* natural labels */}
      <text x="150" y="290" textAnchor="middle" fill="#7EA6BC" fontSize="12" fontWeight="600" style={{ paintOrder: "stroke" }} stroke="#EEF2F7" strokeWidth="4" transform="rotate(-3 150 290)">
        Narayani
      </text>
      <text x="590" y="432" textAnchor="middle" fill="#7EA6BC" fontSize="12" fontWeight="600" style={{ paintOrder: "stroke" }} stroke="#EEF2F7" strokeWidth="4">
        Rapti River
      </text>
      <text x="590" y="508" textAnchor="middle" fill="#7FB897" fontSize="13" fontWeight="600" style={{ paintOrder: "stroke" }} stroke="#EEF2F7" strokeWidth="4">
        Chitwan National Park
      </text>
      <text x="845" y="326" textAnchor="middle" fill="#7EA6BC" fontSize="11" fontWeight="600" style={{ paintOrder: "stroke" }} stroke="#EEF2F7" strokeWidth="4">
        Bis Hazari Tal
      </text>

      {/* neighborhood labels */}
      {showNeighborhoods &&
        NEIGHBORHOODS.map((n) => (
          <text
            key={n.key}
            x={n.anchor.x}
            y={n.anchor.y}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="14"
            fontWeight="600"
            style={{ paintOrder: "stroke" }}
            stroke="#EEF2F7"
            strokeWidth="4"
          >
            {n.name}
          </text>
        ))}
    </svg>
  );
}
