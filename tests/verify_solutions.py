"""Execute all reference solutions against expected console output."""
import contextlib
import io
import json
from pathlib import Path

chapters = json.loads((Path(__file__).parents[1] / 'src' / 'curriculum.json').read_text())
count = 0
for chapter in chapters:
    for lesson in chapter['lessons']:
        if lesson['type'] not in {'exercise', 'project'}:
            continue
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            exec(compile(lesson['solution'], lesson['id'], 'exec'), {'__name__': '__main__'})
        assert output.getvalue().strip() == lesson['expected'].strip(), lesson['id']
        count += 1
assert count == 122, count
print(f'PASS: {count} runnable reference solutions match expected output')
