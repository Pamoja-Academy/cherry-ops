const fs = require("fs");
const path = require("path");

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      let s = fs.readFileSync(p, "utf8");
      const o = s;
      s = s.replaceAll('background: "#fff"', 'background: "#111"');
      s = s.replaceAll("background: '#fff'", "background: '#111'");
      s = s.replaceAll('borderColor: "#E4D8D1"', 'borderColor: "rgba(255,255,255,0.1)"');
      s = s.replaceAll('color: "#1A1214"', 'color: "#f5f5f5"');
      s = s.replaceAll('color: "#8C8078"', 'color: "rgba(255,255,255,0.45)"');
      s = s.replaceAll('background: "#F3EBE7"', 'background: "#1a1a1a"');
      s = s.replaceAll(
        'borderBottom: "1px solid #E4D8D1"',
        'borderBottom: "1px solid rgba(255,255,255,0.1)"'
      );
      s = s.replaceAll('borderColor: "#E4D8D1"', 'borderColor: "rgba(255,255,255,0.1)"');
      if (s !== o) {
        fs.writeFileSync(p, s);
        console.log("updated", p);
      }
    }
  }
}

walk("src/app/(dashboard)");
walk("src/components/autopilot");
