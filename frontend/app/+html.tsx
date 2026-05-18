// @ts-nocheck
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="nl" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ── Junie Design System – Web Shell ── */
              *, *::before, *::after { box-sizing: border-box; }

              html {
                height: 100%;
                background: #E5E5E5;
              }

              body {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: stretch;
                background: #E5E5E5;
              }

              /* Begrens Expo root tot mobiele breedte, gecentreerd met schaduw */
              body > div:first-child {
                position: relative !important;
                width: 100%;
                max-width: 430px;
                height: 100dvh;
                overflow: hidden;
                background: #FFFFFF;
                box-shadow:
                  0 0 0 0.5px rgba(0,0,0,0.12),
                  0 8px 40px rgba(0,0,0,0.18),
                  0 32px 80px rgba(0,0,0,0.12);
              }

              /* Fix tabs en headings */
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }

              /* Verwijder web outline op inputs */
              input:focus, textarea:focus { outline: none !important; }

              /* Junie scrollbar */
              ::-webkit-scrollbar { width: 3px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 2px; }
              ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          background: "#E5E5E5",
        }}
      >
        {children}
      </body>
    </html>
  );
}
