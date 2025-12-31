#!/usr/bin/env python3
import re
import os
from pathlib import Path

root = Path(__file__).resolve().parents[1]
exts = {'.js', '.jsx', '.ts', '.tsx'}

import_line_re = re.compile(r'^\s*import\s+(.*?)\s+from\s+["\'](.*?)["\'];?', re.M)
side_effect_re = re.compile(r'^\s*import\s+["\'](.*?)["\'];?', re.M)

results = {}

for p in root.rglob('*'):
    if p.suffix.lower() in exts:
        text = p.read_text(encoding='utf-8')
        imports = []
        used = []
        # find imports with 'from'
        for m in import_line_re.finditer(text):
            spec = m.group(1).strip()
            src = m.group(2)
            imports.append((m.group(0).strip(), spec, src))
        # find side-effect imports
        for m in side_effect_re.finditer(text):
            if ' from ' not in m.group(0):
                src = m.group(1)
                imports.append((m.group(0).strip(), None, src))

        if not imports:
            continue

        body = text
        # Remove import block for search
        body = re.sub(r'^\s*import[\s\S]*?;\n', '', body, flags=re.M)

        for line,spec,src in imports:
            if spec is None:
                # side-effect import
                used.append(line)
                continue
            # Parse spec
            spec = spec.strip()
            locals = []
            if spec.startswith('{'):
                # named imports
                inner = spec.strip('{}')
                parts = [s.strip() for s in inner.split(',') if s.strip()]
                for part in parts:
                    if ' as ' in part:
                        locals.append(part.split(' as ')[1].strip())
                    else:
                        locals.append(part)
            elif spec.startswith('* as '):
                locals.append(spec.split('* as ')[1].strip())
            else:
                # default import possibly with named: e.g. foo, {a}
                if ',' in spec:
                    first, rest = spec.split(',',1)
                    locals.append(first.strip())
                    inner = rest.strip()
                    if inner.startswith('{'):
                        inner = inner.strip('{}')
                        parts = [s.strip() for s in inner.split(',') if s.strip()]
                        for part in parts:
                            if ' as ' in part:
                                locals.append(part.split(' as ')[1].strip())
                            else:
                                locals.append(part)
                else:
                    locals.append(spec)

            # check usage
            found = False
            for name in locals:
                # search for word boundary occurrences excluding imports
                if re.search(r'\b' + re.escape(name) + r'\b', body):
                    found = True
                    break
                # also check property access for style modules (styles.)
                if re.search(re.escape(name) + r'\s*\.', body):
                    found = True
                    break
            if found:
                used.append(line)

        if used:
            results[str(p.relative_to(root))] = used

# Print results
out_lines = []
for f in sorted(results.keys()):
    out_lines.append(f)
    for imp in results[f]:
        out_lines.append('  ' + imp)
    out_lines.append('')

out = '\n'.join(out_lines)
print(out)
(Path(root)/'used_imports_report.txt').write_text(out, encoding='utf-8')
print('\nReport written to used_imports_report.txt')
