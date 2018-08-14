import sys
from pathlib import Path

# pylint: disable=E0401

# We have a git monolith, where the Django app is not at the root of the repository:
# let's first append our Django ap path to the Python path:
django_path = str(Path(__file__).parent  / 'server' / 'api' / 'django')
print(f"************ django_path={django_path}")
sys.path.append(django_path)

import project.wsgi

application = project.wsgi.application
