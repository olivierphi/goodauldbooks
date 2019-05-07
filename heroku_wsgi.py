import sys
from pathlib import Path

# pylint: disable=E0401

django_path = str(Path(__file__).parent / "src")
print(f"************ django_path={django_path}")
sys.path.append(django_path)

import project.wsgi

application = project.wsgi.application
