FROM python:3.9
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=app.py
ENV FLASK_DEBUG=0
RUN pip install gunicorn==20.1.0 eventlet==0.30.2
CMD ["gunicorn","--worker-class","eventlet","-w","1","-b","0.0.0.0:8000","app:app"]