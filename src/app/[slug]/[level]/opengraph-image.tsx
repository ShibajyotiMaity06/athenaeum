import { ImageResponse } from "next/og";
import { getStack, slugToTech } from "@/lib/content";
import { LEVEL_LABELS, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "DevPrep Technical Interview Questions";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function Image({
  params
}: {
  params: Promise<{ slug: string; level: string }>;
}) {
  const { slug, level } = await params;
  const tech = slugToTech(slug);
  const stack = getStack(tech);
  const techName = stack ? stack.name : tech.toUpperCase();
  const levelText = LEVEL_LABELS[level] || level.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#e0e5ec",
          padding: "60px 70px",
          fontFamily: "sans-serif",
          position: "relative"
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#ff4757",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "900"
              }}
            >
              D
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#2d3436"
              }}
            >
              DevPrep
            </span>
          </div>

          <div
            style={{
              padding: "8px 18px",
              backgroundColor: "#ff4757",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              color: "#ffffff",
              fontFamily: "monospace",
              letterSpacing: "0.1em"
            }}
          >
            {level.toUpperCase()} LEVEL QUESTIONS
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "58px",
              fontWeight: "900",
              color: "#2d3436",
              lineHeight: 1.1,
              letterSpacing: "-0.03em"
            }}
          >
            {techName} Interview Questions — {levelText}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#4a5568",
              lineHeight: 1.4
            }}
          >
            Complete questions with model answers and code implementations.
          </div>
        </div>

        {/* Bottom Hardware Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #babecc",
            paddingTop: "24px"
          }}
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "monospace",
                fontSize: "16px",
                fontWeight: "700",
                color: "#2d3436"
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#2ed573"
                }}
              />
              SYSTEM ONLINE
            </div>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "16px",
                fontWeight: "700",
                color: "#ff4757"
              }}
            >
              5 FREE PREVIEW QUESTIONS
            </div>
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#2d3436",
              fontFamily: "monospace"
            }}
          >
            www.devprep.online
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
