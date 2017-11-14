clean:
	find . -name "*.pyc" -type f -delete
	find . -name "*.pyo" -type f -delete

init:
	python -m pip install -r requirements.txt

test: clean
	python -m pytest

run:
	python mycrt/server/mycrt.py
