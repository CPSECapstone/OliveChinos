clean:
	find . -name "*.pyc" -type f -delete
	find . -name "*.pyo" -type f -delete

init:
	cd ./mycrt/static && npm install && npm run build
	python -m pip install -r requirements.txt

test: clean
	python -m pytest

run:
	python mycrt/server/mycrt.py
