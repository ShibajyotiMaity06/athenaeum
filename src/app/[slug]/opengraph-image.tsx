import { ImageResponse } from "next/og";
import { getStack, isRolePillarSlug, prettify, slugToTech } from "@/lib/content";
import { ROLE_PILLARS, SITE } from "@/lib/site";

export const runtime = "nodejs";
export const alt = "DevPrep Technical Interview Preparation";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
  } else {
    const tech = slugToTech(slug);
    const stack = getStack(tech);
    if (stack) {
      title = `${stack.name} Interview Questions`;
      subtitle = `${stack.questionCount} Curated Questions across Easy, Medium & Hard`;
      badge = `DEVPREP · ${stack.name.toUpperCase()} CODEX`;
      countLabel = `${stack.questionCount} Questions`;
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
                fontWeight: "900",
                boxShadow: "4px 4px 10px rgba(166,50,60,0.4)"
              }}
            >
              D
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#2d3436",
                letterSpacing: "-0.02em"
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
              fontSize: "56px",
              fontWeight: "900",
              color: "#2d3436",
              lineHeight: 1.1,
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
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#4a5568"
              }}
            >
              EASY · MEDIUM · HARD
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
            devprep.online
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
