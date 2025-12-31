#!/usr/bin/env python3
from pathlib import Path
p = Path(__file__).resolve().parents[1]
report = p / 'used_imports_report.txt'
text = report.read_text(encoding='utf-8')
lines = text.splitlines()
keep = []
for i,line in enumerate(lines):
    if not line.strip():
        continue
    if line.startswith('src/') or line in ('eslint.config.js','firebase.js','vite.config.js','package.json'):
        keep.append(line)
        # append following indented import lines
        j = i+1
        while j < len(lines) and lines[j].startswith('  '):
            keep.append(lines[j])
            j += 1

out = '\n'.join(keep)
(Path(p)/'used_imports_report_filtered.txt').write_text(out, encoding='utf-8')
print('Wrote filtered report to used_imports_report_filtered.txt')
