import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { getStack, isRolePillarSlug, prettify, slugToTech } from "@/lib/content";
import { ROLE_PILLARS, SITE } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";
  const level = searchParams.get("level") || "";

  let title = "Technical Interview Questions";
  let subtitle = "Systematic preparation organized Easy to Hard";
  let badge = "DEVPREP · TECHNICAL INTERVIEW";
  let countLabel = "3,600+ Questions";

  if (isRolePillarSlug(slug)) {
    const role = ROLE_PILLARS[slug];
    title = role.title;
    subtitle = `${role.techSlugs.length} Core Technologies · Roadmap & Questions`;
    badge = `${role.roleName.toUpperCase()} · INTERVIEW GUIDE`;
    countLabel = `${role.techSlugs.length} Technologies`;
  } else if (slug) {
    const tech = slugToTech(slug);
    const stack = getStack(tech);
    if (stack) {
      if (level) {
        title = `${stack.name} Interview Questions (${level.toUpperCase()})`;
        subtitle = `Complete ${level.toUpperCase()} questions with model answers and code implementations.`;
        badge = `${stack.name.toUpperCase()} · ${level.toUpperCase()} LEVEL`;
        countLabel = `${stack.questionCount} Questions`;
      } else {
        title = `${stack.name} Interview Questions`;
        subtitle = `${stack.questionCount} Curated Questions across Easy, Medium & Hard`;
        badge = `DEVPREP · ${stack.name.toUpperCase()} CODEX`;
        countLabel = `${stack.questionCount} Questions`;
      }
    } else {
      title = `${prettify(slug)} Interview Questions`;
    }
  }

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
              backgroundColor: "#d1d9e6",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "700",
              color: "#4a5568",
              fontFamily: "monospace",
              letterSpacing: "0.1em"
            }}
          >
            {badge}
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "54px",
              fontWeight: "900",
              color: "#2d3436",
              lineHeight: 1.15,
              letterSpacing: "-0.03em"
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#4a5568",
              lineHeight: 1.4,
              maxWidth: "900px"
            }}
          >
            {subtitle}
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
                  backgroundColor: "#2ed573",
                  boxShadow: "0 0 8px #2ed573"
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
              {countLabel}
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
    { width: 1200, height: 630 }
  );
}
