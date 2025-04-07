FROM python:3.11

# Set timezone
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Corrige os timestamps dos arquivos
RUN find . -type f -exec touch {} +

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]