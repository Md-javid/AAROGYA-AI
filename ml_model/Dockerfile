# ═══════════════════════════════════════════════
# ELLAURA ML Model — Docker Build
# Python Flask server with LangChain + Scikit
# ═══════════════════════════════════════════════

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -r ellaura && chown -R ellaura:ellaura /app
USER ellaura

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/health')" || exit 1

EXPOSE 5001

CMD ["python", "model_server.py"]
