FROM docker.arvancloud.ir/python:3.10.15-alpine3.20

WORKDIR /app

RUN pip install "fastapi[standard]"

COPY . .

ENV API_URL="ws://localhost:8000"

EXPOSE 8000

CMD ["fastapi", "run", "main.py", "--port", "80"]